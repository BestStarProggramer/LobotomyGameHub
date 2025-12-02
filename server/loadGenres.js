import fetch from "node-fetch";
import { query } from "./db.js";

const API_KEY = process.env.API_KEY;
const BASE_URL = `https://api.rawg.io/api/genres?key=${API_KEY}`;

async function loadGenreNames() {
  let url = BASE_URL;

  while (url) {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`RAWG API error: ${response.status}`);
    }

    const data = await response.json();

    for (const g of data.results) {
      await query(
        `
        INSERT INTO genres (name)
        VALUES ($1)
        ON CONFLICT DO NOTHING;
      `,
        [g.name]
      );
    }

    url = data.next;
  }

  console.log("Загрузка жанров завершена.");
}

loadGenreNames().catch((err) => console.error(err));
