-- ============================================================
-- MIGRATION: Add EXP/Level/Daily Tasks system
-- Run this on existing databases
-- ============================================================

USE english_app;

-- Add exp and level columns to users (safe to run multiple times)
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS total_exp INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS level     INT NOT NULL DEFAULT 1;

-- Create daily tasks tracking table
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
