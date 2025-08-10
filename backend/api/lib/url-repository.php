<?php
/*
Path: backend/api/lib/url-repository.php
*/

class UrlRepository {
    private $db;

    public function __construct(Database $db) {
        $this->db = $db->getConnection();
    }

    public function save($url) {
        $stmt = $this->db->prepare('INSERT INTO urls (url) VALUES (?)');
        if (!$stmt) throw new Exception('Error en la consulta SQL: ' . $this->db->error);
        $stmt->bind_param('s', $url);
        $result = $stmt->execute();
        $stmt->close();
        return $result;
    }

    public function getLast() {
        $result = $this->db->query('SELECT url FROM urls ORDER BY id DESC LIMIT 1');
        if (!$result) throw new Exception('Error en la consulta SQL: ' . $this->db->error);
        $row = $result->fetch_assoc();
        $result->free();
        return $row ? $row : null;
    }
}
