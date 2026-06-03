import axios from "axios";

async function lotsAPI() {

    return await axios.get("/lots.json")


}

export { lotsAPI };