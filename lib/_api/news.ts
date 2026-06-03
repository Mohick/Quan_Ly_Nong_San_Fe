import axios from "axios";

async function newsAPI() {

    return await axios.get("/news.json")


}

export { newsAPI }; 