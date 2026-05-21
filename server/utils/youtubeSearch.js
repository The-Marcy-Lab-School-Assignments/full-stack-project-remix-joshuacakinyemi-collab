const cache = new Map();

module.exports.searchYouTube = async (title, author) => {
  const query = `${title} ${author} official audio`;

  if (cache.has(query)) {
    console.log(`[Youtube cache hit] ${query}`);
    return cache.get(query);
  }

  const url = new URL('https://www.googleapis.com/youtube/v3/search');
  url.searchParams.set('part', 'snippet');
  url.searchParams.set('q', query);
  url.searchParams.set('type', 'video');
  url.searchParams.set('maxResults', '1');
  url.searchParams.set('key', process.env.YOUTUBE_API_KEY);

  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`YouTube API error: ${res.status}`)
  }

  const data = await res.json();

  if (!data.items || data.items.length === 0) return null;

  const item = data.items[0]

  const thumbnails = item.snippet.thumbnails;

  const result = {
    youtube_id: item.id.videoId,
    thumbnail:
      thumbnails.high?.url ||
      thumbnails.medium?.url ||
      thumbnails.default?.url ||
      null,
  };

  cache.set(query, {
    data: result,
    expires: Date.now() + 1000 * 60 * 60
  });
  return result
}