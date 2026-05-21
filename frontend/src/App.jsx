import { useState, useEffect } from 'react';
import { getMe, login, register, logout } from './adapters/auth-adapters';
import AuthPage from './components/AuthPage';
import PlaylistPage from './components/playlist/PlaylistPage';
import PublicPlaylistPage from './components/playlist/PublicPlaylistPage';
import PublicSongPage from './components/song/PublicSongPage';
import ThemeControls from './components/theme/ThemeControls';
function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedPlaylist, setSelectedPlaylist] = useState(null)
  const [currentPage, setCurrentPage] = useState(() => sessionStorage.getItem('currentPage') || 'home');

  const setPage = (page) => {
    sessionStorage.setItem('currentPage', page);
    setCurrentPage(page)
  }

  // On every page load, check the server for an active session cookie.
  // React state doesn't survive a refresh; session cookies do.
  useEffect(() => {
    const checkForSession = async () => {
      const { data: user } = await getMe();
      if (user) {
        setCurrentUser(user);
        setCurrentPage('myPlaylists')
      }
    };
    checkForSession();
  }, []);

  // Handlers that manage updating the current user. 
  // Defined in App to ensure that child components only                       
  // update the current user in a controlled manner.  
  const handleLogin = async (username, password) => {
    const { data: user, error } = await login(username, password);
    if (error) return error;
    setCurrentUser(user);
    setPage('myPlaylists');
  };

  const handleRegister = async (username, password) => {
    const { data: user, error } = await register(username, password);
    if (error) return error;
    setCurrentUser(user);
    setPage('myPlaylists');
  };

  const handleLogout = async () => {
    await logout();
    setCurrentUser(null);
    setSelectedPlaylist(null);
    setPage('home');
  };

  const goHome = () => {
    setSelectedPlaylist(null);
    setPage('home');
  };

  const renderPage = () => {
    // Viewing songs in a playlist — works for everyone
    if (selectedPlaylist) {
      return (
        <PublicSongPage
          playlist={selectedPlaylist}
          onBack={() => setSelectedPlaylist(null)}
        />
      );
    }

    // Logged-in user viewing their own playlists
    if (currentPage === 'myPlaylists' && currentUser) {
      return (
        <PlaylistPage
          currentUser={currentUser}
          handleLogout={handleLogout}
          onSelectPlaylist={setSelectedPlaylist} // so they can click into a playlist's songs
        />
      );
    }

    // Default: public playlist browser + auth form for guests
    return (
      <>
        <PublicPlaylistPage setSelectedPlaylist={setSelectedPlaylist} />
        {!currentUser && (
          <AuthPage handleLogin={handleLogin} handleRegister={handleRegister} />
        )}
      </>
    );
  }

  return (
    <main>
      {/* Nav bar */}
      <nav>
        <h1 onClick={goHome} style={{ cursor: 'pointer' }}>Playlist App</h1>

        {currentUser && (
          <div className="user-badge">
            <i className="ti ti-user" style={{ fontSize: '13px' }} aria-hidden="true" />
            {currentUser.username}
          </div>
        )}

        {currentUser && currentPage !== 'myPlaylists' && (
          <button onClick={() => setPage('myPlaylists')}>My Playlists</button>
        )}
        {currentUser && currentPage === 'myPlaylists' && (
          <button onClick={goHome}>Browse Public</button>
        )}
        {currentUser && (
          <button onClick={handleLogout}>Log Out</button>
        )}

        <ThemeControls />
      </nav>

      {renderPage()}
    </main>
  );
}

export default App;
