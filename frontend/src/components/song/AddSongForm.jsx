import { createSong } from '../../adapters/song-adapters.js';

function AddSongForm({ playlist_id, loadSongs }) {
  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    const title = form.elements.title.value;
    const author = form.elements.author.value;
    if (!title || !author) return;

    const { error } = await createSong(playlist_id, title, author);
    if (error) return console.error(error);

    await loadSongs();
    form.reset();
  };

  return (
    <form id="add-song-form" onSubmit={handleSubmit}>
      <label htmlFor="song-input">New Song:</label>
      <input type="text" name="title" id="title-input" placeholder="Enter the song name." />
      <input type="text" name="author" id="author-input" placeholder="Enter the song author." />
      <button type="submit">Add</button>
    </form>
  );
}

export default AddSongForm;
