import axios from "axios";

async function productAPI() {

    return await axios.get("/product.json")


}

export { productAPI };