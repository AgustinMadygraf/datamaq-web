
<?php
/*
Path: backend/api/form.php
Formulario para ingresar la URL ngrok y guardarla en la base de datos usando POO.
*/

header('Content-Type: text/html; charset=utf-8');

$url = isset($_GET['url']) ? trim($_GET['url']) : '';
$message = '';

require __DIR__ . '/env.php';
require_once __DIR__ . '/lib/Database.php';
require_once __DIR__ . '/lib/url-repository.php';

if ($url) {
	if (filter_var($url, FILTER_VALIDATE_URL)) {
		try {
			$db = new Database($config);
			$repo = new UrlRepository($db);
			$repo->save($url);
			$message = 'URL guardada correctamente.';
			$db->close();
		} catch (Exception $e) {
			$message = 'Error: ' . $e->getMessage();
		}
	} else {
		$message = 'La URL ingresada no es válida.';
	}
}

?>
<html>
<head>
	<title>Ingresar URL ngrok</title>
	<meta charset="utf-8">
	<style>
		body { font-family: Arial, sans-serif; margin: 2em; }
		form { margin-bottom: 1em; }
		input[type="text"] { width: 400px; padding: 0.5em; }
		input[type="submit"] { padding: 0.5em 1em; }
		.msg { margin-top: 1em; color: #007700; }
		.error { color: #bb0000; }
	</style>
</head>
<body>
	<h2>Ingresar URL ngrok</h2>
	<form method="get" action="form.php">
		<label for="url">URL:</label>
		<input type="text" name="url" id="url" placeholder="https://xxxx.ngrok-free.app" required>
		<input type="submit" value="Guardar">
	</form>
	<?php if ($message): ?>
		<div class="msg <?php echo (strpos($message, 'Error') !== false || strpos($message, 'no es válida') !== false) ? 'error' : ''; ?>">
			<?php echo htmlspecialchars($message); ?>
		</div>
	<?php endif; ?>
</body>
</html>
