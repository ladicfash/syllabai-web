CREATE TABLE `quiz_me_reports` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`documentId` int NOT NULL,
	`title` varchar(256) NOT NULL,
	`questionCount` int NOT NULL DEFAULT 0,
	`scorePercent` int NOT NULL DEFAULT 0,
	`mcqScore` int NOT NULL DEFAULT 0,
	`shortAnswerScore` int NOT NULL DEFAULT 0,
	`answersJson` json,
	`flagsJson` json,
	`startedAt` timestamp,
	`completedAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `quiz_me_reports_id` PRIMARY KEY(`id`)
);
