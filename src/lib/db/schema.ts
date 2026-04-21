import {
  pgTable,
  pgEnum,
  text,
  real,
  varchar,
  jsonb,
} from "drizzle-orm/pg-core";

/* ---- Enums ---- */

export const spaceTypeEnum = pgEnum("space_type", [
  "cafe",
  "coworking",
  "library",
  "park",
  "plaza",
  "transit",
  "lobby",
  "other",
]);

export const priceTypeEnum = pgEnum("price_type", [
  "free",
  "paid",
  "purchase-required",
]);

export const noiseLevelEnum = pgEnum("noise_level", [
  "quiet",
  "moderate",
  "loud",
]);

/* ---- Tables ---- */

export const spaces = pgTable("spaces", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  type: spaceTypeEnum("type").notNull(),
  lat: real("lat").notNull(),
  lng: real("lng").notNull(),
  address: text("address").notNull(),
  city: varchar("city", { length: 100 }).notNull(),
  amenities: text("amenities").array().notNull(),
  tags: text("tags").array().notNull(),
  priceType: priceTypeEnum("price_type").notNull(),
  noiseLevel: noiseLevelEnum("noise_level").notNull(),
  hours: jsonb("hours"),
  description: text("description"),
  imageUrl: text("image_url"),
  websiteUrl: text("website_url"),
});

export const cities = pgTable("cities", {
  slug: varchar("slug", { length: 100 }).primaryKey(),
  name: text("name").notNull(),
  region: varchar("region", { length: 50 }),
  country: varchar("country", { length: 10 }).notNull(),
  lat: real("lat").notNull(),
  lng: real("lng").notNull(),
});
