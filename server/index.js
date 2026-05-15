const path = require('path');
const express = require('express');
const cookieSession = require('cookie-session');
require('dotenv').config();

const logRoutes = require('./middleware/logRoutes');
const checkAuthentication = require('./middleware/checkAuthentication');
const authControllers = require('./controllers/authControllers');
const playlistControllers = require('./controllers/playlistControllers');
const songControllers = require('./controllers/songControllers');

const app = express();
const PORT = process.env.PORT || 8080;

// ====================================
// Middleware
// ====================================

app.use(logRoutes);
app.use(cookieSession({ name: 'session', secret: process.env.SESSION_SECRET }));
app.use(express.json());

// In production, serve the built React app from frontend/dist.
// In development, Vite's dev server handles the frontend on a separate port
// and proxies /api requests to this server.
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// ====================================
// Auth routes
// ====================================

app.post('/api/auth/register', authControllers.register);
app.post('/api/auth/login', authControllers.login);
app.get('/api/auth/me', authControllers.getMe);
app.delete('/api/auth/logout', authControllers.logout);

// ====================================
// Playlist routes (all require authentication)
// ====================================

app.get('/api/playlists', checkAuthentication, playlistControllers.listPlaylists);
app.post('/api/playlists', checkAuthentication, playlistControllers.createPlaylist);
app.patch('/api/playlists/:playlist_id', checkAuthentication, playlistControllers.updatePlaylist);
app.patch('/api/playlists/:playlist_id/visibility', checkAuthentication, playlistControllers.updateVisibility);
app.delete('/api/playlists/:playlist_id', checkAuthentication, playlistControllers.deletePlaylist);

// ====================================
// Song routes (all require authentication)
// ====================================

app.get('/api/playlists/:playlist_id/songs', checkAuthentication, songControllers.listSongs);
app.post('/api/playlists/:playlist_id/songs', checkAuthentication, songControllers.createSong);
app.patch('/api/songs/:song_id', checkAuthentication, songControllers.updateSong);
app.delete('/api/songs/:song_id', checkAuthentication, songControllers.deleteSong);

// ====================================
// Global Error Handler
// ====================================

const handleError = (err, req, res, next) => {
  console.error(err);
  res.status(500).send({ message: 'Internal Server Error' });
};
app.use(handleError);

// ====================================
// Listen
// ====================================

app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
