import axios from "axios";
import axiosInstance from "../axios";

interface LoginInput {
  full_name: string;
  email: string;
  avatar_url: string;
}

async function loginAPI({ full_name, email, avatar_url }: LoginInput) {
  return await axiosInstance.post(`/auth/login`, {
    full_name,
    email,
    avatar_url,
  });
}

export { loginAPI };
