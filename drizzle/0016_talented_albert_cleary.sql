CREATE TABLE `studyRooms` (
	`id` int AUTO_INCREMENT NOT NULL,
	`hostUserId` int NOT NULL,
	`roomCode` varchar(32) NOT NULL,
	`topic` varchar(256) NOT NULL,
	`durationMinutes` int NOT NULL DEFAULT 30,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `studyRooms_id` PRIMARY KEY(`id`),
	CONSTRAINT `studyRooms_roomCode_unique` UNIQUE(`roomCode`)
);
