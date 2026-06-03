import axios from "axios";

async function HistoryAPI() {

    return await axios.get("/history.json")


}

export { HistoryAPI }; 