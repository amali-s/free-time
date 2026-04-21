CREATE TYPE "public"."noise_level" AS ENUM('quiet', 'moderate', 'loud');--> statement-breakpoint
CREATE TYPE "public"."price_type" AS ENUM('free', 'paid', 'purchase-required');--> statement-breakpoint
CREATE TYPE "public"."space_type" AS ENUM('cafe', 'coworking', 'library', 'park', 'plaza', 'transit', 'lobby', 'other');--> statement-breakpoint
CREATE TABLE "cities" (
	"slug" varchar(100) PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"region" varchar(50),
	"country" varchar(10) NOT NULL,
	"lat" real NOT NULL,
	"lng" real NOT NULL
);
--> statement-breakpoint
CREATE TABLE "spaces" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"type" "space_type" NOT NULL,
	"lat" real NOT NULL,
	"lng" real NOT NULL,
	"address" text NOT NULL,
	"city" varchar(100) NOT NULL,
	"amenities" text[] NOT NULL,
	"tags" text[] NOT NULL,
	"price_type" "price_type" NOT NULL,
	"noise_level" "noise_level" NOT NULL,
	"hours" jsonb,
	"description" text,
	"image_url" text,
	"website_url" text
);
