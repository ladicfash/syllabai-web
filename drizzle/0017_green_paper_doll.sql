CREATE TABLE `document_tag_assignments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`documentId` int NOT NULL,
	`tagId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `document_tag_assignments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `document_tags` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(128) NOT NULL,
	`color` varchar(32) NOT NULL DEFAULT '#3b9edd',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `document_tags_id` PRIMARY KEY(`id`)
);
