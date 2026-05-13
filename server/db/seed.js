const bcrypt = require('bcrypt');
const pool = require('./pool');

const SALT_ROUNDS = 7;

const seed = async () => {
  // Drop tables in reverse dependency order (todos references users via FK)
  await pool.query('DROP TABLE IF EXISTS song');
  await pool.query('DROP TABLE IF EXISTS playlists');
  await pool.query('DROP TABLE IF EXISTS users');

  await pool.query(`
    CREATE TABLE users (
      user_id       SERIAL PRIMARY KEY,
      username      TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL
    )
  `);

  await pool.query(`
    CREATE TABLE playlists (
      playlist_id     SERIAL PRIMARY KEY,
      title       TEXT NOT NULL,
      description    TEXT NOT NULL,
      is_public BOOLEAN NOT NULL DEFAULT FALSE,
      user_id     INT REFERENCES users(user_id) ON DELETE CASCADE
    )
  `);

  await pool.query(`
    CREATE TABLE songs (
      song_id     SERIAL PRIMARY KEY,
      title       TEXT NOT NULL,
      author      TEXT NOT NULL,
      playlist_id     INT REFERENCES playlists(playlist_id) ON DELETE CASCADE
    )
  `);

  // Hash passwords in parallel — bcrypt is slow by design (CPU-bound hashing)
  const [aliceHash, bobHash] = await Promise.all([
    bcrypt.hash('password123', SALT_ROUNDS),
    bcrypt.hash('password123', SALT_ROUNDS),
  ]);

  // RETURNING captures inserted user_ids so we don't hardcode them
  const { rows: users } = await pool.query(`
    INSERT INTO users (username, password_hash) VALUES
      ('alice', $1),
      ('bob',   $2)
    RETURNING user_id, username
  `, [aliceHash, bobHash]);

  const [alice, bob] = users;

  await pool.query(`
    INSERT INTO todos (title, is_complete, user_id) VALUES
      ('Buy groceries',        FALSE, $1),
      ('Walk the dog',         FALSE, $1),
      ('Read a book',          TRUE,  $1),
      ('Set up the database',  TRUE,  $2),
      ('Build the API',        TRUE,  $2),
      ('Build the frontend',   FALSE, $2)
  `, [alice.user_id, bob.user_id]);

  return users;
};

seed()
  .then((users) => {
    console.log('Database seeded successfully.');
    console.log(`  Users: ${users.map((u) => u.username).join(', ')}`);
  })
  .catch((err) => {
    console.error('Error seeding database:', err);
    process.exit(1);
  })
  .finally(() => pool.end());
