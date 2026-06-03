import axios from "axios";

async function FarmAPI() {

    return await axios.get("/farm.json")


}

export { FarmAPI }; 