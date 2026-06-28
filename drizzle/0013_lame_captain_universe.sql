CREATE TABLE `courseGraphExports` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`exportType` enum('json','csv','svg') NOT NULL,
	`data` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `courseGraphExports_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `courses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(256) NOT NULL,
	`syllabus` text,
	`startDate` timestamp,
	`endDate` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `courses_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `masteryHistory` (
	`id` int AUTO_INCREMENT NOT NULL,
	`topicId` int NOT NULL,
	`userId` int NOT NULL,
	`score` float NOT NULL,
	`source` enum('quiz_result','flashcard_review','manual_update','ai_assessment') NOT NULL,
	`evidence` text,
	`timestamp` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `masteryHistory_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `topicAssets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`topicId` int NOT NULL,
	`userId` int NOT NULL,
	`assetType` enum('document','note','flashcard_deck','quiz_result','voice_note','video_note','source_item') NOT NULL,
	`assetId` int NOT NULL,
	`weight` float NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `topicAssets_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `topicDependencies` (
	`id` int AUTO_INCREMENT NOT NULL,
	`topicId` int NOT NULL,
	`userId` int NOT NULL,
	`dependsOnTopicId` int NOT NULL,
	`weight` float NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `topicDependencies_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `topics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`courseId` int NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(256) NOT NULL,
	`description` text,
	`parentTopicId` int,
	`masteryScore` float NOT NULL DEFAULT 0,
	`lastReviewedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `topics_id` PRIMARY KEY(`id`)
);
