<?php
header('Content-Type: application/json');

// Cargar configuración desde env.php
$config = require __DIR__ . '/env.php';

$response = [
    'status' => 'success',
    'BASE_URL' => null,
    'error' => null,
    'code' => null
];

if ($config['MODE'] === 'dev') {
    $response['BASE_URL'] = 'http://localhost/DataMaq/backend/api/';
} else {
    $mysqli = new mysqli(
        $config['DB_HOST'],
        $config['DB_USER'],
        $config['DB_PASS'],
        $config['DB_NAME']
    );

    if ($mysqli->connect_error) {
        $response['status'] = 'error';
        $response['error'] = 'Error de conexión a la base de datos';
        $response['code'] = $mysqli->connect_errno;
        echo json_encode($response);
        exit;
    }

    $result = $mysqli->query("SELECT url FROM ngrok_urls ORDER BY id DESC LIMIT 1");
    if ($row = $result->fetch_assoc()) {
        $response['BASE_URL'] = $row['url'];
    } else {
        $response['status'] = 'error';
        $response['error'] = 'No se encontró la URL de ngrok en la base de datos';
        $response['code'] = 404;
    }
    $mysqli->close();
}

echo json_encode($response);
?>
