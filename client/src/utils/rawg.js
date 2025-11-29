import axios from "axios";

const RAWG_KEY = process.env.API_KEY;
const RAWG_BASE = "https://api.rawg.io/api";

export async function fetchGamesList(page = 1, page_size = 20, search = "") {
  const params = { key: RAWG_KEY, page, page_size };
  if (search) params.search = search;

  const res = await axios.get(`${RAWG_BASE}/games`, { params });

  const data = res.data;

  const games = (data.results || []).map((g) => ({
    title: g.name,
    id: g.id,
    background_image: g.background_image || null,
    screenshots: (g.short_screenshots || [])
      .map((s) => s.image)
      .filter(Boolean),
  }));

  return {
    count: data.count,
    next: data.next,
    previous: data.previous,
    results: games,
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
