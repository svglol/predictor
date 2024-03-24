CREATE TABLE `Account` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`userId` text(191) NOT NULL,
	`type` text(191) NOT NULL,
	`provider` text(191) NOT NULL,
	`providerAccountId` text(191) NOT NULL,
	`refresh_token` text,
	`access_token` text,
	`expires_at` integer,
	`token_type` text(191),
	`scope` text(191),
	`id_token` text,
	`session_state` text(191),
	FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `Event` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`slug` text(191),
	`name` text(191),
	`description` text(191),
	`event_start_date` integer,
	`event_end_date` integer,
	`predictions_close_date` integer,
	`status` text DEFAULT 'DRAFT' NOT NULL,
	`information` text,
	`image` text
);
--> statement-breakpoint
CREATE TABLE `EventEntry` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`eventId` integer NOT NULL,
	`userId` text(191) NOT NULL,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`total_score` real DEFAULT 0 NOT NULL,
	`rank` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`eventId`) REFERENCES `Event`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `EventEntryQuestion` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`eventEntrySectionId` integer NOT NULL,
	`entryString` text(191),
	`entryBoolean` integer,
	`entryNumber` real,
	`entryOptionId` integer,
	`questionId` integer NOT NULL,
	`question_score` real DEFAULT 0 NOT NULL,
	FOREIGN KEY (`eventEntrySectionId`) REFERENCES `EventEntrySection`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`questionId`) REFERENCES `Question`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `EventEntrySection` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`sectionId` integer NOT NULL,
	`eventEntryId` integer NOT NULL,
	`section_score` real DEFAULT 0 NOT NULL,
	FOREIGN KEY (`sectionId`) REFERENCES `EventSection`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`eventEntryId`) REFERENCES `EventEntry`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `EventSection` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`eventId` integer NOT NULL,
	`heading` text(191),
	`description` text(191),
	`order` integer NOT NULL,
	FOREIGN KEY (`eventId`) REFERENCES `Event`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `Notification` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`userId` text(191) NOT NULL,
	`body` text(191) NOT NULL,
	`icon` text(191),
	`url` text(191) NOT NULL,
	`read` integer DEFAULT false NOT NULL,
	`createdAt` integer NOT NULL,
	`eventId` integer,
	FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`eventId`) REFERENCES `Event`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `Option` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text(191) NOT NULL,
	`optionSetId` integer NOT NULL,
	`order` integer NOT NULL,
	FOREIGN KEY (`optionSetId`) REFERENCES `OptionSet`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `OptionSet` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text(191),
	`eventId` integer,
	FOREIGN KEY (`eventId`) REFERENCES `Event`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `Question` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`type` text,
	`question` text(191),
	`optionSetId` integer,
	`eventSectionId` integer NOT NULL,
	`order` integer NOT NULL,
	`points` real DEFAULT 1 NOT NULL,
	`resultString` text(191),
	`resultBoolean` integer,
	`resultNumber` real,
	`optionId` integer,
	`hint` text(191),
	FOREIGN KEY (`optionSetId`) REFERENCES `OptionSet`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`eventSectionId`) REFERENCES `EventSection`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`optionId`) REFERENCES `Option`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `Session` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`sessionToken` text(191) NOT NULL,
	`userId` text(191) NOT NULL,
	`expires` integer NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `User` (
	`id` text(191) PRIMARY KEY NOT NULL,
	`name` text(191),
	`email` text(191),
	`emailVerified` integer,
	`image` text,
	`role` text(191) DEFAULT 'USER' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `VerificationToken` (
	`identifier` text(191) NOT NULL,
	`token` text(191) NOT NULL,
	`expires` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `Account_userId_idx` ON `Account` (`userId`);--> statement-breakpoint
CREATE UNIQUE INDEX `Account_provider_providerAccountId_key` ON `Account` (`provider`,`providerAccountId`);--> statement-breakpoint
CREATE UNIQUE INDEX `Event_slug_unique` ON `Event` (`slug`);--> statement-breakpoint
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
CREATE INDEX `Question_optionSetId_idx` ON `Question` (`optionSetId`);--> statement-breakpoint
CREATE INDEX `Session_userId_idx` ON `Session` (`userId`);--> statement-breakpoint
CREATE UNIQUE INDEX `Session_sessionToken_key` ON `Session` (`sessionToken`);--> statement-breakpoint
CREATE UNIQUE INDEX `User_name_unique` ON `User` (`name`);--> statement-breakpoint
CREATE UNIQUE INDEX `User_email_key` ON `User` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `VerificationToken_token_key` ON `VerificationToken` (`token`);--> statement-breakpoint
CREATE UNIQUE INDEX `VerificationToken_identifier_token_key` ON `VerificationToken` (`identifier`,`token`);