import axios from "axios";

const API = axios.create({
  baseURL: "https://fa-backend-xfja.onrender.com/api",
});

export default API;