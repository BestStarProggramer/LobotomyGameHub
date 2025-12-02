import axios from "axios";

const RAWG_KEY = process.env.API_KEY;
const RAWG_BASE = "https://api.rawg.io/api";
const RAWG_PROXY = "http://localhost:8800/api/rawg";

export function chunkArray(arr, size = 5) {
  const chunks = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

export async function fetchGamesList(page = 1, page_size = 20, search = "") {
  const params = { page, page_size };
  if (search) params.search = search;

  const res = await axios.get(`${RAWG_PROXY}/games`, { params });
  const data = res.data;

  const gamesFlat = (data.results || []).map((g) => ({
    title: g.name,
    slug: g.slug,
    background_image: g.background_image || null,
  }));

  const gamesChunked = chunkArray(gamesFlat, 5);

  return {
    count: data.count,
    next: data.next,
    previous: data.previous,
    results: gamesChunked,
  };
}

export async function fetchGameDetailsBySlug(slug) {
  const res = await axios.get(
    `${RAWG_BASE}/games/${encodeURIComponent(slug)}`,
    {
      params: { key: RAWG_KEY },
    }
  );
  const g = res.data;

  return {
    title: g.name,
    slug: g.slug,
    released: g.released || null,
    background_image: g.background_image || null,
    genres: (g.genres || []).map((x) => x.name),
    publishers: (g.publishers || []).map((x) => x.name),
    developers: (g.developers || []).map((x) => x.name),
    description: g.description_raw || g.description || "",
  };
}
