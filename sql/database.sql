CREATE DATABASE IF NOT EXISTS n1_pentest CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE n1_pentest;

DROP TABLE IF EXISTS users_v2;
DROP TABLE IF EXISTS users_v1;

-- Tabela exclusiva da V1: propositalmente insegura para o laboratório local.
CREATE TABLE users_v1 (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO users_v1 (username, email, password) VALUES
  ('admin', 'admin@local.test', '123456'),
  ('demo', 'demo@local.test', '123456');

-- Tabela exclusiva da V2: senhas armazenadas com bcrypt pela aplicação.
CREATE TABLE users_v2 (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,
  email VARCHAR(150) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
