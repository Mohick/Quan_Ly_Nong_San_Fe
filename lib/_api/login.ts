import axios from "axios";

interface LoginInput {
    full_name: string;
    email: string;
    avatar_url: string;
}

async function loginAPI({ full_name, email, avatar_url }: LoginInput) {
    return await axios.post(`/api/auth/login`, {
        full_name,
        email,
        avatar_url,
    });
}

export { loginAPI };