import axios from "axios";

const RAWG_KEY = process.env.API_KEY;
const RAWG_PROXY = "http://localhost:8800/api/rawg";

export function chunkArray(arr, size = 5) {
  const chunks = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

export async function fetchGamesList(page = 1, page_size = 30, filters={}) {
  const params = { page, page_size, ...filters}; //добавляем фильтры(search,genres,platforms,ordering,dates)

  const res = await axios.get(`${RAWG_PROXY}/games`, { params });
  const data = res.data;

  //Возвращаем простой массив игр
  const games = data.results.map((g) => ({
    slug: g.slug,       // Slug для URL
    title: g.name,
    background_image: g.background_image || null,
    rating: g.rating || 0,
    released: g.released || null,
    genres: g.genres?.map(genre => genre.name) || [],
  }));


  return {
    count: data.count,
    next: data.next,
    previous: data.previous,
    games: games, //простой массив вместо чанкс
  };
}

export async function fetchGameDetailsBySlug(slug) {
  const res = await axios.get(
    `${RAWG_PROXY}/games/${encodeURIComponent(slug)}`
  );
  const g = res.data;

  return {
    title: g.name,
    slug: g.slug,
    released: g.released || null,
    backgroundimage: g.background_image || null,
    genres: (g.genres || []).map((x) => x.name),
    rating: g.rating ?? 0,
    publishers: (g.publishers || []).map((x) => x.name),
    developers: (g.developers || []).map((x) => x.name),
    description: g.description_raw || g.description || "",
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
