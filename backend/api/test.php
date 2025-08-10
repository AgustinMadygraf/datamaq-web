<?php
/*
Path: backend/api/test.php
Test de conexión y existencia de tabla 'urls' usando POO - Versión Mejorada
*/

declare(strict_types=1);
header('Content-Type: application/json');

// Resultado estructurado con tipos definidos
$result = [
    "db" => false,
    "table" => false,
    "lastUrl" => null,
    "error" => null
];

try {
    // Carga segura de configuración
    $configPath = __DIR__ . '/env.php';
    if (!file_exists($configPath)) {
        throw new RuntimeException("Archivo de configuración no encontrado");
    }
    
    $config = require $configPath;
    
    // Validación básica de configuración
    if (empty($config['db_host']) || empty($config['db_name'])) {
        throw new RuntimeException("Configuración de BD incompleta");
    }

    require_once __DIR__ . '/lib/Database.php';
    require_once __DIR__ . '/lib/url-repository.php';

    $db = new Database($config);
    $result['db'] = true;  // Conexión exitosa

    $repo = new UrlRepository($db);
    $last = $repo->getLast();
    
    if (!$last || !isset($last['url'])) {
        throw new RuntimeException("La tabla 'urls' no contiene registros válidos");
    }
    
    $result['table'] = true;
    $result['lastUrl'] = $last['url'];
    
} catch (Throwable $e) {  // Captura cualquier error/exception
    $result['error'] = "Error en prueba de sistema: " . $e->getMessage();
    // Log detallado para producción (descomentar en entorno real)
    // error_log("SYSTEM TEST ERROR: " . $e->getMessage() . " in " . $e->getFile() . ":" . $e->getLine());
} finally {
    // Cierre seguro de conexión
    if (isset($db) && $db instanceof Database) {
        $db->close();
    }
}

// Codificación segura para JSON
echo json_encode($result, JSON_UNESCAPED_SLASHES | JSON_INVALID_UTF8_SUBSTITUTE);