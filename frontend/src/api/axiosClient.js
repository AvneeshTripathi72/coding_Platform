import axios from 'axios';
import { getApiBaseURL } from '../utils/config.js';

const baseURL = getApiBaseURL();

const axiosClient = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default axiosClient;



// import axios from "axios"
// import dotenv from "dotenv"
// dotenv.config()
// console.log(process.env.VITE_API_BASE_URL )

// const axiosClient = axios.create({
//     baseURL:  'http://localhost:3000',
//     withCredentials: true,
//     headers: {
//         'Content-Type': 'application/json'
//     }
// });

// export default axiosClient;