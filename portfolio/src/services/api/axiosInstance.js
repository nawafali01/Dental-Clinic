import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL || (import.meta.env.PROD 
  ? (function() { throw new Error("VITE_API_URL environment variable is missing for production build!"); })()
  : "http://localhost:5000/api");

export const axiosInstance = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true",
  },
  timeout: 30000,
});
