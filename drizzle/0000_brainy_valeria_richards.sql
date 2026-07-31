CREATE TABLE `admin_sessions` (
	`token_hash` text PRIMARY KEY NOT NULL,
	`expires_at` integer NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `admin_sessions_expiry_idx` ON `admin_sessions` (`expires_at`);--> statement-breakpoint
CREATE TABLE `assets` (
	`id` text PRIMARY KEY NOT NULL,
	`storage_key` text NOT NULL,
	`filename` text NOT NULL,
	`mime_type` text NOT NULL,
	`size` integer NOT NULL,
	`alt_en` text DEFAULT '' NOT NULL,
	`alt_th` text DEFAULT '' NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `assets_storage_key_unique` ON `assets` (`storage_key`);--> statement-breakpoint
CREATE INDEX `assets_storage_key_idx` ON `assets` (`storage_key`);--> statement-breakpoint
CREATE TABLE `content_entries` (
	`id` text PRIMARY KEY NOT NULL,
	`type` text NOT NULL,
	`slug` text,
	`payload` text NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `content_entries_public_idx` ON `content_entries` (`type`,`status`,`sort_order`);--> statement-breakpoint
CREATE TABLE `login_attempts` (
	`attempt_key` text PRIMARY KEY NOT NULL,
	`count` integer DEFAULT 0 NOT NULL,
	`window_started_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `site_settings` (
	`id` text PRIMARY KEY NOT NULL,
	`payload` text NOT NULL,
	`updated_at` integer NOT NULL
);
