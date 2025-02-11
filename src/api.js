import axios from "axios";

const API = axios.create({
    baseURL: "https://todo-app-backend-gpwl.onrender.com/",
});

export default API;