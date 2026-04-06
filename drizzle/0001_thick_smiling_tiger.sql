CREATE TABLE `attempts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`session_id` int NOT NULL,
	`question_id` int NOT NULL,
	`given_answer` varchar(1) NOT NULL,
	`is_correct` int NOT NULL,
	`attempt_number` int NOT NULL DEFAULT 1,
	`response_time` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `attempts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `questions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`quiz_id` int NOT NULL,
	`qr_code` varchar(255) NOT NULL,
	`question_text` text NOT NULL,
	`option_a` varchar(255) NOT NULL,
	`option_b` varchar(255) NOT NULL,
	`option_c` varchar(255) NOT NULL,
	`option_d` varchar(255) NOT NULL,
	`correct_answer` varchar(1) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `questions_id` PRIMARY KEY(`id`),
	CONSTRAINT `questions_qr_code_unique` UNIQUE(`qr_code`)
);
--> statement-breakpoint
CREATE TABLE `quizzes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`created_by` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `quizzes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`quiz_id` int NOT NULL,
	`session_code` varchar(64) NOT NULL,
	`user_qr_code` varchar(255) NOT NULL,
	`user_name` varchar(255) NOT NULL,
	`status` enum('active','completed','abandoned') NOT NULL DEFAULT 'active',
	`started_at` timestamp NOT NULL DEFAULT (now()),
	`completed_at` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `sessions_id` PRIMARY KEY(`id`),
	CONSTRAINT `sessions_session_code_unique` UNIQUE(`session_code`),
	CONSTRAINT `sessions_user_qr_code_unique` UNIQUE(`user_qr_code`)
);
--> statement-breakpoint
ALTER TABLE `attempts` ADD CONSTRAINT `attempts_session_id_sessions_id_fk` FOREIGN KEY (`session_id`) REFERENCES `sessions`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `attempts` ADD CONSTRAINT `attempts_question_id_questions_id_fk` FOREIGN KEY (`question_id`) REFERENCES `questions`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `questions` ADD CONSTRAINT `questions_quiz_id_quizzes_id_fk` FOREIGN KEY (`quiz_id`) REFERENCES `quizzes`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `quizzes` ADD CONSTRAINT `quizzes_created_by_users_id_fk` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `sessions` ADD CONSTRAINT `sessions_quiz_id_quizzes_id_fk` FOREIGN KEY (`quiz_id`) REFERENCES `quizzes`(`id`) ON DELETE no action ON UPDATE no action;