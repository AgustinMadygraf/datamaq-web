<?php
/*
Path: backend/api/api-config.php
*/

header('Content-Type: application/json');

require_once __DIR__ . '/lib/Database.php';
require_once __DIR__ . '/lib/url-repository.php';

$config = require __DIR__ . '/env.php';

$response = [
    'status' => 'success',
    'BASE_URL' => null,
    'error' => null,
    'code' => null
];

try {
    $db = new Database($config);
    $repo = new UrlRepository($db);

    if ($config['MODE'] === 'dev') {
        $response['BASE_URL'] = $config['BASE_URL'];
    } else {
        $last = $repo->getLast();
        if ($last && isset($last['url'])) {
            $response['BASE_URL'] = $last['url'];
        } else {
            throw new Exception('No se encontró la URL de ngrok en la base de datos', 404);
        }
    }
    $db->close();
} catch (Exception $e) {
    error_log('api-config.php: ' . $e->getMessage());
    $response['status'] = 'error';
    $response['error'] = $e->getMessage();
    $response['code'] = $e->getCode();
    $response['BASE_URL'] = $config['BASE_URL'];
}

echo json_encode($response);
