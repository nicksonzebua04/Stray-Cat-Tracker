<?php
declare(strict_types=1);

header('Content-Type: application/xhtml+xml; charset=utf-8');
$page = file_get_contents(__DIR__ . DIRECTORY_SEPARATOR . 'code.xhtml');
if ($page === false) {
    http_response_code(500);
    exit('Halaman aplikasi tidak dapat dibaca.');
}
echo $page;
