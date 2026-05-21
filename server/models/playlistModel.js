const pool = require('../db/pool');
// changes so that you can create playlist by title and description, edit title and description and make it public or private.
// Returns all playlists for a specific user, ordered by creation time
module.exports.listByUser = async (user_id) => {
  const query = `
    SELECT playlists.*, users.username AS created_by
    FROM playlists
    JOIN users ON playlists.user_id = users.user_id
    WHERE playlists.user_id = $1
    ORDER BY playlists.playlist_id ASC
  `;
  const { rows } = await pool.query(query, [user_id]);
  return rows;
};

module.exports.listPublic = async () => {
  const query = 'SELECT playlists.*, users.username AS created_by FROM playlists JOIN users ON playlists.user_id = users.user_id WHERE playlists.is_public = TRUE ORDER BY playlists.playlist_id ASC';
  const { rows } = await pool.query(query);
  return rows;
};

// Returns a single playlist row (used for ownership checks before update/delete)
module.exports.find = async (playlist_id) => {
  const query = 'SELECT * FROM playlists WHERE playlist_id = $1';
  const { rows } = await pool.query(query, [playlist_id]);
  return rows[0] || null;
};

// Creates a new playlist. Returns the full playlist row.
module.exports.create = async (title, description, user_id) => {
  const query = 'INSERT INTO playlists (title, description, user_id) VALUES ($1, $2, $3) RETURNING *';
  const { rows } = await pool.query(query, [title, description, user_id]);
  return rows[0];
};

// Updates title and/or description for a playlist. Returns the updated row.
module.exports.update = async (playlist_id, { title, description }) => {
  const query = 'UPDATE playlists SET title = $1, description = $2 WHERE playlist_id = $3 RETURNING *';
  const { rows } = await pool.query(query, [title, description, playlist_id]);
  return rows[0];
};

// Updates is_public for a playlist. Returns the updated row.
module.exports.updateVisibility = async (playlist_id, is_public) => {
  const query = 'UPDATE playlists SET is_public = $1 WHERE playlist_id = $2 RETURNING *';
  const { rows } = await pool.query(query, [is_public, playlist_id]);
  return rows[0];
};

// Deletes a playlist by id
module.exports.destroy = async (playlist_id) => {
  const query = 'DELETE FROM playlists WHERE playlist_id = $1 RETURNING *';
  const { rows } = await pool.query(query, [playlist_id]);
  return rows[0] || null;
};

