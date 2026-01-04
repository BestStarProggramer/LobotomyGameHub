import axios from "axios";

const LOCAL_API_GAMES = "http://localhost:8800/api/games";
const RAWG_PROXY = "http://localhost:8800/api/rawg";

export function chunkArray(arr, size = 5) {
  const chunks = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

export async function fetchGamesList(page = 1, page_size = 30, filters = {}) {
  const params = { page, page_size, ...filters };

  const res = await axios.get(`${RAWG_PROXY}/games`, { params });
  const data = res.data;

  const games = data.results.map((g) => ({
    slug: g.slug,
    title: g.name,
    background_image: g.background_image || null,
    rating: 0,
    released: g.released || null,
    genres: g.genres?.map((genre) => genre.name) || [],
  }));

  return {
    count: data.count,
    next: data.next,
    previous: data.previous,
    games: games,
  };
}

export async function fetchGameDetailsBySlug(slug) {
  const res = await axios.get(
    `${LOCAL_API_GAMES}/details/${encodeURIComponent(slug)}`
  );
  const g = res.data;

  return {
    id: g.id,
    title: g.name || g.title,
    slug: g.slug,
    released: g.released || null,
    backgroundimage: g.background_image || g.backgroundimage || null,
    genres: Array.isArray(g.genres)
      ? g.genres.map((x) => (typeof x === "string" ? x : x.name))
      : [],
    rating: g.rating ?? 0,
    publishers: Array.isArray(g.publishers) ? g.publishers : [],
    developers: Array.isArray(g.developers) ? g.developers : [],
    description: g.description || "",
  };
}

export async function fetchGameScreenshotsBySlug(slug) {
  const res = await axios.get(
    `${RAWG_PROXY}/games/${encodeURIComponent(slug)}/screenshots`
  );
  const screenshots = res.data.results || [];
  return screenshots.map((shot) => shot.image);
}

export async function fetchGameTrailersBySlug(slug) {
  const res = await axios.get(
    `${RAWG_PROXY}/games/${encodeURIComponent(slug)}/trailers`
  );
  const trailers = res.data.results || [];
  const first = trailers[0];
  return first?.data?.max || first?.data?.["480"] || null;
}
