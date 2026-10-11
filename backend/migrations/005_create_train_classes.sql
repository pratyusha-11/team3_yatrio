-- 005_create_train_classes.sql
-- Table storing available classes, fare, and seat capacity for each train
CREATE TABLE IF NOT EXISTS train_classes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    train_id INT NOT NULL,
    class_code VARCHAR(10) NOT NULL,
    class_name VARCHAR(50) NOT NULL,
    base_fare DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    total_seats INT NOT NULL DEFAULT 100,
    available_seats INT NOT NULL DEFAULT 50,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_tc_train FOREIGN KEY (train_id) REFERENCES trains(id) ON DELETE CASCADE,
    CONSTRAINT uq_train_class UNIQUE (train_id, class_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
