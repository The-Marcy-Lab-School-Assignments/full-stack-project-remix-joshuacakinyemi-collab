import { useState, useEffect } from 'react';
import { getMe, login, register, logout } from './adapters/auth-adapters';
import AuthPage from './components/AuthPage';
import PlaylistPage from './components/playlist/PlaylistPage';
import PublicPlaylistPage from './components/playlist/PublicPlaylistPage';
import PublicSongPage from './components/song/PublicSongPage';
import ThemeControls from './components/theme/ThemeControls';

function App() {
  const [currentUser, setCurrentUser] = useState(null);

  const [currentPage, setCurrentPage] = useState(
    () => sessionStorage.getItem('currentPage') || 'home'
  );

  const [selectedPlaylist, setSelectedPlaylist] = useState(
    () => {
      const saved = sessionStorage.getItem('selectedPlaylist');
      return saved ? JSON.parse(saved) : null; // fix: restore selected playlist
    }
  );

  const setPage = (page) => {
    sessionStorage.setItem('currentPage', page);
    setCurrentPage(page);
  };

  const selectPlaylist = (playlist) => {
    if (playlist) {
      sessionStorage.setItem('selectedPlaylist', JSON.stringify(playlist)); // fix: persist
    } else {
      sessionStorage.removeItem('selectedPlaylist');
    }
    setSelectedPlaylist(playlist);
  };

  useEffect(() => {
    const checkForSession = async () => {
      const { data: user } = await getMe();
      if (user) {
        setCurrentUser(user);
        // only navigate to myPlaylists if they weren't already on a specific page
        if (sessionStorage.getItem('currentPage') !== 'home') {
          setPage('myPlaylists');
        }
      } else {
        // if no session, make sure we're not stuck on myPlaylists
        if (sessionStorage.getItem('currentPage') === 'myPlaylists') {
          setPage('home');
        }
      }
    };
    checkForSession();
  }, []);


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
    selectPlaylist(null);
    setPage('home');
  };

  const goHome = () => {
    selectPlaylist(null);
    setPage('home');
  };


  const renderPage = () => {

    if (selectedPlaylist) {
      return (
        <PublicSongPage
          playlist={selectedPlaylist}
          onBack={() => selectPlaylist(null)}
        />
      );
    }


    if (currentPage === 'myPlaylists' && currentUser) {
      return (
        <PlaylistPage
          currentUser={currentUser}
          handleLogout={handleLogout}
          onSelectPlaylist={selectPlaylist}
        />
      );
    }


    return (
      <div className={`home-view${!currentUser ? ' home-view--split' : ''}`}>
        <div className="browse-col">
          <PublicPlaylistPage setSelectedPlaylist={selectPlaylist} currentUser={currentUser} />
        </div>
        {!currentUser && (
          <div className="auth-col">
            <AuthPage handleLogin={handleLogin} handleRegister={handleRegister} />
          </div>
        )}
      </div>
    );
  };

  return (
    <main>

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

        <ThemeControls /> { }
      </nav>

      {renderPage()}
    </main>
  );
}

export default App;
