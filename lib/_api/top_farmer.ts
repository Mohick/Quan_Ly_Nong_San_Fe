import axiosInstance from "../axios";

async function topFarmerAPI() {
    try {
        const res = await axiosInstance.get("/farms/get-all");
        if (res.data && res.data.valid) {
            const rawFarms = Array.isArray(res.data.data) ? res.data.data : [];
            const mapped = rawFarms.map((farm: any, index: number) => {
                const defaultCovers = [
                    "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?q=80&w=600&auto=format&fit=crop",
                    "https://images.unsplash.com/photo-1464226184884-fa280b87c399?q=80&w=600&auto=format&fit=crop",
                    "https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?q=80&w=600&auto=format&fit=crop"
                ];
                const defaultAvatars = [
                    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150&auto=format&fit=crop",
                    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop",
                    "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=150&auto=format&fit=crop"
                ];

                const name = farm.FarmName || farm.farm_name || "Nhà Vườn Sạch";
                const image = farm.ImageURL || farm.image_url || defaultCovers[index % defaultCovers.length];
                const avatar = farm.ImageURL || farm.image_url || defaultAvatars[index % defaultAvatars.length];
                const address = farm.Address || farm.address || "Cần Thơ, Việt Nam";
                const description = farm.Description || farm.description || "Chuyên canh nông sản sạch tiêu chuẩn VietGAP.";
                
                return {
                    id: farm.ID || farm.id || String(index + 1),
                    name: name.length > 25 ? `${name.slice(0, 25)}...` : name,
                    coverImage: image,
                    avatar: avatar,
                    badge: "Đạt chuẩn PIONE",
                    rating: (4.7 + (index % 3) * 0.1).toFixed(1),
                    location: address.length > 35 ? `${address.slice(0, 35)}...` : address,
                    specialty: description.length > 80 ? `${description.slice(0, 80)}...` : description,
                    experience: `${3 + (index % 4)} năm`,
                    landArea: `${1.5 + (index % 3) * 0.5} ha`
                };
            });
            return { data: mapped };
        }
    } catch (error) {
        console.error("Lỗi khi lấy danh sách nhà vườn từ database:", error);
    }
    return { data: [] };
}

export { topFarmerAPI };