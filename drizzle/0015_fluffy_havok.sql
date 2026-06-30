ALTER TABLE `notes` ADD `format` varchar(32) DEFAULT 'markdown' NOT NULL;--> statement-breakpoint
ALTER TABLE `notes` ADD `preview` text;