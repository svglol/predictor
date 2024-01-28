CREATE TABLE `Account` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`type` varchar(191) NOT NULL,
	`provider` varchar(191) NOT NULL,
	`providerAccountId` varchar(191) NOT NULL,
	`refresh_token` text,
	`access_token` text,
	`expires_at` int,
	`token_type` varchar(191),
	`scope` varchar(191),
	`id_token` text,
	`session_state` varchar(191),
	CONSTRAINT `Account_provider_providerAccountId_pk` PRIMARY KEY(`provider`,`providerAccountId`)
);
--> statement-breakpoint
CREATE TABLE `Event` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(191),
	`description` varchar(191),
	`event_start_date` datetime(3),
	`event_end_date` datetime(3),
	`predictions_close_date` datetime(3),
	`inviteId` varchar(191) NOT NULL,
	`visible` boolean NOT NULL DEFAULT false,
	`information` longtext,
	`image` longtext,
	CONSTRAINT `Event_id` PRIMARY KEY(`id`),
	CONSTRAINT `Event_id_key` UNIQUE(`id`),
	CONSTRAINT `Event_inviteId_key` UNIQUE(`inviteId`)
);
--> statement-breakpoint
CREATE TABLE `EventEntry` (
	`id` int AUTO_INCREMENT NOT NULL,
	`eventId` int NOT NULL,
	`userId` int NOT NULL,
	`created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	`updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	`total_score` double NOT NULL,
	`rank` int NOT NULL DEFAULT 0,
	CONSTRAINT `EventEntry_id` PRIMARY KEY(`id`),
	CONSTRAINT `EventEntry_id_key` UNIQUE(`id`)
);
--> statement-breakpoint
CREATE TABLE `EventEntryQuestion` (
	`id` int AUTO_INCREMENT NOT NULL,
	`eventEntrySectionId` int NOT NULL,
	`entryString` varchar(191),
	`entryBoolean` tinyint,
	`entryNumber` double,
	`entryOptionId` int,
	`questionId` int NOT NULL,
	`question_score` double NOT NULL,
	CONSTRAINT `EventEntryQuestion_id` PRIMARY KEY(`id`),
	CONSTRAINT `EventEntryQuestion_id_key` UNIQUE(`id`)
);
--> statement-breakpoint
CREATE TABLE `EventEntrySection` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sectionId` int NOT NULL,
	`eventEntryId` int NOT NULL,
	`section_score` double NOT NULL,
	CONSTRAINT `EventEntrySection_id` PRIMARY KEY(`id`),
	CONSTRAINT `EventEntrySection_id_key` UNIQUE(`id`)
);
--> statement-breakpoint
CREATE TABLE `EventSection` (
	`id` int AUTO_INCREMENT NOT NULL,
	`eventId` int NOT NULL,
	`heading` varchar(191),
	`description` varchar(191),
	`order` int NOT NULL,
	CONSTRAINT `EventSection_id` PRIMARY KEY(`id`),
	CONSTRAINT `EventSection_id_key` UNIQUE(`id`)
);
--> statement-breakpoint
CREATE TABLE `Option` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(191) NOT NULL,
	`optionSetId` int NOT NULL,
	`order` int NOT NULL,
	CONSTRAINT `Option_id` PRIMARY KEY(`id`),
	CONSTRAINT `Option_id_key` UNIQUE(`id`)
);
--> statement-breakpoint
CREATE TABLE `OptionSet` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(191),
	`eventId` int,
	CONSTRAINT `OptionSet_id` PRIMARY KEY(`id`),
	CONSTRAINT `OptionSet_id_key` UNIQUE(`id`)
);
--> statement-breakpoint
CREATE TABLE `Question` (
	`id` int AUTO_INCREMENT NOT NULL,
	`type` enum('MULTI','TIME','NUMBER','TEXT','BOOLEAN'),
	`question` varchar(191),
	`optionSetId` int,
	`eventSectionId` int NOT NULL,
	`order` int NOT NULL,
	`points` double NOT NULL DEFAULT 1,
	`resultString` varchar(191),
	`resultBoolean` tinyint,
	`resultNumber` double,
	`optionId` int,
	`hint` varchar(191),
	CONSTRAINT `Question_id` PRIMARY KEY(`id`),
	CONSTRAINT `Question_id_key` UNIQUE(`id`)
);
--> statement-breakpoint
CREATE TABLE `Session` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sessionToken` varchar(191) NOT NULL,
	`userId` int NOT NULL,
	`expires` datetime(3) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `User` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(191),
	`email` varchar(191),
	`emailVerified` datetime(3),
	`image` longtext,
	`role` varchar(191) NOT NULL DEFAULT 'USER'
);
--> statement-breakpoint
CREATE TABLE `VerificationToken` (
	`identifier` varchar(191) NOT NULL,
	`token` varchar(191) NOT NULL,
	`expires` datetime(3) NOT NULL,
	CONSTRAINT `VerificationToken_identifier_token_pk` PRIMARY KEY(`identifier`,`token`)
);
--> statement-breakpoint
CREATE INDEX `EventEntry_eventId_idx` ON `EventEntry` (`eventId`);--> statement-breakpoint
CREATE INDEX `EventEntry_userId_idx` ON `EventEntry` (`userId`);--> statement-breakpoint
CREATE INDEX `EventEntryQuestion_entryOptionId_idx` ON `EventEntryQuestion` (`entryOptionId`);--> statement-breakpoint
CREATE INDEX `EventEntryQuestion_eventEntrySectionId_idx` ON `EventEntryQuestion` (`eventEntrySectionId`);--> statement-breakpoint
CREATE INDEX `EventEntryQuestion_questionId_idx` ON `EventEntryQuestion` (`questionId`);--> statement-breakpoint
CREATE INDEX `EventEntrySection_eventEntryId_idx` ON `EventEntrySection` (`eventEntryId`);--> statement-breakpoint
CREATE INDEX `EventEntrySection_sectionId_idx` ON `EventEntrySection` (`sectionId`);--> statement-breakpoint
CREATE INDEX `EventSection_eventId_idx` ON `EventSection` (`eventId`);--> statement-breakpoint
CREATE INDEX `Option_optionSetId_idx` ON `Option` (`optionSetId`);--> statement-breakpoint
CREATE INDEX `OptionSet_eventId_idx` ON `OptionSet` (`eventId`);--> statement-breakpoint
CREATE INDEX `Question_eventSectionId_idx` ON `Question` (`eventSectionId`);--> statement-breakpoint
CREATE INDEX `Question_optionId_idx` ON `Question` (`optionId`);--> statement-breakpoint
CREATE INDEX `Question_optionSetId_idx` ON `Question` (`optionSetId`);