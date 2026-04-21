import postgres from "postgres";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("DATABASE_URL is not set. Add it to .env.local.");
  process.exit(1);
}

const sql = postgres(connectionString, { max: 1 });

async function setup() {
  // 1. Enable PostGIS
  console.log("Enabling PostGIS extension...");
  await sql`CREATE EXTENSION IF NOT EXISTS postgis`;

  // 2. Create enums (safe to re-run — exception is caught and ignored)
  console.log("Creating enums...");
  await sql`
    DO $$ BEGIN
      CREATE TYPE space_type AS ENUM (
        'cafe','coworking','library','park','plaza','transit','lobby','other'
      );
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$
  `;
  await sql`
    DO $$ BEGIN
      CREATE TYPE price_type AS ENUM ('free','paid','purchase-required');
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$
  `;
  await sql`
    DO $$ BEGIN
      CREATE TYPE noise_level AS ENUM ('quiet','moderate','loud');
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$
  `;

  // 3. Create cities table
  console.log("Creating cities table...");
  await sql`
    CREATE TABLE IF NOT EXISTS cities (
      slug    VARCHAR(100) PRIMARY KEY,
      name    TEXT         NOT NULL,
      region  VARCHAR(50),
      country VARCHAR(10)  NOT NULL,
      lat     REAL         NOT NULL,
      lng     REAL         NOT NULL
    )
  `;

  // 4. Create spaces table
  console.log("Creating spaces table...");
  await sql`
    CREATE TABLE IF NOT EXISTS spaces (
      id          TEXT         PRIMARY KEY,
      name        TEXT         NOT NULL,
      type        space_type   NOT NULL,
      lat         REAL         NOT NULL,
      lng         REAL         NOT NULL,
      address     TEXT         NOT NULL,
      city        VARCHAR(100) NOT NULL REFERENCES cities(slug) ON DELETE CASCADE,
      amenities   TEXT[]       NOT NULL DEFAULT '{}',
      tags        TEXT[]       NOT NULL DEFAULT '{}',
      price_type  price_type   NOT NULL,
      noise_level noise_level  NOT NULL,
      hours       JSONB,
      description TEXT,
      image_url   TEXT,
      website_url TEXT
    )
  `;

  // 5. Create indexes
  console.log("Creating indexes...");
  await sql`
    CREATE INDEX IF NOT EXISTS idx_spaces_city
    ON spaces (city)
  `;
  await sql.unsafe(`
    CREATE INDEX IF NOT EXISTS idx_spaces_geom
    ON spaces USING gist (
      CAST(ST_MakePoint(lng, lat) AS geography)
    )
  `);

  console.log("Database setup complete.");
  await sql.end();
}

setup().catch((err) => {
  console.error("Setup failed:", err);
  process.exit(1);
});
