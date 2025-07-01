CREATE TABLE `activity_logs` (
	`id` integer PRIMARY KEY NOT NULL,
	`driver_id` integer NOT NULL,
	`activity` text NOT NULL,
	`description` text NOT NULL,
	`timestamp` text DEFAULT 'CURRENT_TIMESTAMP' NOT NULL,
	`related_entity_type` text,
	`related_entity_id` integer
);
--> statement-breakpoint
CREATE TABLE `documents` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`type` text NOT NULL,
	`shipment_id` integer,
	`driver_id` integer,
	`file_path` text,
	`uploaded_at` text DEFAULT 'CURRENT_TIMESTAMP' NOT NULL,
	`is_active` integer DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE `drivers` (
	`id` integer PRIMARY KEY NOT NULL,
	`username` text NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`phone` text NOT NULL,
	`license_number` text NOT NULL,
	`role` text DEFAULT 'driver' NOT NULL,
	`status` text DEFAULT 'off_duty' NOT NULL,
	`duty_start_time` text,
	`current_vehicle_id` integer,
	`current_trailer_id` integer,
	`is_active` integer DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `drivers_username_unique` ON `drivers` (`username`);--> statement-breakpoint
CREATE TABLE `hours_of_service` (
	`id` integer PRIMARY KEY NOT NULL,
	`driver_id` integer NOT NULL,
	`date` text DEFAULT 'CURRENT_TIMESTAMP' NOT NULL,
	`driving_hours` real DEFAULT 0 NOT NULL,
	`on_duty_hours` real DEFAULT 0 NOT NULL,
	`remaining_drive_time` real DEFAULT 11 NOT NULL,
	`remaining_duty_time` real DEFAULT 14 NOT NULL,
	`is_compliant` integer DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE `inspection_reports` (
	`id` integer PRIMARY KEY NOT NULL,
	`driver_id` integer NOT NULL,
	`vehicle_id` integer NOT NULL,
	`trailer_id` integer,
	`type` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`defects_found` integer DEFAULT false NOT NULL,
	`notes` text,
	`created_at` text DEFAULT 'CURRENT_TIMESTAMP' NOT NULL,
	`completed_at` text
);
--> statement-breakpoint
CREATE TABLE `shipments` (
	`id` integer PRIMARY KEY NOT NULL,
	`shipping_id` text NOT NULL,
	`origin` text NOT NULL,
	`destination` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`assigned_driver_id` integer,
	`assigned_vehicle_id` integer,
	`assigned_trailer_id` integer,
	`estimated_distance` integer,
	`actual_distance` integer,
	`created_at` text DEFAULT 'CURRENT_TIMESTAMP' NOT NULL,
	`delivery_date` text,
	`is_active` integer DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `shipments_shipping_id_unique` ON `shipments` (`shipping_id`);--> statement-breakpoint
CREATE TABLE `trailers` (
	`id` integer PRIMARY KEY NOT NULL,
	`trailer_number` text NOT NULL,
	`type` text NOT NULL,
	`capacity` real NOT NULL,
	`status` text DEFAULT 'available' NOT NULL,
	`last_inspection_date` text,
	`is_active` integer DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `trailers_trailer_number_unique` ON `trailers` (`trailer_number`);--> statement-breakpoint
CREATE TABLE `vehicles` (
	`id` integer PRIMARY KEY NOT NULL,
	`vehicle_number` text NOT NULL,
	`make` text NOT NULL,
	`model` text NOT NULL,
	`year` integer NOT NULL,
	`vin` text NOT NULL,
	`license_plate` text NOT NULL,
	`fuel_level` real DEFAULT 100 NOT NULL,
	`mileage` integer DEFAULT 0 NOT NULL,
	`status` text DEFAULT 'available' NOT NULL,
	`last_inspection_date` text,
	`is_active` integer DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `vehicles_vehicle_number_unique` ON `vehicles` (`vehicle_number`);