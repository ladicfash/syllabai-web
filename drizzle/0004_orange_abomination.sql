CREATE TABLE `user_settings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`notificationEmail` varchar(320),
	`notificationPhone` varchar(32),
	`notifyFrequency` enum('every_hour','24_hours_before','as_approaching','every_few_days','disabled') NOT NULL DEFAULT 'as_approaching',
	`notifyEnabled` boolean NOT NULL DEFAULT false,
	`shareDeadlinesEnabled` boolean NOT NULL DEFAULT false,
	`shareDeadlinesRecipients` text,
	`displayName` varchar(128),
	`bio` text,
	`isDeactivated` boolean NOT NULL DEFAULT false,
	`deactivatedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `user_settings_id` PRIMARY KEY(`id`),
	CONSTRAINT `user_settings_userId_unique` UNIQUE(`userId`)
);
