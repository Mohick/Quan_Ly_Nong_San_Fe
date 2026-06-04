import axiosInstance from "../axios";

async function productAPI(token?: string, page: number = 1) {
    const headers: Record<string, string> = {};
    if (token) {
        headers["Authorization"] = token.startsWith("Bearer ") ? token : `Bearer ${token}`;
    }
    
    // Truyền tham số page=... để tránh lỗi chuyển đổi số strconv.Atoi ở backend
    const res = await axiosInstance.get(`/products/get_all?page=${page}`, { headers });
    
    // Trích xuất mảng dữ liệu cực kỳ an toàn hỗ trợ cấu trúc phân trang từ Gorm/Go
    let rawData: any[] = [];
    if (res.data) {
        if (Array.isArray(res.data)) {
            rawData = res.data;
        } else if (res.data.data) {
            rawData = Array.isArray(res.data.data) 
                ? res.data.data 
                : (Array.isArray(res.data.data.data) ? res.data.data.data : []);
        } else if (res.data.error) {
            rawData = Array.isArray(res.data.error) 
                ? res.data.error 
                : (Array.isArray(res.data.error.data) ? res.data.error.data : []);
        }
    }
    
    // Map PascalCase backend properties to camelCase frontend properties
    const mapped = rawData.map((item: any) => ({
        id: item.ID || item.id,
        name: item.Name || item.name || "",
        category: item.CropLot?.Name || item.CropLot?.name || item.Category || item.category || "Nông sản sạch",
        rating: item.Rating || 5.0,
        reviewsCount: item.ReviewsCount || 0,
        soldQuantity: `${item.Stock || item.stock || 0} sp`,
        originalPrice: item.Price || item.originalPrice || 0,
        salePrice: item.Price || item.salePrice || 0,
        discountPercent: item.DiscountPercent || 0,
        image: (item.ImageProducts && item.ImageProducts[0]?.ImageURL) || 
               (item.ImageProducts && item.ImageProducts[0]?.image_url) || 
               (item.image_products && item.image_products[0]?.image_url) || 
               item.ImageURL || item.image || "https://images.unsplash.com/photo-1610348725531-843dff10902c?q=80&w=600&auto=format&fit=crop",
        isBestSeller: item.IsBestSeller || false,
        unit: item.Unit || "sp"
    }));

    return { data: mapped };
}

async function createProductAPI(formData: FormData, token?: string) {
    const headers: Record<string, string> = {
        "Content-Type": "multipart/form-data",
    };
    if (token) {
        headers["Authorization"] = token.startsWith("Bearer ") ? token : `Bearer ${token}`;
    }
    return await axiosInstance.post("/products/create", formData, { headers });
}

export { productAPI, createProductAPI };