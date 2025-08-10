<?php
/*
Path: backend/api/test.php
Test de conexión y existencia de tabla 'urls' usando POO.
*/

header('Content-Type: application/json');
$result = [
	"db" => false,
	"table" => false,
	"lastUrl" => null,
	"error" => null
	];

echo json_encode($result);
