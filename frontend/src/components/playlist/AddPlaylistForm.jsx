import { createPlaylist } from '../../adapters/playlist-adapters.js';

function AddPlaylistForm({ loadPlaylists }) {
  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    const title = form.elements.title.value;
    const description = form.elements.description.value;
    if (!title || !description) return;

    const { error } = await createPlaylist(title, description);
    if (error) return console.error(error);

    await loadPlaylists();
    form.reset();
  };

  return (
    <form id="add-playlist-form" onSubmit={handleSubmit}>
      <label htmlFor="playlist-input">New Playlist:</label>
      <input type="text" name="title" id="title-input" placeholder="Add a title." />
      <input type="text" name="description" id="description-input" placeholder="Add a description." />
      <button type="submit">Add</button>
    </form>
  );
}

export default AddPlaylistForm;
