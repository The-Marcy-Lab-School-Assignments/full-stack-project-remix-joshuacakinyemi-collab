import { useEffect, useState } from 'react';
import { fetchAllSongs } from '../../adapters/song-adapters.js';
import MusicPlayer from '../../music.jsx';

function PublicSongPage({ playlist, onBack }) {
  const [songs, setSongs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadSongs = async () => {
      setSongs([])
      setIsLoading(true);
      setError(null)
      const { data, error: fetchError } = await fetchAllSongs(playlist.playlist_id);
      if (fetchError) setError(fetchError.message);
      else setSongs(data);
      setIsLoading(false);
    };
    loadSongs();
  }, [playlist.playlist_id]);

  if (isLoading) return <p>Loading songs...</p>;
  if (error) return <p className="error">Something went wrong: {error}</p>;

  return (
    <section>
      <button onClick={onBack}>← Back to Playlists</button>
      <h2>{playlist.title}</h2>
      <p style={{ padding: 0 }}>{playlist.description}</p>
      <p className="playlist-creator" style={{ padding: 0 }}>by {playlist.created_by}</p>
      {songs.length > 0
        ? <MusicPlayer key={playlist.playlist_id} songs={songs} /> // fix: key forces remount
        : <p>No songs in this playlist yet.</p>
      }
    </section>
  );
}


export default PublicSongPage;