import axios from "axios";

export const api = axios.create({
  baseURL: "/api",
});

export const githubApi = axios.create({
  baseURL: "https://api.github.com",
  headers: { Accept: "application/vnd.github+json" },
});
