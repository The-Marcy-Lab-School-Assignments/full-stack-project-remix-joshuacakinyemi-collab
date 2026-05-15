const pool = require('../db/pool');
// changes so that you can create playlist by title and description, edit title and description and make it public or private.
// Returns all songs for a specific playlist, ordered by song_id
module.exports.listByPlaylist = async (playlist_id) => {
  const query = 'SELECT * FROM songs WHERE playlist_id = $1 ORDER BY song_id ASC';
  const { rows } = await pool.query(query, [playlist_id]);
  return rows;
};

// Returns a single song row (used for ownership checks before update/delete)
module.exports.find = async (song_id) => {
  const query = 'SELECT * FROM songs WHERE song_id = $1';
  const { rows } = await pool.query(query, [song_id]);
  return rows[0] || null;
};

// Creates a new song. Returns the full song row.
module.exports.create = async (title, author, playlist_id) => {
  const query = 'INSERT INTO songs (title, author, playlist_id) VALUES ($1, $2, $3) RETURNING *';
  const { rows } = await pool.query(query, [title, author, playlist_id]);
  return rows[0];
};

// Updates title and/or author for a song. Returns the updated row.
module.exports.update = async (song_id, { title, author }) => {
  const query = 'UPDATE songs SET title = $1, author = $2 WHERE song_id = $3 RETURNING *';
  const { rows } = await pool.query(query, [title, author, song_id]);
  return rows[0];
};

// Deletes a song by id
module.exports.destroy = async (song_id) => {
  const query = 'DELETE FROM songs WHERE song_id = $1 RETURNING *';
  const { rows } = await pool.query(query, [song_id]);
  return rows[0] || null;
};
