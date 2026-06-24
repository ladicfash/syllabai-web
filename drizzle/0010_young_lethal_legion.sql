CREATE TABLE `source_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`source` varchar(64) NOT NULL,
	`externalId` varchar(255) NOT NULL,
	`title` text NOT NULL,
	`abstract` text,
	`url` text,
	`authorsJson` json,
	`license` varchar(255),
	`contentType` varchar(64),
	`importedDocumentId` int,
	`metadataJson` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `source_items_id` PRIMARY KEY(`id`)
);
