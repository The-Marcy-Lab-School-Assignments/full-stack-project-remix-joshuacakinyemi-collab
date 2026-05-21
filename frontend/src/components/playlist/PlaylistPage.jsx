import { useState, useEffect } from 'react';
import { fetchAllPlaylists } from '../../adapters/playlist-adapters.js';
import AddPlaylistForm from './AddPlaylistForm.jsx';
import PlaylistList from './PlaylistList.jsx';

function PlaylistPage({ currentUser, handleLogout, onSelectPlaylist }) {
  const [playlists, setPlaylists] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadPlaylists = async () => {
    setIsLoading(true);
    setError(null);
    const { data, error: fetchError } = await fetchAllPlaylists();
    if (fetchError) {
      setError(fetchError.message);
    } else {
      setPlaylists(data);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadPlaylists();
  }, []);

  return (
    <section>
      <AddPlaylistForm loadPlaylists={loadPlaylists} />
      {isLoading && <p>Loading playlists...</p>}
      {error && <p className="error">Something went wrong: {error}</p>}
      <PlaylistList
        playlists={playlists}
        loadPlaylists={loadPlaylists}
        onSelectPlaylist={onSelectPlaylist} // pass it down
      />
    </section>
  );

}

export default PlaylistPage;
