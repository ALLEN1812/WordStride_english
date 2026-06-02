-- Reset toàn bộ sequence về giá trị MAX(id)+1
-- BẮT BUỘC chạy sau khi import dữ liệu có id cụ thể, nếu không INSERT mới sẽ lỗi duplicate key

SELECT setval(pg_get_serial_sequence('users', 'id'),                    COALESCE((SELECT MAX(id) FROM users), 1));
SELECT setval(pg_get_serial_sequence('achievements', 'id'),            COALESCE((SELECT MAX(id) FROM achievements), 1));
SELECT setval(pg_get_serial_sequence('vocab_topics', 'id'),            COALESCE((SELECT MAX(id) FROM vocab_topics), 1));
SELECT setval(pg_get_serial_sequence('flashcards', 'id'),              COALESCE((SELECT MAX(id) FROM flashcards), 1));
SELECT setval(pg_get_serial_sequence('user_flashcard_sets', 'id'),     COALESCE((SELECT MAX(id) FROM user_flashcard_sets), 1));
SELECT setval(pg_get_serial_sequence('user_flashcard_items', 'id'),    COALESCE((SELECT MAX(id) FROM user_flashcard_items), 1));
SELECT setval(pg_get_serial_sequence('user_flashcard_progress', 'id'), COALESCE((SELECT MAX(id) FROM user_flashcard_progress), 1));
SELECT setval(pg_get_serial_sequence('grammar_lessons', 'id'),         COALESCE((SELECT MAX(id) FROM grammar_lessons), 1));
SELECT setval(pg_get_serial_sequence('grammar_sections', 'id'),        COALESCE((SELECT MAX(id) FROM grammar_sections), 1));
SELECT setval(pg_get_serial_sequence('grammar_questions', 'id'),       COALESCE((SELECT MAX(id) FROM grammar_questions), 1));
SELECT setval(pg_get_serial_sequence('grammar_attempts', 'id'),        COALESCE((SELECT MAX(id) FROM grammar_attempts), 1));
SELECT setval(pg_get_serial_sequence('grammar_section_attempts','id'), COALESCE((SELECT MAX(id) FROM grammar_section_attempts), 1));
SELECT setval(pg_get_serial_sequence('toeic_tests', 'id'),             COALESCE((SELECT MAX(id) FROM toeic_tests), 1));
SELECT setval(pg_get_serial_sequence('toeic_question_groups', 'id'),   COALESCE((SELECT MAX(id) FROM toeic_question_groups), 1));
SELECT setval(pg_get_serial_sequence('toeic_questions', 'id'),         COALESCE((SELECT MAX(id) FROM toeic_questions), 1));
SELECT setval(pg_get_serial_sequence('toeic_attempts', 'id'),          COALESCE((SELECT MAX(id) FROM toeic_attempts), 1));
SELECT setval(pg_get_serial_sequence('toeic_attempt_answers', 'id'),   COALESCE((SELECT MAX(id) FROM toeic_attempt_answers), 1));
SELECT setval(pg_get_serial_sequence('user_daily_tasks', 'id'),        COALESCE((SELECT MAX(id) FROM user_daily_tasks), 1));
SELECT setval(pg_get_serial_sequence('user_achievements', 'id'),       COALESCE((SELECT MAX(id) FROM user_achievements), 1));
