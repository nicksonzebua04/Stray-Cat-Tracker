<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

$isSecure = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off';
session_set_cookie_params([
    'httponly' => true,
    'secure' => $isSecure,
    'samesite' => 'Strict',
]);
session_start();

final class ApiError extends RuntimeException
{
    public int $status;

    public function __construct(string $message, int $status = 400)
    {
        parent::__construct($message);
        $this->status = $status;
    }
}

function respond(int $status, array $payload): void
{
    http_response_code($status);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function requestData(): array
{
    if (isset($_POST) && count($_POST) > 0) {
        return $_POST;
    }

    $raw = file_get_contents('php://input');
    if ($raw === false || $raw === '') {
        return [];
    }

    $decoded = json_decode($raw, true);
    if (!is_array($decoded)) {
        throw new ApiError('Format data tidak valid.');
    }
    return $decoded;
}

function storageFile(): string
{
    return dirname(__DIR__) . DIRECTORY_SEPARATOR . 'pantau-kucing-data' . DIRECTORY_SEPARATOR . 'store.json';
}

function accessStore(bool $write, ?callable $update = null): array
{
    $directory = dirname(storageFile());
    if (!is_dir($directory) && !mkdir($directory, 0700, true) && !is_dir($directory)) {
        throw new RuntimeException('Folder penyimpanan aplikasi tidak dapat dibuat.');
    }

    $handle = fopen(storageFile(), 'c+');
    if ($handle === false) {
        throw new RuntimeException('Penyimpanan aplikasi tidak dapat dibuka.');
    }

    try {
        if (!flock($handle, $write ? LOCK_EX : LOCK_SH)) {
            throw new RuntimeException('Penyimpanan aplikasi sedang tidak tersedia.');
        }

        rewind($handle);
        $contents = stream_get_contents($handle);
        if ($contents === false) {
            throw new RuntimeException('Data aplikasi tidak dapat dibaca.');
        }

        $data = $contents === '' ? ['users' => [], 'reports' => [], 'care_logs' => []] : json_decode($contents, true);
        if (!is_array($data) || !isset($data['users'], $data['reports'], $data['care_logs'])) {
            throw new RuntimeException('Data penyimpanan rusak; periksa file store.json.');
        }

        if ($write) {
            $data = $update($data);
            $encoded = json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT);
            if ($encoded === false) {
                throw new RuntimeException('Data aplikasi tidak dapat disimpan.');
            }
            rewind($handle);
            if (!ftruncate($handle, 0)) {
                throw new RuntimeException('Data aplikasi tidak dapat disimpan.');
            }
            $offset = 0;
            $length = strlen($encoded);
            while ($offset < $length) {
                $written = fwrite($handle, substr($encoded, $offset));
                if ($written === false || $written === 0) {
                    throw new RuntimeException('Data aplikasi tidak dapat disimpan.');
                }
                $offset += $written;
            }
            if (!fflush($handle)) {
                throw new RuntimeException('Data aplikasi tidak dapat disimpan.');
            }
        }
        flock($handle, LOCK_UN);
        return $data;
    } finally {
        fclose($handle);
    }
}

function cleanText($value, int $maxLength = 500): string
{
    if (!is_string($value)) {
        return '';
    }
    $value = trim($value);
    return function_exists('mb_substr') ? mb_substr($value, 0, $maxLength) : substr($value, 0, $maxLength);
}

function currentUser(): ?array
{
    return isset($_SESSION['user_id']) ? [
        'id' => (string) $_SESSION['user_id'],
        'name' => (string) $_SESSION['user_name'],
        'email' => (string) $_SESSION['user_email'],
    ] : null;
}

function requireUser(): array
{
    $user = currentUser();
    if ($user === null) {
        throw new ApiError('Silakan masuk terlebih dahulu.', 401);
    }
    return $user;
}

function requireCsrf(array $input): void
{
    $provided = $_SERVER['HTTP_X_CSRF_TOKEN'] ?? ($input['_csrf'] ?? '');
    if (!is_string($provided) || !isset($_SESSION['csrf']) || !hash_equals($_SESSION['csrf'], $provided)) {
        throw new ApiError('Sesi keamanan kedaluwarsa. Muat ulang halaman lalu coba kembali.', 419);
    }
}

