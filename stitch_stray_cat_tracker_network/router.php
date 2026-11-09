<?php
declare(strict_types=1);

$path = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH);
if ($path === '/api.php') {
    require __DIR__ . DIRECTORY_SEPARATOR . 'api.php';
    return true;
}

$requestedFile = realpath(__DIR__ . DIRECTORY_SEPARATOR . ltrim((string) $path, '/\\'));
$root = realpath(__DIR__);
if ($requestedFile !== false && $root !== false && str_starts_with($requestedFile, $root . DIRECTORY_SEPARATOR) && is_file($requestedFile)) {
    return false;
}

require __DIR__ . DIRECTORY_SEPARATOR . 'index.php';
return true;
