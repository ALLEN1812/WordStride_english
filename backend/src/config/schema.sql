-- ============================================================
-- DATABASE: english_app
-- Ứng dụng Học và Luyện Thi Tiếng Anh Trực Tuyến
-- ============================================================

CREATE DATABASE IF NOT EXISTS english_app
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE english_app;

-- ============================================================
-- 1. USERS
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  username    VARCHAR(50)  NOT NULL UNIQUE,
  email       VARCHAR(100) NOT NULL UNIQUE,
  password    VARCHAR(255) NOT NULL,
  full_name   VARCHAR(100),
  avatar      VARCHAR(255),
  dob         DATE,
  role        ENUM('user','admin') NOT NULL DEFAULT 'user',
  is_active   TINYINT(1)   NOT NULL DEFAULT 1,
  total_exp   INT          NOT NULL DEFAULT 0,
  level       INT          NOT NULL DEFAULT 1,
  created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ============================================================
-- 2. VOCABULARY TOPICS & FLASHCARDS
-- ============================================================
CREATE TABLE IF NOT EXISTS vocab_topics (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(100) NOT NULL,
  description TEXT,
  category    VARCHAR(50),          -- e.g. TOEIC, IELTS, Giao tiếp
  thumbnail   VARCHAR(255),
  created_by  INT,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS flashcards (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  topic_id     INT NOT NULL,
  word         VARCHAR(100) NOT NULL,
  phonetic     VARCHAR(100),
  meaning      TEXT NOT NULL,
  example      TEXT,
  audio_url    VARCHAR(255),
  image_url    VARCHAR(255),
  created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (topic_id) REFERENCES vocab_topics(id) ON DELETE CASCADE
);

-- User custom flashcard sets
CREATE TABLE IF NOT EXISTS user_flashcard_sets (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  user_id     INT NOT NULL,
  name        VARCHAR(100) NOT NULL,
  description TEXT,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS user_flashcard_items (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  set_id     INT NOT NULL,
  word       VARCHAR(100) NOT NULL,
  phonetic   VARCHAR(100),
  meaning    TEXT NOT NULL,
  example    TEXT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (set_id) REFERENCES user_flashcard_sets(id) ON DELETE CASCADE
);

-- Track which words a user has studied / marked hard
CREATE TABLE IF NOT EXISTS user_flashcard_progress (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  user_id      INT NOT NULL,
  flashcard_id INT NOT NULL,
  status       ENUM('learned','hard','new') NOT NULL DEFAULT 'new',
  updated_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_user_card (user_id, flashcard_id),
  FOREIGN KEY (user_id)      REFERENCES users(id)      ON DELETE CASCADE,
  FOREIGN KEY (flashcard_id) REFERENCES flashcards(id) ON DELETE CASCADE
);

-- ============================================================
-- 3. GRAMMAR LESSONS & EXERCISES
-- ============================================================
CREATE TABLE IF NOT EXISTS grammar_lessons (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  title       VARCHAR(200) NOT NULL,
  content     LONGTEXT     NOT NULL,   -- HTML / Markdown content
  level       ENUM('beginner','intermediate','advanced') NOT NULL DEFAULT 'beginner',
  order_index INT          NOT NULL DEFAULT 0,
  created_by  INT,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS grammar_questions (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  lesson_id    INT  NOT NULL,
  question     TEXT NOT NULL,
  option_a     TEXT NOT NULL,
  option_b     TEXT NOT NULL,
  option_c     TEXT NOT NULL,
  option_d     TEXT NOT NULL,
  correct      ENUM('A','B','C','D') NOT NULL,
  explanation  TEXT,
  order_index  INT NOT NULL DEFAULT 0,
  created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (lesson_id) REFERENCES grammar_lessons(id) ON DELETE CASCADE
);

-- ============================================================
-- 4. EXAMS
-- ============================================================
CREATE TABLE IF NOT EXISTS exams (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  title       VARCHAR(200) NOT NULL,
  exam_type   VARCHAR(50)  NOT NULL,   -- TOEIC, IELTS, General, ...
  difficulty  ENUM('easy','medium','hard') NOT NULL DEFAULT 'medium',
  duration    INT          NOT NULL DEFAULT 60,  -- minutes
  description TEXT,
  created_by  INT,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS exam_parts (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  exam_id      INT          NOT NULL,
  part_name    VARCHAR(100) NOT NULL,
  instructions TEXT,
  order_index  INT          NOT NULL DEFAULT 0,
  FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS exam_questions (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  part_id     INT  NOT NULL,
  question    TEXT NOT NULL,
  option_a    TEXT NOT NULL,
  option_b    TEXT NOT NULL,
  option_c    TEXT NOT NULL,
  option_d    TEXT NOT NULL,
  correct     ENUM('A','B','C','D') NOT NULL,
  explanation TEXT,
  audio_url   VARCHAR(255),           -- for listening questions
  order_index INT NOT NULL DEFAULT 0,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (part_id) REFERENCES exam_parts(id) ON DELETE CASCADE
);

-- ============================================================
-- 5. USER RESULTS
-- ============================================================
CREATE TABLE IF NOT EXISTS exam_attempts (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  user_id      INT  NOT NULL,
  exam_id      INT  NOT NULL,
  mode         ENUM('practice','test') NOT NULL DEFAULT 'test',
  score        DECIMAL(5,2),
  total_q      INT  NOT NULL DEFAULT 0,
  correct_q    INT  NOT NULL DEFAULT 0,
  time_spent   INT,                    -- seconds
  submitted_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS exam_answers (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  attempt_id   INT NOT NULL,
  question_id  INT NOT NULL,
  chosen       ENUM('A','B','C','D'),
  is_correct   TINYINT(1),
  FOREIGN KEY (attempt_id)  REFERENCES exam_attempts(id)   ON DELETE CASCADE,
  FOREIGN KEY (question_id) REFERENCES exam_questions(id)  ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS grammar_attempts (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  user_id      INT  NOT NULL,
  lesson_id    INT  NOT NULL,
  score        DECIMAL(5,2),
  total_q      INT  NOT NULL DEFAULT 0,
  correct_q    INT  NOT NULL DEFAULT 0,
  submitted_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id)   REFERENCES users(id)           ON DELETE CASCADE,
  FOREIGN KEY (lesson_id) REFERENCES grammar_lessons(id) ON DELETE CASCADE
);

-- ============================================================
-- 6. DAILY TASKS TRACKING
-- ============================================================
CREATE TABLE IF NOT EXISTS user_daily_tasks (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  user_id       INT          NOT NULL,
  task_date     DATE         NOT NULL,
  task_type     ENUM('vocab','grammar','exam') NOT NULL,
  is_completed  TINYINT(1)   NOT NULL DEFAULT 0,
  exp_awarded   INT          NOT NULL DEFAULT 0,
  completed_at  DATETIME,
  UNIQUE KEY uq_user_task_date (user_id, task_date, task_type),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================================
-- 7. SEED DATA — default admin account
-- password: Admin@123  (bcrypt hash)
-- ============================================================
INSERT IGNORE INTO users (username, email, password, full_name, role)
VALUES (
  'admin',
  'admin@englishapp.com',
  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
  'Administrator',
  'admin'
);
