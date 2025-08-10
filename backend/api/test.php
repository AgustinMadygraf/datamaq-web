<?php
/*
Path: backend/api/test.php
Test de conexión y existencia de tabla 'urls' usando POO.
*/

header('Content-Type: application/json');
$result = ["db" => false, "table" => false, "lastUrl" => null, "error" => null];

require_once __DIR__ . '/lib/Database.php';
require_once __DIR__ . '/lib/url-repository.php';

try {
	$config = require __DIR__ . '/env.php';
	$db = new Database($config);
	$result["db"] = true;
	$repo = new UrlRepository($db);
	// Test acceso a la tabla y obtener última URL
	$last = $repo->getLast();
	if ($last && isset($last['url'])) {
		$result["table"] = true;
		$result["lastUrl"] = $last['url'];
	} else {
		throw new Exception("La tabla 'urls' no existe o está vacía.");
	}
	$db->close();
} catch (Exception $e) {
	$result["error"] = $e->getMessage();
}
echo json_encode($result);
