-- ============================================================
-- English App — PostgreSQL Schema for Supabase
-- Chạy toàn bộ file này trong Supabase SQL Editor
-- ============================================================

-- 1. USERS
CREATE TABLE IF NOT EXISTS users (
  id          SERIAL PRIMARY KEY,
  username    VARCHAR(50)  NOT NULL UNIQUE,
  email       VARCHAR(100) NOT NULL UNIQUE,
  password    VARCHAR(255) NOT NULL,
  full_name   VARCHAR(100),
  avatar      VARCHAR(255),
  dob         DATE,
  role        VARCHAR(10)  NOT NULL DEFAULT 'user',
  is_active   SMALLINT     NOT NULL DEFAULT 1,
  total_exp   INT          NOT NULL DEFAULT 0,
  level       INT          NOT NULL DEFAULT 1,
  created_at  TIMESTAMP    NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- 2. VOCAB
CREATE TABLE IF NOT EXISTS vocab_topics (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(100) NOT NULL,
  description TEXT,
  category    VARCHAR(50),
  thumbnail   VARCHAR(255),
  difficulty  VARCHAR(20)  DEFAULT 'beginner',
  status      VARCHAR(20)  DEFAULT 'published',
  created_by  INT REFERENCES users(id) ON DELETE SET NULL,
  created_at  TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS flashcards (
  id          SERIAL PRIMARY KEY,
  topic_id    INT NOT NULL REFERENCES vocab_topics(id) ON DELETE CASCADE,
  word        VARCHAR(100) NOT NULL,
  phonetic    VARCHAR(100),
  meaning     TEXT NOT NULL,
  example     TEXT,
  audio_url   VARCHAR(255),
  image_url   VARCHAR(255),
  word_type   VARCHAR(50),
  notes       TEXT,
  created_at  TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_flashcard_sets (
  id          SERIAL PRIMARY KEY,
  user_id     INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name        VARCHAR(100) NOT NULL,
  description TEXT,
  created_at  TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_flashcard_items (
  id         SERIAL PRIMARY KEY,
  set_id     INT NOT NULL REFERENCES user_flashcard_sets(id) ON DELETE CASCADE,
  word       VARCHAR(100) NOT NULL,
  phonetic   VARCHAR(100),
  meaning    TEXT NOT NULL,
  example    TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_flashcard_progress (
  id           SERIAL PRIMARY KEY,
  user_id      INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  flashcard_id INT NOT NULL REFERENCES flashcards(id) ON DELETE CASCADE,
  status       VARCHAR(10) NOT NULL DEFAULT 'new',
  updated_at   TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, flashcard_id)
);

-- 3. GRAMMAR
CREATE TABLE IF NOT EXISTS grammar_lessons (
  id          SERIAL PRIMARY KEY,
  title       VARCHAR(200) NOT NULL,
  content     TEXT NOT NULL,
  level       VARCHAR(20)  NOT NULL DEFAULT 'beginner',
  order_index INT          NOT NULL DEFAULT 0,
  youtube_url VARCHAR(255),
  created_by  INT REFERENCES users(id) ON DELETE SET NULL,
  created_at  TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS grammar_sections (
  id          SERIAL PRIMARY KEY,
  lesson_id   INT NOT NULL REFERENCES grammar_lessons(id) ON DELETE CASCADE,
  title       VARCHAR(200) NOT NULL,
  description TEXT,
  order_index INT NOT NULL DEFAULT 0,
  created_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS grammar_questions (
  id            SERIAL PRIMARY KEY,
  section_id    INT REFERENCES grammar_sections(id) ON DELETE CASCADE,
  lesson_id     INT REFERENCES grammar_lessons(id)  ON DELETE CASCADE,
  question_type VARCHAR(30) DEFAULT 'multiple_choice',
  question      TEXT NOT NULL,
  option_a      TEXT,
  option_b      TEXT,
  option_c      TEXT,
  option_d      TEXT,
  correct       VARCHAR(10),
  fill_answer   TEXT,
  explanation   TEXT,
  order_index   INT NOT NULL DEFAULT 0,
  created_at    TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS grammar_attempts (
  id           SERIAL PRIMARY KEY,
  user_id      INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  lesson_id    INT NOT NULL REFERENCES grammar_lessons(id) ON DELETE CASCADE,
  section_id   INT REFERENCES grammar_sections(id) ON DELETE CASCADE,
  score        DECIMAL(5,2),
  total_q      INT NOT NULL DEFAULT 0,
  correct_q    INT NOT NULL DEFAULT 0,
  submitted_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS grammar_section_attempts (
  id           SERIAL PRIMARY KEY,
  user_id      INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  section_id   INT NOT NULL REFERENCES grammar_sections(id) ON DELETE CASCADE,
  score        DECIMAL(5,2),
  total_q      INT NOT NULL DEFAULT 0,
  correct_q    INT NOT NULL DEFAULT 0,
  answers      TEXT,
  submitted_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 4. TOEIC
CREATE TABLE IF NOT EXISTS toeic_tests (
  id               SERIAL PRIMARY KEY,
  title            VARCHAR(255) NOT NULL,
  type             VARCHAR(20)  NOT NULL DEFAULT 'full_test',
  duration_minutes INT          NOT NULL DEFAULT 120,
  difficulty       VARCHAR(10)  NOT NULL DEFAULT 'medium',
  description      TEXT,
  status           VARCHAR(20)  NOT NULL DEFAULT 'draft',
  created_by       INT REFERENCES users(id) ON DELETE SET NULL,
  created_at       TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS toeic_question_groups (
  id          SERIAL PRIMARY KEY,
  test_id     INT NOT NULL REFERENCES toeic_tests(id) ON DELETE CASCADE,
  part_num    SMALLINT NOT NULL,
  group_order INT NOT NULL DEFAULT 0,
  audio_url   VARCHAR(500),
  image_url   VARCHAR(500),
  passage     TEXT,
  transcript  TEXT
);

CREATE TABLE IF NOT EXISTS toeic_questions (
  id             SERIAL PRIMARY KEY,
  test_id        INT NOT NULL REFERENCES toeic_tests(id) ON DELETE CASCADE,
  group_id       INT REFERENCES toeic_question_groups(id) ON DELETE SET NULL,
  part_num       SMALLINT NOT NULL,
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
  order_index    INT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS toeic_attempts (
  id                 SERIAL PRIMARY KEY,
  user_id            INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  test_id            INT NOT NULL REFERENCES toeic_tests(id) ON DELETE CASCADE,
  mode               VARCHAR(20) NOT NULL DEFAULT 'mock_test',
  status             VARCHAR(20) NOT NULL DEFAULT 'completed',
  listening_correct  INT NOT NULL DEFAULT 0,
  reading_correct    INT NOT NULL DEFAULT 0,
  listening_score    INT NOT NULL DEFAULT 0,
  reading_score      INT NOT NULL DEFAULT 0,
  total_score        INT NOT NULL DEFAULT 0,
  part_scores        JSONB,
  time_taken_seconds INT,
  completed_at       TIMESTAMP,
  created_at         TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS toeic_attempt_answers (
  id          SERIAL PRIMARY KEY,
  attempt_id  INT NOT NULL REFERENCES toeic_attempts(id) ON DELETE CASCADE,
  question_id INT NOT NULL REFERENCES toeic_questions(id) ON DELETE CASCADE,
  chosen      CHAR(1),
  is_correct  SMALLINT NOT NULL DEFAULT 0,
  UNIQUE (attempt_id, question_id)
);

-- 5. GAMIFICATION
CREATE TABLE IF NOT EXISTS user_daily_tasks (
  id            SERIAL PRIMARY KEY,
  user_id       INT  NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  task_date     DATE NOT NULL,
  task_type     VARCHAR(20) NOT NULL,
  is_completed  SMALLINT    NOT NULL DEFAULT 0,
  exp_awarded   INT         NOT NULL DEFAULT 0,
  completed_at  TIMESTAMP,
  UNIQUE (user_id, task_date, task_type)
);

CREATE TABLE IF NOT EXISTS user_streaks (
  user_id             INT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  current_streak      INT  DEFAULT 0,
  longest_streak      INT  DEFAULT 0,
  last_activity_date  DATE DEFAULT NULL
);

CREATE TABLE IF NOT EXISTS achievements (
  id          SERIAL PRIMARY KEY,
  code        VARCHAR(50)  UNIQUE NOT NULL,
  name        VARCHAR(100) NOT NULL,
  description VARCHAR(255),
  icon        VARCHAR(20),
  category    VARCHAR(20) DEFAULT 'general',
  exp_reward  INT         DEFAULT 0,
  rarity      VARCHAR(20) DEFAULT 'common'
);

CREATE TABLE IF NOT EXISTS user_achievements (
  id             SERIAL PRIMARY KEY,
  user_id        INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  achievement_id INT NOT NULL REFERENCES achievements(id),
  unlocked_at    TIMESTAMP DEFAULT NOW(),
  UNIQUE (user_id, achievement_id)
);

CREATE TABLE IF NOT EXISTS user_daily_first_bonus (
  user_id       INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  activity_date DATE NOT NULL,
  activity_type VARCHAR(20) NOT NULL,
  PRIMARY KEY (user_id, activity_date, activity_type)
);

-- 6. OLD EXAM TABLES (giữ cho tương thích)
CREATE TABLE IF NOT EXISTS exams (
  id          SERIAL PRIMARY KEY,
  title       VARCHAR(200) NOT NULL,
  exam_type   VARCHAR(50)  NOT NULL,
  difficulty  VARCHAR(10)  NOT NULL DEFAULT 'medium',
  duration    INT          NOT NULL DEFAULT 60,
  description TEXT,
  created_by  INT REFERENCES users(id) ON DELETE SET NULL,
  created_at  TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS exam_parts (
  id           SERIAL PRIMARY KEY,
  exam_id      INT NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
  part_name    VARCHAR(100) NOT NULL,
  instructions TEXT,
  order_index  INT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS exam_questions (
  id          SERIAL PRIMARY KEY,
  part_id     INT NOT NULL REFERENCES exam_parts(id) ON DELETE CASCADE,
  question    TEXT NOT NULL,
  option_a    TEXT NOT NULL,
  option_b    TEXT NOT NULL,
  option_c    TEXT NOT NULL,
  option_d    TEXT NOT NULL,
  correct     CHAR(1) NOT NULL,
  explanation TEXT,
  audio_url   VARCHAR(255),
  order_index INT NOT NULL DEFAULT 0,
  created_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS exam_attempts (
  id           SERIAL PRIMARY KEY,
  user_id      INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  exam_id      INT NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
  mode         VARCHAR(20) NOT NULL DEFAULT 'test',
  score        DECIMAL(5,2),
  total_q      INT NOT NULL DEFAULT 0,
  correct_q    INT NOT NULL DEFAULT 0,
  time_spent   INT,
  submitted_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS exam_answers (
  id           SERIAL PRIMARY KEY,
  attempt_id   INT NOT NULL REFERENCES exam_attempts(id) ON DELETE CASCADE,
  question_id  INT NOT NULL REFERENCES exam_questions(id) ON DELETE CASCADE,
  chosen       CHAR(1),
  is_correct   SMALLINT
);
