import axios from "axios";

// Generic SWR fetcher
export const fetcher = (url) =>
  axios.get(url, { withCredentials: true }).then((res) => res.data);

// Get all roadmaps
export const getRoadmaps = () => fetcher("http://localhost:4000/roadmap");

// ✅ FIX: Add this function
export const getRoadmapById = async (id) => {
  const res = await axios.get(`http://localhost:4000/roadmap/${id}`, {
    withCredentials: true,
  });
  return res.data;
};
   