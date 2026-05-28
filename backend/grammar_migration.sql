USE english_app;

-- 1. Add youtube_url to grammar_lessons
ALTER TABLE grammar_lessons ADD COLUMN youtube_url VARCHAR(500) DEFAULT NULL;

-- 2. grammar_sections table
CREATE TABLE IF NOT EXISTS grammar_sections (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  lesson_id   INT NOT NULL,
  title       VARCHAR(200) NOT NULL,
  description TEXT,
  order_index INT NOT NULL DEFAULT 0,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (lesson_id) REFERENCES grammar_lessons(id) ON DELETE CASCADE
);

-- 3. Add section_id, question_type, fill_answer to grammar_questions
ALTER TABLE grammar_questions
  ADD COLUMN section_id    INT DEFAULT NULL,
  ADD COLUMN question_type ENUM('multiple_choice','fill_blank') NOT NULL DEFAULT 'multiple_choice',
  ADD COLUMN fill_answer   VARCHAR(500) DEFAULT NULL;

-- 4. Make option/correct columns nullable (needed for fill_blank)
ALTER TABLE grammar_questions
  MODIFY COLUMN option_a TEXT DEFAULT NULL,
  MODIFY COLUMN option_b TEXT DEFAULT NULL,
  MODIFY COLUMN option_c TEXT DEFAULT NULL,
  MODIFY COLUMN option_d TEXT DEFAULT NULL,
  MODIFY COLUMN correct  VARCHAR(10) DEFAULT NULL;

-- 5. grammar_section_attempts table
CREATE TABLE IF NOT EXISTS grammar_section_attempts (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  user_id      INT NOT NULL,
  section_id   INT NOT NULL,
  score_pct    DECIMAL(5,2) NOT NULL DEFAULT 0,
  correct_q    INT NOT NULL DEFAULT 0,
  total_q      INT NOT NULL DEFAULT 0,
  exp_awarded  INT NOT NULL DEFAULT 0,
  submitted_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id)    REFERENCES users(id)             ON DELETE CASCADE,
  FOREIGN KEY (section_id) REFERENCES grammar_sections(id)  ON DELETE CASCADE
);
