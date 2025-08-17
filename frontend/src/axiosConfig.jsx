import axios from 'axios';

const axiosInstance = axios.create({
  //baseURL: 'http://localhost:5000', // local
  baseURL: 'https://3.25.193.154:5001', // live
  headers: { 'Content-Type': 'application/json' },
});

export default axiosInstance;
