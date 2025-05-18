import axios from "axios";

const BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:5000" : "https://localhost:5000";

export const axiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // send cookies with the request
});
