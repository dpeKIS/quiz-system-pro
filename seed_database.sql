-- Insert test user
INSERT INTO users (openId, name, email, role) VALUES 
('test-user-001', 'Test User', 'test@example.com', 'user'),
('admin-user-001', 'Admin User', 'admin@example.com', 'admin');

-- Insert quizzes
INSERT INTO quizzes (title, description, created_by) VALUES 
('General Knowledge', 'Test your general knowledge', 1),
('Science Quiz', 'Questions about science', 1),
('History Quiz', 'Historical events and figures', 1);

-- Insert questions for Quiz 1
INSERT INTO questions (quiz_id, qr_code, question_text, option_a, option_b, option_c, option_d, correct_answer) VALUES 
(1, 'CARD_Q001', 'What is the capital of France?', 'London', 'Berlin', 'Paris', 'Madrid', 'C'),
(1, 'CARD_Q002', 'Which planet is closest to the Sun?', 'Venus', 'Mercury', 'Earth', 'Mars', 'B'),
(1, 'CARD_Q003', 'What is the largest ocean on Earth?', 'Atlantic', 'Indian', 'Arctic', 'Pacific', 'D');

-- Insert questions for Quiz 2
INSERT INTO questions (quiz_id, qr_code, question_text, option_a, option_b, option_c, option_d, correct_answer) VALUES 
(2, 'CARD_Q004', 'What is the chemical symbol for Gold?', 'Go', 'Gd', 'Au', 'Ag', 'C'),
(2, 'CARD_Q005', 'What is the speed of light?', '300,000 km/s', '150,000 km/s', '450,000 km/s', '600,000 km/s', 'A');

-- Insert questions for Quiz 3
INSERT INTO questions (quiz_id, qr_code, question_text, option_a, option_b, option_c, option_d, correct_answer) VALUES 
(3, 'CARD_Q006', 'In what year did World War II end?', '1943', '1944', '1945', '1946', 'C');

-- Insert test session
INSERT INTO sessions (quiz_id, session_code, user_qr_code, user_name, status) VALUES 
(1, 'SESSION_001', 'USER_0001', 'John Doe', 'active');

-- Insert test attempts
INSERT INTO attempts (session_id, question_id, given_answer, is_correct, attempt_number, response_time) VALUES 
(1, 1, 'C', 1, 1, 5000),
(1, 2, 'B', 1, 1, 3000),
(1, 3, 'D', 1, 1, 4500);
