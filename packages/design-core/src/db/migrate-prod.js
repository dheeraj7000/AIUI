/**
 * Production migration runner.
 * Applies SQL migration files from the migrations directory.
 * Tracks applied migrations to avoid re-running them.
 */
const postgres = require('postgres');
const fs = require('fs');
const path = require('path');

async function migrate() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error('DATABASE_URL is not set');
    process.exit(1);
  }

  const sql = postgres(url, { ssl: 'require' });
  const migrationsDir = path.join(__dirname, 'migrations');
  const files = fs
    .readdirSync(migrationsDir)
    .filter(function (f) { return f.endsWith('.sql'); })
    .sort();

  console.log('Found', files.length, 'migration files');

  // Create migrations tracking table
  await sql.unsafe(
    'CREATE TABLE IF NOT EXISTS __drizzle_migrations (' +
      'id SERIAL PRIMARY KEY, ' +
      'hash TEXT NOT NULL, ' +
      'created_at BIGINT' +
    ')'
  );

  for (var i = 0; i < files.length; i++) {
    var file = files[i];
    var existing = await sql.unsafe(
      'SELECT id FROM __drizzle_migrations WHERE hash = $1',
      [file]
    );
    if (existing.length > 0) {
      console.log('Already applied:', file);
      continue;
    }

    console.log('Applying migration:', file);
    var content = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
    var statements = content
      .split('--> statement-breakpoint')
      .map(function (s) { return s.trim(); })
      .filter(Boolean);

    for (var j = 0; j < statements.length; j++) {
      await sql.unsafe(statements[j]);
    }

    await sql.unsafe(
      'INSERT INTO __drizzle_migrations (hash, created_at) VALUES ($1, $2)',
      [file, Date.now()]
    );
    console.log('Applied:', file);
  }

  await sql.end();
  console.log('All migrations complete');
}

migrate().catch(function (e) {
  console.error('Migration error:', e.message);
  process.exit(1);
});