function requireMethod(string $method): void
{
    if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== $method) {
        header('Allow: ' . $method);
        throw new ApiError('Metode permintaan tidak diizinkan.', 405);
    }
}

function publicReport(array $report): array
{
    unset($report['contact']);
    return $report;
}

function savePhoto(): ?string
{
    if (!isset($_FILES['photo']) || $_FILES['photo']['error'] === UPLOAD_ERR_NO_FILE) {
        return null;
    }
    $upload = $_FILES['photo'];
    if ($upload['error'] !== UPLOAD_ERR_OK || $upload['size'] > 5 * 1024 * 1024 || !is_uploaded_file($upload['tmp_name'])) {
        throw new ApiError('Foto gagal diunggah atau ukurannya melebihi 5 MB.');
    }

    $imageInfo = getimagesize($upload['tmp_name']);
    $finfo = finfo_open(FILEINFO_MIME_TYPE);
    $mime = $finfo === false ? '' : finfo_file($finfo, $upload['tmp_name']);
    if ($finfo !== false) {
        finfo_close($finfo);
    }
    $extensions = ['image/jpeg' => 'jpg', 'image/png' => 'png', 'image/webp' => 'webp'];
    if ($imageInfo === false || !isset($extensions[$mime])) {
        throw new ApiError('Format foto harus JPG, PNG, atau WebP.');
    }

    $directory = __DIR__ . DIRECTORY_SEPARATOR . 'uploads';
    if (!is_dir($directory) && !mkdir($directory, 0755, true) && !is_dir($directory)) {
        throw new RuntimeException('Folder foto tidak dapat dibuat.');
    }
    $filename = bin2hex(random_bytes(16)) . '.' . $extensions[$mime];
    if (!move_uploaded_file($upload['tmp_name'], $directory . DIRECTORY_SEPARATOR . $filename)) {
        throw new RuntimeException('Foto tidak dapat disimpan.');
    }
    return 'uploads/' . $filename;
}

function validateReport(array $input, array $existing = []): array
{
    $catName = cleanText($input['cat_name'] ?? ($existing['cat_name'] ?? ''), 80);
    $location = cleanText($input['location'] ?? ($existing['location'] ?? ''), 180);
    $condition = cleanText($input['condition'] ?? ($existing['condition'] ?? 'sehat'), 30);
    $allowedConditions = ['sehat', 'lapar', 'luka', 'anak_tanpa_induk', 'jinak_adopsi', 'sudah_makan', 'steril'];
    if ($location === '') {
        throw new ApiError('Lokasi kucing wajib diisi.');
    }
    if (!in_array($condition, $allowedConditions, true)) {
        throw new ApiError('Kondisi kucing tidak valid.');
    }
    return [
        'cat_name' => $catName !== '' ? $catName : 'Kucing sekitar',
        'location' => $location,
        'color' => cleanText($input['color'] ?? ($existing['color'] ?? 'lainnya'), 40),
        'age' => cleanText($input['age'] ?? ($existing['age'] ?? 'dewasa'), 40),
        'condition' => $condition,
        'reporter' => cleanText($input['reporter'] ?? ($existing['reporter'] ?? ''), 80),
        'contact' => cleanText($input['contact'] ?? ($existing['contact'] ?? ''), 40),
        'description' => cleanText($input['description'] ?? ($existing['description'] ?? ''), 1000),
    ];
}

function findOwnedRecord(array $records, string $id, string $userId): int
{
    foreach ($records as $index => $record) {
        if (($record['id'] ?? '') === $id && ($record['user_id'] ?? '') === $userId) {
            return $index;
        }
    }
    throw new ApiError('Data tidak ditemukan atau Anda tidak memiliki akses.', 404);
}

