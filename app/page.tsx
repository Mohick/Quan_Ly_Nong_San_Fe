import Banner from "@/components/banner/banner";
import TopFarmer from "@/components/top_fammer/top_farmer";
import TopSale from "@/components/top_sale/top_sale";
import { Loading } from "@/utils/loading/loading";
import Image from "next/image";

export default function Home() {
  return (
    <div>
      <Banner />
      <TopSale />
      <TopFarmer />
      <Loading />
    </div>
  );
}
