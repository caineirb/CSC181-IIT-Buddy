DROP DATABASE IF EXISTS `iit_buddy_db`;
CREATE DATABASE `iit_buddy_db`;
USE `iit_buddy_db`;

CREATE TABLE `students`(
	`id` CHAR(21),
	`name` VARCHAR(150),
	`email` VARCHAR(175),
	CONSTRAINT `pk_student` PRIMARY KEY(`id`),
	CONSTRAINT `unique_name` UNIQUE(`name`),
	CONSTRAINT `unique_email` UNIQUE(`email`)
);

CREATE TABLE `timers`(
	`student_id` CHAR(21),
	`timer_state` JSON NOT NULL,
	`timer_set` JSON NOT NULL,
	CONSTRAINT `pk_timer` PRIMARY KEY(`student_id`),
	CONSTRAINT `fk_timer_student` FOREIGN KEY(`student_id`) REFERENCES `students`(`id`)
);

CREATE TABLE `courses`(
	`code` VARCHAR(10),
	`name` VARCHAR(100),
	CONSTRAINT `pk_course` PRIMARY KEY(`code`),
	CONSTRAINT `unique_name` UNIQUE(`name`)
);

INSERT INTO `courses`(`code`, `name`) VALUES
("CSC181", "Software Engineering"),
("CCC181", "Applications Development and Emerging Technologies"),
("CSC145", "Programming Languages"),
("CSC155", "Introduction to Operating Systems"),
("CSC171", "Introduction to Artificial Intelligence"),
("CCC151", "Information Management"),
("CSC112", "Computer Organization and Architecture"),
("CSC124", "Design and Analysis of Algorithms");

CREATE TABLE `notes`(
	`id` VARCHAR(40) NOT NULL,
	`title` VARCHAR(100) NOT NULL,
	`privacy` ENUM('Private', 'Public', 'Shared') NOT NULL,
	`owner_id` CHAR(21) NOT NULL,
	`link` VARCHAR(200) NOT NULL,
	`created_on` DATETIME DEFAULT CURRENT_TIMESTAMP,
	`view_count` INT UNSIGNED DEFAULT 0,
	`take_count` INT UNSIGNED DEFAULT 0,
	`course` VARCHAR(10) DEFAULT NULL,
	CONSTRAINT `pk_note` PRIMARY KEY(`id`),
	CONSTRAINT `unique_link` UNIQUE(`link`),
	CONSTRAINT `unique_note_title` UNIQUE(`title`, `owner_id`),
	CONSTRAINT `fk_note_student` FOREIGN KEY(`owner_id`) REFERENCES `students`(`id`),
	CONSTRAINT `fk_note_course` FOREIGN KEY(`course`) REFERENCES `courses`(`code`)
);

DELIMITER //
CREATE TRIGGER `generate_note_id`
BEFORE INSERT ON `notes`
FOR EACH ROW
BEGIN
	DECLARE random_suffix CHAR(4);
	
	-- Generate a random 4-character suffix to ensure uniqueness
	SET random_suffix = SUBSTRING(MD5(RAND()), 1, 4);
	
	-- Concatenate title, owner_id, and random suffix, then hash it with SHA1
	SET NEW.id = SHA1(CONCAT(NEW.`created_on`, NEW.`owner_id`, random_suffix));
END //
DELIMITER ;

CREATE TABLE `reviewers`(
	`id` VARCHAR(40) NOT NULL,
	`title` VARCHAR(100) NOT NULL,
	`description` VARCHAR(300) DEFAULT NULL,
	`type` ENUM('Flashcard', 'Identification', 'Multiple Choice', 'Mixed') NOT NULL,
	`privacy` ENUM('Private', 'Public', 'Shared') NOT NULL,
	`owner_id` CHAR(21) NOT NULL,
	`created_on` DATETIME DEFAULT CURRENT_TIMESTAMP,
	`view_count` INT UNSIGNED DEFAULT 0,
	`take_count` INT UNSIGNED DEFAULT 0,
	`course` VARCHAR(10) DEFAULT NULL,
	CONSTRAINT `pk_reviewer` PRIMARY KEY(`id`),
	CONSTRAINT `unique_reviewer` UNIQUE(`title`, `owner_id`, `type`),
	CONSTRAINT `fk_reviewer_student` FOREIGN KEY(`owner_id`) REFERENCES `students`(`id`),
	CONSTRAINT `fk_reviewer_course` FOREIGN KEY(`course`) REFERENCES `courses`(`code`)
);

DELIMITER //
CREATE TRIGGER `generate_reviewer_id`
BEFORE INSERT ON `reviewers`
FOR EACH ROW
BEGIN
	DECLARE random_suffix CHAR(4);
	
	-- Generate a random 4-character suffix to ensure uniqueness
	SET random_suffix = SUBSTRING(MD5(RAND()), 1, 4);
	
	-- Concatenate title, owner_id, and random suffix, then hash it with SHA1
	SET NEW.id = SHA1(CONCAT(NEW.`created_on`, NEW.`owner_id`, NEW.`type`, random_suffix));
END //
DELIMITER ;

CREATE TABLE `items` (
	`reviewer_id` VARCHAR(40) NOT NULL,
	`number` INT NOT NULL,
	`question` VARCHAR(255) NULL,
	`question_image` MEDIUMBLOB DEFAULT NULL,
	CONSTRAINT `pk_item` PRIMARY KEY(`reviewer_id`, `number`),
	CONSTRAINT `fk_item_reviewer` FOREIGN KEY(`reviewer_id`) REFERENCES `reviewers`(`id`) ON DELETE CASCADE
);

CREATE TABLE `answers`(
	`reviewer_id` VARCHAR(40) NOT NULL,
	`question_number` INT NOT NULL,
	`answer_text` VARCHAR(150) DEFAULT NULL,
	`answer_image` MEDIUMBLOB DEFAULT NULL,
	`is_correct` BOOLEAN NOT NULL DEFAULT FALSE,
	CONSTRAINT `fk_answer_item` FOREIGN KEY(`reviewer_id`,`question_number`) REFERENCES `items`(`reviewer_id`,`number`) ON DELETE CASCADE
);

CREATE TABLE `saved_reviewers` (
	`student_id` CHAR(21),
	`reviewer_id` VARCHAR(40),
	CONSTRAINT `pk_saved_reviewer` PRIMARY KEY(`student_id`, `reviewer_id`),
	CONSTRAINT `fk_saved_reviewer_student` FOREIGN KEY(`student_id`) REFERENCES `students`(`id`) ON DELETE CASCADE,
	CONSTRAINT `fk_saved_reviewer_reviewer` FOREIGN KEY(`reviewer_id`) REFERENCES `reviewers`(`id`) ON DELETE CASCADE 
);

CREATE TABLE `saved_notes` (
	`student_id` CHAR(21),
	`note_id` VARCHAR(40),
	CONSTRAINT `pk_saved_note` PRIMARY KEY(`student_id`, `note_id`),
	CONSTRAINT `fk_saved_note_student` FOREIGN KEY(`student_id`) REFERENCES `students`(`id`) ON DELETE CASCADE,
	CONSTRAINT `fk_saved_note_note` FOREIGN KEY(`note_id`) REFERENCES `notes`(`id`) ON DELETE CASCADE 
);