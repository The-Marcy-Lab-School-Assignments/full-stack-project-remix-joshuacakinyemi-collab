import { useEffect, useState } from "react";
import { fetchPublicPlaylists } from "../../adapters/playlist-adapters.js";

function PublicPlaylistPage({ setSelectedPlaylist }) {
  const [playlists, setPlaylists] = useState([])
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const filtered = playlists.filter(p =>
    p.title.toLowerCase().includes(query.toLowerCase())
  );


  useEffect(() => {
    const loadPublicPlaylists = async () => {
      setIsLoading(true);
      const { data, error: fetchError } = await fetchPublicPlaylists();
      if (fetchError) setError(fetchError.message);
      else setPlaylists(data)
      setIsLoading(false);
    }
    loadPublicPlaylists()
  }, [])

  if (isLoading) return <p>Loading Playlist...</p>;
  if (error) return <p className='error'>Something went wrong: {error}</p>

  return (
    <section>
      <h2>Public Playlists</h2>
      <input
        className="sidebar-search"
        placeholder="Search playlists by name..."
        value={query}
        onChange={e => setQuery(e.target.value)}
      />
      {filtered.length === 0 && query && (
        <p>No playlists found for "{query}"</p>
      )}
      <ul id="public-playlist-list">
        {filtered.map((playlist) => (
          <li
            key={playlist.playlist_id}
            className="playlist-item"
            onClick={() => setSelectedPlaylist(playlist)}
            style={{ cursor: 'pointer' }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', flex: 1 }}>
              <h3>{playlist.title}</h3>
              <p style={{ padding: 0 }}>{playlist.description}</p>
              <p className="playlist-creator" style={{ padding: 0 }}>by {playlist.created_by}</p>
            </div>
          </li>

        ))}
      </ul>
    </section>
  );
}

export default PublicPlaylistPage;