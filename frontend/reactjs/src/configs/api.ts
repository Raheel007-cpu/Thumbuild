import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.PROD? "https://thumbuild-backend.vercel.app": "http://localhost:3000", withCredentials: true
})

export default api;