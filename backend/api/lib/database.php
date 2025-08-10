<?php
/*
Path: backend/api/lib/Database.php
*/

class Database {
    private $mysqli;

    public function __construct($config) {
        $this->mysqli = new mysqli(
            $config['DB_HOST'],
            $config['DB_USER'],
            $config['DB_PASS'],
            $config['DB_NAME']
        );
        if ($this->mysqli->connect_error) {
            throw new Exception('Error de conexión a la base de datos: ' . $this->mysqli->connect_error, $this->mysqli->connect_errno);
        }
    }

    public function getConnection() {
        return $this->mysqli;
    }

    public function close() {
        $this->mysqli->close();
    }
}
