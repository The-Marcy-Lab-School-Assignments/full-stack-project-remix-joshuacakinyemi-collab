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
        placeholder="Search playlists..."
        value={query}
        onChange={e => setQuery(e.target.value)}
      />
      <ul id="public-playlist-list">
        {playlists.map((playlist) => (
          <li
            key={playlist.playlist_id}
            className="playlist-item"
            onClick={() => setSelectedPlaylist(playlist)}
            style={{ cursor: 'pointer' }}
          >
            <h3>{playlist.title}</h3>
            <p>{playlist.description}</p>
            <p className="playlist-creator">by {playlist.created_by}</p> {/* add this */}
          </li>

        ))}
      </ul>
    </section>
  );
}

export default PublicPlaylistPage;