CREATE TABLE `video_notes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(256) NOT NULL DEFAULT 'Video Note',
	`s3Key` varchar(1024) NOT NULL,
	`s3Url` text NOT NULL,
	`duration` int NOT NULL DEFAULT 0,
	`videoMimeType` varchar(128) NOT NULL DEFAULT 'video/webm',
	`transcript` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `video_notes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `voice_notes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(256) NOT NULL DEFAULT 'Voice Note',
	`s3Key` varchar(1024) NOT NULL,
	`s3Url` text NOT NULL,
	`duration` int NOT NULL DEFAULT 0,
	`transcript` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `voice_notes_id` PRIMARY KEY(`id`)
);
