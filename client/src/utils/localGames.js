import axios from "../axios.js";

export async function fetchLocalGamesList(page = 1, page_size = 30, filters = {}) {
  const params = { page, page_size, ...filters };
  
  const res = await axios.get("http://localhost:8800/api/games/local", { params });
  const data = res.data;
  
  return data.results; // массив игр из БД
}