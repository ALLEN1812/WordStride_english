-- ============================================================
-- TOEIC System Tables
-- Run: Get-Content "toeic_schema.sql" | & mysql -u root --password=123456 english_app
-- ============================================================
USE english_app;

CREATE TABLE IF NOT EXISTS toeic_tests (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  title            VARCHAR(255) NOT NULL,
  type             ENUM('full_test','mini_test','practice_set') NOT NULL DEFAULT 'full_test',
  duration_minutes INT NOT NULL DEFAULT 120,
  difficulty       ENUM('easy','medium','hard') NOT NULL DEFAULT 'medium',
  description      TEXT,
  status           ENUM('draft','public','hidden','archived') NOT NULL DEFAULT 'draft',
  created_by       INT,
  created_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Conversation / passage groups for Parts 3, 4, 6, 7
CREATE TABLE IF NOT EXISTS toeic_question_groups (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  test_id     INT NOT NULL,
  part_num    TINYINT NOT NULL,
  group_order INT NOT NULL DEFAULT 0,
  audio_url   VARCHAR(500),
  image_url   VARCHAR(500),
  passage     LONGTEXT,
  transcript  LONGTEXT,
  FOREIGN KEY (test_id) REFERENCES toeic_tests(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS toeic_questions (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  test_id        INT NOT NULL,
  group_id       INT,
  part_num       TINYINT NOT NULL,
  question_num   INT NOT NULL DEFAULT 0,
  question_text  TEXT,
  image_url      VARCHAR(500),
  audio_url      VARCHAR(500),
  option_a       TEXT,
  option_b       TEXT,
  option_c       TEXT,
  option_d       TEXT,
  correct_answer CHAR(1),
  explanation    TEXT,
  order_index    INT NOT NULL DEFAULT 0,
  FOREIGN KEY (test_id)  REFERENCES toeic_tests(id)           ON DELETE CASCADE,
  FOREIGN KEY (group_id) REFERENCES toeic_question_groups(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS toeic_attempts (
  id                 INT AUTO_INCREMENT PRIMARY KEY,
  user_id            INT NOT NULL,
  test_id            INT NOT NULL,
  mode               ENUM('practice','mock_test') NOT NULL DEFAULT 'mock_test',
  status             ENUM('in_progress','completed') NOT NULL DEFAULT 'completed',
  listening_correct  INT NOT NULL DEFAULT 0,
  reading_correct    INT NOT NULL DEFAULT 0,
  listening_score    INT NOT NULL DEFAULT 0,
  reading_score      INT NOT NULL DEFAULT 0,
  total_score        INT NOT NULL DEFAULT 0,
  part_scores        JSON,
  time_taken_seconds INT,
  completed_at       DATETIME,
  created_at         DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)       ON DELETE CASCADE,
  FOREIGN KEY (test_id) REFERENCES toeic_tests(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS toeic_attempt_answers (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  attempt_id  INT NOT NULL,
  question_id INT NOT NULL,
  chosen      CHAR(1),
  is_correct  TINYINT(1) NOT NULL DEFAULT 0,
  UNIQUE KEY uq_attempt_q (attempt_id, question_id),
  FOREIGN KEY (attempt_id)  REFERENCES toeic_attempts(id)  ON DELETE CASCADE,
  FOREIGN KEY (question_id) REFERENCES toeic_questions(id) ON DELETE CASCADE
);
