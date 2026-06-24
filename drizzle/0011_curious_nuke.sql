CREATE TABLE `study_activity` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`activityType` varchar(64) NOT NULL,
	`count` int NOT NULL DEFAULT 1,
	`activityDate` varchar(10) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `study_activity_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `study_outputs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(256) NOT NULL,
	`templateType` varchar(64) NOT NULL,
	`documentIdsJson` json,
	`sourceNamesJson` json,
	`content` text NOT NULL,
	`depth` varchar(32),
	`examContext` varchar(128),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `study_outputs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `task_subtasks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`taskId` int NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(512) NOT NULL,
	`isDone` boolean NOT NULL DEFAULT false,
	`orderIndex` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `task_subtasks_id` PRIMARY KEY(`id`)
);
