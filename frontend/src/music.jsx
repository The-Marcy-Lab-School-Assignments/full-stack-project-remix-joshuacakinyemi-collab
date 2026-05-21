import { useState, useEffect, useRef } from "react"
import Visualizer from './components/theme/Visualizer';
import { useTheme } from '../src/ThemeContext';

function loadYoutubeAPI() {
  return new Promise((resolve) => {
    if (window.YT && window.YT.Player) return resolve()
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    document.body.appendChild(tag);
    window.onYouTubeIframeAPIReady = resolve;
  })
}

function MusicPlayer({ songs }) {

  const { accent } = useTheme();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [autoplay, setAutoplay] = useState(false);
  const [shuffle, setShuffle] = useState(false);
  const [youtubeData, setYoutubeData] = useState({});
  const [duration, setDuration] = useState('0:00');
  const [currentTime, setCurrentTime] = useState('0:00');
  const playerRef = useRef(null);
  const intervalRef = useRef(null);
  const containerRef = useRef(null);


  const currentSong = songs[currentIndex];
  const nextIndex = shuffle
    ? Math.floor(Math.random() * songs.length)
    : (currentIndex + 1) % songs.length
  const nextSong = songs[nextIndex];

  const fetchYoutubeData = async (song) => {
    if (youtubeData[song.song_id]) return youtubeData[song.song_id];
    try {
      const res = await fetch(`/api/songs/${song.song_id}/youtube`)
      if (!res.ok) return null;
      const data = await res.json();
      setYoutubeData((prev) => ({ ...prev, [song.song_id]: data }));
      return data;
    } catch {
      return null;
    }
  };

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const startTimeTracking = () => {
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      if (playerRef.current?.getCurrentTime) {
        setCurrentTime(formatTime(playerRef.current.getCurrentTime()));
        setDuration(formatTime(playerRef.current.getDuration()));
      }
    }, 500);
  };

  const initPlayer = async (song, autoStart = false) => {
    const data = await fetchYoutubeData(song);
    if (!data) return;

    await loadYoutubeAPI();

    if (playerRef.current?.loadVideoById) {
      playerRef.current.loadVideoById(data.youtube_id);

      if (autoStart) {
        if (playerRef.current?.playVideo) playerRef.current.playVideo();
      } else {
        if (playerRef.current?.pauseVideo) playerRef.current.pauseVideo();
      }
    } else {
      playerRef.current = new window.YT.Player(containerRef.current, {
        height: '0',
        width: '0',
        videoId: data.youtube_id,
        playerVars: { autoplay: 0 },
        events: {
          onReady: (e) => {
            if (autoStart) {
              e.target.playVideo();
            } else {
              e.target.pauseVideo()
            }
            startTimeTracking();
          },
          onStateChange: (e) => {
            setIsPlaying(e.data === window.YT.PlayerState.PLAYING);
            if (e.data === window.YT.PlayerState.ENDED && autoplay) {
              changeSong(true);
            }
          },
        },
      });
    }
    startTimeTracking();
  };

  useEffect(() => {
    if (songs.length > 0) initPlayer(songs[0]);
    return () => {
      clearInterval(intervalRef.current);
      if (playerRef.current?.destroy) {
        playerRef.current.destroy(); // destroys the YouTube iframe
        playerRef.current = null;
      }
    };
  }, []);

  const togglePlay = () => {
    if (!playerRef.current?.pauseVideo) return;
    if (isPlaying) {
      playerRef.current.pauseVideo();
    } else {
      playerRef.current.playVideo();
    }
  };

  const changeSong = (next = true) => {
    let newIndex;
    if (shuffle) {
      newIndex = Math.floor(Math.random() * songs.length);
    } else if (next) {
      newIndex = (currentIndex + 1) % songs.length;
    } else {
      newIndex = (currentIndex - 1 + songs.length) % songs.length;
    }
    setCurrentIndex(newIndex);
    initPlayer(songs[newIndex], true);
    setIsPlaying(true);
  };

  const playSong = (index) => {
    setCurrentIndex(index);
    initPlayer(songs[index], true);
    setIsPlaying(true)
  };

  const currentData = youtubeData[currentSong?.song_id];

  if (!songs.length) return null;

  return (
    <div className="music-player">
      {/* Hidden YouTube player */}
      <div ref={containerRef} style={{ display: 'none' }} />

      {/* Album art */}
      <div className="player-art">
        {currentData?.thumbnail
          ? <img src={currentData.thumbnail} alt={currentSong.title} />
          : <div className="player-art-placeholder">♫</div>
        }
      </div>

      <Visualizer isPlaying={isPlaying} accent={accent.color} />

      {/* Song info */}
      <div className="player-info">
        <h3 className="player-title">{currentSong.title}</h3>
        <p className="player-artist">{currentSong.author}</p>
        <div className="player-time">
          <span>{currentTime}</span>
          <span>{duration}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="player-controls">
        <button
          className={`player-btn ${shuffle ? 'active' : ''}`}
          onClick={() => setShuffle((s) => !s)}
          title="Shuffle"
        >⇄</button>
        <button className="player-btn" onClick={() => changeSong(false)}>⏮</button>
        <button className="player-btn play" onClick={togglePlay}>
          {isPlaying ? '⏸' : '▶'}
        </button>
        <button className="player-btn" onClick={() => changeSong(true)}>⏭</button>
        <button
          className={`player-btn ${autoplay ? 'active' : ''}`}
          onClick={() => setAutoplay((a) => !a)}
          title="Autoplay"
        >↻</button>
      </div>

      {/* Next up */}
      {nextSong && (
        <p className="player-next">Next: <strong>{nextSong.title}</strong> by {nextSong.author}</p>
      )}

      {/* Song list */}
      <ul className="player-queue">
        {songs.map((song, i) => (
          <li
            key={song.song_id}
            className={`queue-item ${i === currentIndex ? 'active' : ''}`}
            onClick={() => playSong(i)}
          >
            <span className="queue-index">{i === currentIndex && isPlaying ? '▶' : i + 1}</span>
            <span className="queue-title">{song.title}</span>
            <span className="queue-artist">{song.author}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default MusicPlayer;


