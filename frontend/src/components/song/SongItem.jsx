import { useState } from 'react';
import { updateSong, deleteSong } from '../../adapters/song-adapters.js';

function SongItem({ song, loadSongs }) {

  const [isEditing, setIsEditing] = useState(false)
  const [title, setTitle] = useState(song.title)
  const [author, setAuthor] = useState(song.author)

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!title || !author) return;
    const { error } = await updateSong(song.song_id, { title, author });
    if (error) return console.error(error);
    await loadSongs();
    setIsEditing(false);
  }

  const handleDelete = async (e) => {
    const { error } = await deleteSong(song.song_id, e.target.checked);
    if (error) return console.error(error);
    loadSongs();
  };

  if (isEditing) {
    return (
      <li className="song-item">
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" />
        <input value={author} onChange={(e) => setAuthor(e.target.value)} placeholder="Author" />
        <button onClick={handleUpdate}>Save</button>
        <button onClick={() => setIsEditing(false)}>Cancel</button>
      </li>
    )
  }

  return (
    <li className="song-item">
      <h3>{song.title}</h3>
      <h4>{song.author}</h4>
      <button className="delete-btn" onClick={handleDelete}>Delete</button>
    </li>
  );
}

export default SongItem;
