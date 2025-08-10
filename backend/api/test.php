<?php
declare(strict_types=1);
header('Content-Type: application/json');

$result = [
    "db" => false,
    "table" => false,
    "lastUrl" => null,
    "error" => null
];

try {
    $configPath = __DIR__ . '/env.php';
    
    // Verificación en 2 pasos del archivo de configuración
    if (!file_exists($configPath)) {
        throw new RuntimeException("Archivo env.php no encontrado en: $configPath");
    }
    
    $config = require $configPath;
    
    if (!is_array($config)) {
        throw new RuntimeException("El archivo env.php debe retornar un array");
    }

    // Lista de parámetros obligatorios
    $requiredKeys = ['db_host', 'db_name', 'db_user'];
    $missingKeys = [];
    
    foreach ($requiredKeys as $key) {
        if (!array_key_exists($key, $config) || empty($config[$key])) {
            $missingKeys[] = $key;
        }
    }
    
    if (!empty($missingKeys)) {
        throw new RuntimeException(
            "Configuración incompleta. Faltan: " . implode(', ', $missingKeys)
        );
    }

    require_once __DIR__ . '/lib/Database.php';
    require_once __DIR__ . '/lib/url-repository.php';

    $db = new Database($config);
    $result['db'] = true;

    $repo = new UrlRepository($db);
    $last = $repo->getLast();
    
    if (empty($last) || !isset($last['url'])) {
        $result['table'] = false;
        $result['error'] = "Tabla vacía o estructura incorrecta";
    } else {
        $result['table'] = true;
        $result['lastUrl'] = $last['url'];
    }
    
} catch (Throwable $e) {
    $result['error'] = "Error en prueba de sistema: " . $e->getMessage();
} finally {
    if (isset($db) && $db instanceof Database) {
        $db->close();
    }
}

echo json_encode($result, JSON_UNESCAPED_SLASHES | JSON_INVALID_UTF8_SUBSTITUTE);