<?php
header('Content-Type: application/json');

// Aquí puedes personalizar la lógica para construir la URL base
$baseUrl = '/DataMaq/backend/api';

echo json_encode([
    'BASE_URL' => $baseUrl
]);
?>
