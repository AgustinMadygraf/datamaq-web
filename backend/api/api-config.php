<?php
/*
Path: backend/api/api-config.php
Descripción: Configuración dinámica de BASE_URL con soporte para modo dev y prod
*/

declare(strict_types=1);
header('Content-Type: application/json');

// Inicializar respuesta estructurada
$response = [
    'status' => 'success',
    'BASE_URL' => null,
    'mode' => null,
    'error' => null,
    'code' => null
];

try {
    // Cargar configuración con validación
    $configPath = __DIR__ . '/env.php';
    if (!file_exists($configPath)) {
        throw new RuntimeException("Archivo de configuración no encontrado");
    }
    
    $config = require $configPath;
    $response['mode'] = $config['MODE'] ?? null;

    // Validar configuración esencial
    $requiredKeys = ['MODE', 'DB_HOST', 'DB_USER', 'DB_PASS', 'DB_NAME'];
    foreach ($requiredKeys as $key) {
        if (!isset($config[$key])) {
            throw new RuntimeException("Configuración incompleta: Falta $key");
        }
    }

    // Modo desarrollo
    if ($config['MODE'] === 'dev') {
        $response['BASE_URL'] = $config['BASE_URL'] ?? 'http://localhost/DataMaq/backend/api/';
    } 
    // Modo producción
    elseif ($config['MODE'] === 'prod') {
        $mysqli = new mysqli(
            $config['DB_HOST'],
            $config['DB_USER'],
            $config['DB_PASS'],
            $config['DB_NAME']
        );

        if ($mysqli->connect_errno) {
            throw new RuntimeException(
                "Conexión fallida: " . $mysqli->connect_error, 
                $mysqli->connect_errno
            );
        }

        // Consulta segura con manejo de errores
        $query = "SELECT url FROM " . $config['TABLE'] . " ORDER BY id DESC LIMIT 1";
        if ($result = $mysqli->query($query)) {
            if ($row = $result->fetch_assoc()) {
                $response['BASE_URL'] = $row['url'];
            } else {
                throw new RuntimeException("No se encontraron URLs de ngrok", 404);
            }
            $result->free();
        } else {
            throw new RuntimeException("Error en consulta: " . $mysqli->error, $mysqli->errno);
        }
        
        $mysqli->close();
    } else {
        throw new RuntimeException("Modo inválido: " . $config['MODE']);
    }

} catch (RuntimeException $e) {
    $response['status'] = 'error';
    $response['error'] = $e->getMessage();
    $response['code'] = $e->getCode() ?: 500;
}

echo json_encode($response, JSON_UNESCAPED_SLASHES | JSON_INVALID_UTF8_SUBSTITUTE);