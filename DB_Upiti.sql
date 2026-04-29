-- Kreira bazu i prelazi na nju
CREATE DATABASE IF NOT EXISTS forgeboard_db;
USE forgeboard_db;

-- 1. Tabela Korisnici (Users) sa validacijom duzine username-a
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(40) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    profile_image TEXT,
    role ENUM('guest', 'player', 'admin') DEFAULT 'player',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CHECK (LENGTH(username) >= 3 AND LENGTH(username) <= 40)
);

-- 2. Tabela Igre (Games) sa validacijama iz specifikacije
CREATE TABLE games (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    description VARCHAR(2000),
    min_players INT NOT NULL CHECK (min_players >= 1),
    max_players INT NOT NULL,
    duration_min INT NOT NULL CHECK (duration_min >= 5),
    weight DECIMAL(3,1) NOT NULL CHECK (weight >= 1.0 AND weight <= 5.0),
    release_year INT CHECK (release_year >= 1900),
    publisher VARCHAR(100),
    cover_image TEXT,
    CHECK (max_players >= min_players)
);

-- 3. Tabela Mehanike (Mechanics)
CREATE TABLE mechanics (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
);

-- 4. Prva M:N Relacija: Igre <-> Mehanike (game_mechanics)
CREATE TABLE game_mechanics (
    game_id INT NOT NULL,
    mechanic_id INT NOT NULL,
    PRIMARY KEY (game_id, mechanic_id),
    FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE,
    FOREIGN KEY (mechanic_id) REFERENCES mechanics(id) ON DELETE RESTRICT
);

-- 5. Druga M:N Relacija: Korisnici <-> Igre / Kolekcija (user_games)
CREATE TABLE user_games (
    user_id INT NOT NULL,
    game_id INT NOT NULL,
    status ENUM('owned', 'wishlist', 'previously_owned') NOT NULL,
    personal_rating TINYINT CHECK (personal_rating IS NULL OR (personal_rating >= 1 AND personal_rating <= 10)),
    notes TEXT,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, game_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE
);

-- 6. Tabela Sesije (Sessions)
CREATE TABLE sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    creator_id INT NOT NULL,
    game_id INT NOT NULL,
    played_at DATETIME NOT NULL,
    duration_minutes INT NOT NULL,
    notes TEXT,
    FOREIGN KEY (creator_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE
);

-- 7. Treca M:N Relacija: Sesije <-> Korisnici/Ucesnici (session_players)
CREATE TABLE session_players (
    session_id INT NOT NULL,
    user_id INT NOT NULL,
    score INT,
    winner BOOLEAN DEFAULT FALSE,
    PRIMARY KEY (session_id, user_id),
    FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 8. Tabela Recenzije (Reviews) - Max 1 recenzija po igri po korisniku
CREATE TABLE reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    game_id INT NOT NULL,
    user_id INT NOT NULL,
    title VARCHAR(100) NOT NULL,
    body TEXT NOT NULL,
    rating TINYINT NOT NULL CHECK (rating >= 1 AND rating <= 10),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (game_id, user_id), -- Sprečava da korisnik ostavi više recenzija za istu igru
    FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CHECK (LENGTH(body) >= 50 AND LENGTH(body) <= 3000)
);

-- 9. Tabela Audit Logs (Za pracenje logout-a i admin aktivnosti)
CREATE TABLE audit_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    action VARCHAR(255) NOT NULL,
    details TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Dodavanje Indexa za optimizaciju pretrage i filtriranja kataloga igara
CREATE INDEX idx_games_players ON games(min_players, max_players);
CREATE INDEX idx_games_duration ON games(duration_min);
CREATE INDEX idx_games_weight ON games(weight);