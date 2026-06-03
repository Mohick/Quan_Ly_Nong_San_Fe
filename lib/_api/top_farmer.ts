import axios from "axios";

async function topFarmerAPI() {

    return await axios.get("/top-farmer.json")


}

export { topFarmerAPI };