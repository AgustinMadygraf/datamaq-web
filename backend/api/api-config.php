<?php
/*
Path: backend/api/api-config.php
*/

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
    try {
        $mysqli = new mysqli(
            $config['DB_HOST'],
            $config['DB_USER'],
            $config['DB_PASS'],
            $config['DB_NAME']
        );

        if ($mysqli->connect_error) {
            throw new Exception('Error de conexión a la base de datos: ' . $mysqli->connect_error, $mysqli->connect_errno);
        }

        $result = $mysqli->query("SELECT url FROM urls ORDER BY id DESC LIMIT 1");
        if (!$result) {
            throw new Exception('Error en la consulta SQL: ' . $mysqli->error, $mysqli->errno);
        }

        if ($row = $result->fetch_assoc()) {
            $response['BASE_URL'] = $row['url'];
        } else {
            throw new Exception('No se encontró la URL de ngrok en la base de datos', 404);
        }
        $result->free();
        $mysqli->close();
    } catch (Exception $e) {
        error_log('api-config.php: ' . $e->getMessage()); // Log en el servidor
        $response['status'] = 'error';
        $response['error'] = $e->getMessage();
        $response['code'] = $e->getCode();
        $response['BASE_URL'] = 'http://localhost/DataMaq/backend/api/';
    }
}

echo json_encode($response);
?>
