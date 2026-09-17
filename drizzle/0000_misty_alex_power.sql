CREATE TABLE `letter_play_sessions` (
	`id` varchar(64) NOT NULL,
	`studentId` varchar(64) NOT NULL,
	`date` varchar(10) NOT NULL,
	`game` varchar(64) NOT NULL,
	`score` int NOT NULL,
	`timestamp` bigint NOT NULL,
	CONSTRAINT `letter_play_sessions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `letter_play_students` (
	`id` varchar(64) NOT NULL,
	`teacherId` varchar(64) NOT NULL,
	`turmaId` varchar(64) NOT NULL,
	`name` varchar(160) NOT NULL,
	`email` varchar(320) NOT NULL,
	`passwordHash` text NOT NULL,
	`scores` text NOT NULL,
	`gamesPlayed` text NOT NULL,
	`totalPoints` int NOT NULL DEFAULT 0,
	`audioEnabled` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `letter_play_students_id` PRIMARY KEY(`id`),
	CONSTRAINT `letter_play_students_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `letter_play_teachers` (
	`id` varchar(64) NOT NULL,
	`name` varchar(160) NOT NULL,
	`email` varchar(320) NOT NULL,
	`passwordHash` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `letter_play_teachers_id` PRIMARY KEY(`id`),
	CONSTRAINT `letter_play_teachers_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `letter_play_turmas` (
	`id` varchar(64) NOT NULL,
	`teacherId` varchar(64) NOT NULL,
	`year` varchar(32) NOT NULL,
	`letter` varchar(4) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `letter_play_turmas_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`openId` varchar(64) NOT NULL,
	`name` text,
	`email` varchar(320),
	`loginMethod` varchar(64),
	`role` enum('user','admin') NOT NULL DEFAULT 'user',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`lastSignedIn` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_openId_unique` UNIQUE(`openId`)
);