try {
    $action = cleanText($_GET['action'] ?? '', 40);
    $input = requestData();
    $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

    if ($action === 'me' && $method === 'GET') {
        if (!isset($_SESSION['csrf'])) {
            $_SESSION['csrf'] = bin2hex(random_bytes(32));
        }
        respond(200, ['user' => currentUser(), 'csrf' => $_SESSION['csrf']]);
    }

    if (in_array($action, ['register', 'login', 'logout', 'profile', 'reports.create', 'reports.update', 'reports.delete', 'care.create', 'care.update', 'care.delete'], true)) {
        requireCsrf($input);
    }

    if ($action === 'register') {
        requireMethod('POST');
        $name = cleanText($input['name'] ?? '', 80);
        $email = strtolower(cleanText($input['email'] ?? '', 190));
        $password = $input['password'] ?? '';
        if ($name === '' || !filter_var($email, FILTER_VALIDATE_EMAIL) || !is_string($password) || strlen($password) < 8 || strlen($password) > 200) {
            throw new ApiError('Isi nama dan email yang valid; kata sandi harus 8–200 karakter.');
        }
        accessStore(true, function (array $data) use ($name, $email, $password): array {
            foreach ($data['users'] as $existing) {
                if ($existing['email'] === $email) {
                    throw new ApiError('Email sudah terdaftar.', 409);
                }
            }
            $user = ['id' => bin2hex(random_bytes(16)), 'name' => $name, 'email' => $email, 'password' => password_hash($password, PASSWORD_DEFAULT)];
            $data['users'][] = $user;
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['user_name'] = $user['name'];
            $_SESSION['user_email'] = $user['email'];
            return $data;
        });
        session_regenerate_id(true);
        $_SESSION['csrf'] = bin2hex(random_bytes(32));
        respond(201, ['user' => currentUser(), 'csrf' => $_SESSION['csrf']]);
    }

    if ($action === 'login') {
        requireMethod('POST');
        $email = strtolower(cleanText($input['email'] ?? '', 190));
        $password = $input['password'] ?? '';
        $data = accessStore(false);
        $matched = null;
        foreach ($data['users'] as $user) {
            if ($user['email'] === $email && is_string($password) && password_verify($password, $user['password'])) {
                $matched = $user;
                break;
            }
        }
        if ($matched === null) {
            throw new ApiError('Email atau kata sandi tidak sesuai.', 401);
        }
        session_regenerate_id(true);
        $_SESSION['user_id'] = $matched['id'];
        $_SESSION['user_name'] = $matched['name'];
        $_SESSION['user_email'] = $matched['email'];
        $_SESSION['csrf'] = bin2hex(random_bytes(32));
        respond(200, ['user' => currentUser(), 'csrf' => $_SESSION['csrf']]);
    }

    if ($action === 'logout') {
        requireMethod('POST');
        $_SESSION = [];
        session_regenerate_id(true);
        $_SESSION['csrf'] = bin2hex(random_bytes(32));
        respond(200, ['user' => null, 'csrf' => $_SESSION['csrf']]);
    }

    if ($action === 'profile') {
        requireMethod('POST');
        $current = requireUser();
        $name = cleanText($input['name'] ?? '', 80);
        $email = strtolower(cleanText($input['email'] ?? '', 190));
        if ($name === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
            throw new ApiError('Nama dan alamat email yang valid wajib diisi.');
        }
        accessStore(true, function (array $data) use ($current, $name, $email): array {
            foreach ($data['users'] as &$user) {
                if ($user['email'] === $email && $user['id'] !== $current['id']) {
                    throw new ApiError('Email sudah digunakan akun lain.', 409);
                }
                if ($user['id'] === $current['id']) {
                    $user['name'] = $name;
                    $user['email'] = $email;
                }
            }
            unset($user);
            return $data;
        });
        $_SESSION['user_name'] = $name;
        $_SESSION['user_email'] = $email;
        respond(200, ['user' => currentUser()]);
    }

    if ($action === 'reports.list') {
        requireMethod('GET');
        $data = accessStore(false);
        $reports = array_map('publicReport', $data['reports']);
        usort($reports, fn(array $a, array $b): int => strcmp($b['created_at'], $a['created_at']));
        respond(200, ['reports' => $reports]);
    }

    if ($action === 'reports.create') {
        requireMethod('POST');
        $user = requireUser();
        $report = validateReport($input);
        $photo = savePhoto();
        $report['id'] = bin2hex(random_bytes(16));
        $report['user_id'] = $user['id'];
        $report['reporter'] = $report['reporter'] !== '' ? $report['reporter'] : $user['name'];
        $report['photo'] = $photo;
        $report['created_at'] = gmdate('c');
        accessStore(true, function (array $data) use ($report): array {
            $data['reports'][] = $report;
            return $data;
        });
        respond(201, ['report' => publicReport($report)]);
    }

    if ($action === 'reports.update') {
        requireMethod('POST');
        $user = requireUser();
        $id = cleanText($input['id'] ?? '', 64);
        $updated = accessStore(true, function (array $data) use ($id, $user, $input): array {
            $index = findOwnedRecord($data['reports'], $id, $user['id']);
            $data['reports'][$index] = array_merge($data['reports'][$index], validateReport($input, $data['reports'][$index]));
            if ($data['reports'][$index]['reporter'] === '') {
                $data['reports'][$index]['reporter'] = $user['name'];
            }
            return $data;
        });
        $index = findOwnedRecord($updated['reports'], $id, $user['id']);
        respond(200, ['report' => publicReport($updated['reports'][$index])]);
    }

    if ($action === 'reports.delete') {
        requireMethod('POST');
        $user = requireUser();
        $id = cleanText($input['id'] ?? '', 64);
        accessStore(true, function (array $data) use ($id, $user): array {
            $index = findOwnedRecord($data['reports'], $id, $user['id']);
            array_splice($data['reports'], $index, 1);
            return $data;
        });
        respond(200, ['message' => 'Laporan berhasil dihapus.']);
    }

    if ($action === 'care.list') {
        requireMethod('GET');
        $user = requireUser();
        $data = accessStore(false);
        $logs = array_values(array_filter($data['care_logs'], fn(array $log): bool => $log['user_id'] === $user['id']));
        usort($logs, fn(array $a, array $b): int => strcmp($b['date'], $a['date']));
        respond(200, ['logs' => $logs]);
    }

    if (in_array($action, ['care.create', 'care.update'], true)) {
        requireMethod('POST');
        $user = requireUser();
        $id = cleanText($input['id'] ?? '', 64);
        $log = [
            'cat_name' => cleanText($input['cat_name'] ?? '', 80),
            'location' => cleanText($input['location'] ?? '', 180),
            'activity' => cleanText($input['activity'] ?? '', 40),
            'date' => cleanText($input['date'] ?? '', 10),
            'notes' => cleanText($input['notes'] ?? '', 500),
        ];
        if ($log['cat_name'] === '' || $log['location'] === '' || !in_array($log['activity'], ['makan', 'minum', 'obat', 'steril', 'vaksin', 'lainnya'], true) || !preg_match('/^\d{4}-\d{2}-\d{2}$/', $log['date']) || !checkdate((int) substr($log['date'], 5, 2), (int) substr($log['date'], 8, 2), (int) substr($log['date'], 0, 4))) {
            throw new ApiError('Lengkapi nama kucing, lokasi, kegiatan, dan tanggal yang valid.');
        }
        $updated = accessStore(true, function (array $data) use ($action, $id, $user, $log): array {
            if ($action === 'care.create') {
                $log['id'] = bin2hex(random_bytes(16));
                $log['user_id'] = $user['id'];
                $data['care_logs'][] = $log;
                return $data;
            }
            $index = findOwnedRecord($data['care_logs'], $id, $user['id']);
            $data['care_logs'][$index] = array_merge($data['care_logs'][$index], $log);
            return $data;
        });
        if ($action === 'care.create') {
            respond(201, ['log' => end($updated['care_logs'])]);
        }
        $index = findOwnedRecord($updated['care_logs'], $id, $user['id']);
        respond(200, ['log' => $updated['care_logs'][$index]]);
    }

    if ($action === 'care.delete') {
        requireMethod('POST');
        $user = requireUser();
        $id = cleanText($input['id'] ?? '', 64);
        accessStore(true, function (array $data) use ($id, $user): array {
            $index = findOwnedRecord($data['care_logs'], $id, $user['id']);
            array_splice($data['care_logs'], $index, 1);
            return $data;
        });
        respond(200, ['message' => 'Catatan perawatan berhasil dihapus.']);
    }

    throw new ApiError('Endpoint tidak ditemukan.', 404);
} catch (ApiError $error) {
    respond($error->status, ['error' => $error->getMessage()]);
} catch (Throwable $error) {
    error_log($error->__toString());
    respond(500, ['error' => 'Terjadi kesalahan pada server. Periksa log PHP untuk detailnya.']);
}
