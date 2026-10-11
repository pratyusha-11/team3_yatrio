-- 004_create_train_running_days.sql
-- Table mapping which days of the week each train operates
CREATE TABLE IF NOT EXISTS train_running_days (
    id INT AUTO_INCREMENT PRIMARY KEY,
    train_id INT NOT NULL,
    day_of_week ENUM('MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_trd_train FOREIGN KEY (train_id) REFERENCES trains(id) ON DELETE CASCADE,
    CONSTRAINT uq_train_day UNIQUE (train_id, day_of_week)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
