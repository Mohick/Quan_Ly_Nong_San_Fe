import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

const getCookie = (name: string) => {
  if (typeof document === "undefined") return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift();
  return null;
};

// Toggle Follow Farm
export const toggleFollowAPI = async (farmId: string) => {
  const token = getCookie("access_token");
  const response = await axios.post(
    `${API_URL}/api/v1/follows/toggle`,
    { farm_id: farmId },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

// List Followed Farms
export const listFollowsAPI = async () => {
  const token = getCookie("access_token");
  const response = await axios.get(`${API_URL}/api/v1/follows/list`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};
