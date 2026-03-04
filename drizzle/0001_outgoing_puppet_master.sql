CREATE TABLE `events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`type` enum('aéreo','terrestre','marítimo') NOT NULL,
	`country` enum('iran','israel') NOT NULL,
	`description` text NOT NULL,
	`sourceName` varchar(255) NOT NULL,
	`sourceUrl` varchar(512) NOT NULL,
	`latitude` decimal(10,8) NOT NULL,
	`longitude` decimal(11,8) NOT NULL,
	`locationName` varchar(255) NOT NULL,
	`confirmed` boolean NOT NULL DEFAULT false,
	`eventDate` timestamp NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`confirmedBy` int,
	CONSTRAINT `events_id` PRIMARY KEY(`id`)
);
