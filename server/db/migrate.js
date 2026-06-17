const pool = require('./pool');
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const migrate = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS favorites (
      user_id     INT REFERENCES users(user_id) ON DELETE CASCADE,
      playlist_id INT REFERENCES playlists(playlist_id) ON DELETE CASCADE,
      PRIMARY KEY (user_id, playlist_id)
    )
  `);
  console.log('Migration complete: favorites table ready.');
};

migrate()
  .catch((err) => {
    console.error('Migration failed:', err);
    process.exit(1);
  })
  .finally(() => pool.end());
