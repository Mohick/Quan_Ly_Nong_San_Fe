import axiosInstance from "../axios";

function mapSingleProduct(item: any) {
    if (!item) return null;
    return {
        id: item.ID || item.id,
        name: item.Name || item.name || "",
        category: item.CropLot?.Name || item.CropLot?.name || item.Category || item.category || "Nông sản sạch",
        cropLotId: item.crop_lot_id || item.CropLotID || null,
        cropLot: item.crop_lot || item.CropLot ? {
            id: (item.crop_lot || item.CropLot).id || (item.crop_lot || item.CropLot).ID || "",
            name: (item.crop_lot || item.CropLot).name || (item.crop_lot || item.CropLot).Name || "",
            area: (item.crop_lot || item.CropLot).area || (item.crop_lot || item.CropLot).Area || 0,
            areaUnit: (item.crop_lot || item.CropLot).area_unit || (item.crop_lot || item.CropLot).AreaUnit || "M2",
            startDate: (item.crop_lot || item.CropLot).start_date || (item.crop_lot || item.CropLot).StartDate || "",
            expectedHarvestDate: (item.crop_lot || item.CropLot).expected_harvest_date || (item.crop_lot || item.CropLot).ExpectedHarvestDate || "",
            status: (item.crop_lot || item.CropLot).status || (item.crop_lot || item.CropLot).Status || "",
            farmId: (item.crop_lot || item.CropLot).farm_id || (item.crop_lot || item.CropLot).FarmID || "",
        } : null,
        farmName: (() => {
            const fName = item.FarmName || item.farm_name || 
                          (item.crop_lot || item.CropLot)?.FarmName || 
                          (item.crop_lot || item.CropLot)?.farm_name ||
                          (item.crop_lot || item.CropLot)?.Farm?.FarmName ||
                          (item.crop_lot || item.CropLot)?.Farm?.farm_name ||
                          (item.crop_lot || item.CropLot)?.Farm?.Name ||
                          (item.crop_lot || item.CropLot)?.Farm?.name ||
                          item.Farm?.FarmName || item.Farm?.farm_name ||
                          item.Farm?.Name || item.Farm?.name;
            return fName || "";
        })(),
        description: item.Description || item.description || "",
        stock: item.Stock || item.stock || 0,
        rating: item.Rating || 5.0,
        reviewsCount: item.ReviewsCount || 0,
        soldQuantity: `${item.Stock || item.stock || 0} sp`,
        originalPrice: item.Price || item.price || item.originalPrice || 0,
        salePrice: (() => {
            const base = item.Price || item.price || item.originalPrice || 0;
            const disc = item.discount_price || item.DiscountPrice || item.discountPrice || 0;
            if (disc > 0 && disc < base) {
                return disc;
            }
            return base;
        })(),
        discountPercent: (() => {
            const base = item.Price || item.price || item.originalPrice || 0;
            const disc = item.discount_price || item.DiscountPrice || item.discountPrice || 0;
            if (disc > 0 && disc < base && base > 0) {
                return Math.round(((base - disc) / base) * 100);
            }
            return 0;
        })(),
        image: (() => {
            const rawImg = (item.ImageProducts && item.ImageProducts[0]?.ImageURL) || 
                           (item.ImageProducts && item.ImageProducts[0]?.image_url) || 
                           (item.image_products && item.image_products[0]?.image_url) || 
                           item.ImageURL || item.image_url || item.image;
            if (!rawImg || typeof rawImg !== "string" || rawImg.trim() === "") {
                return "https://images.unsplash.com/photo-1610348725531-843dff10902c?q=80&w=600&auto=format&fit=crop";
            }
            if (rawImg.startsWith("http://") || rawImg.startsWith("https://") || rawImg.startsWith("data:")) {
                return rawImg;
            }
            let baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:8080";
            if (baseUrl.includes("/api/v1")) {
                baseUrl = baseUrl.replace("/api/v1", "");
            }
            const cleanUrl = rawImg.startsWith("/") ? rawImg : `/${rawImg}`;
            return `${baseUrl}${cleanUrl}`;
        })(),
        images: (() => {
            const list: string[] = [];
            const rawList = item.ImageProducts || item.image_products || [];
            if (Array.isArray(rawList)) {
                rawList.forEach((imgObj: any) => {
                    const url = imgObj?.ImageURL || imgObj?.image_url;
                    if (url && typeof url === "string" && url.trim() !== "") {
                        if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:")) {
                            list.push(url);
                        } else {
                            let baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:8080";
                            if (baseUrl.includes("/api/v1")) {
                                baseUrl = baseUrl.replace("/api/v1", "");
                            }
                            const cleanUrl = url.startsWith("/") ? url : `/${url}`;
                            list.push(`${baseUrl}${cleanUrl}`);
                        }
                    }
                });
            }
            if (list.length === 0) {
                const mainImg = item.ImageURL || item.image_url || item.image;
                if (mainImg && typeof mainImg === "string" && mainImg.trim() !== "") {
                    if (mainImg.startsWith("http://") || mainImg.startsWith("https://") || mainImg.startsWith("data:")) {
                        list.push(mainImg);
                    } else {
                        let baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:8080";
                        if (baseUrl.includes("/api/v1")) {
                            baseUrl = baseUrl.replace("/api/v1", "");
                        }
                        const cleanUrl = mainImg.startsWith("/") ? mainImg : `/${mainImg}`;
                        list.push(`${baseUrl}${cleanUrl}`);
                    }
                } else {
                    list.push("https://images.unsplash.com/photo-1610348725531-843dff10902c?q=80&w=600&auto=format&fit=crop");
                }
            }
            return list;
        })(),
        isBestSeller: item.IsBestSeller || false,
        unit: item.Unit || "sp",
        product_variants: item.ProductVariants || item.product_variants || []
    };
}

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
    
    const mapped = rawData.map(mapSingleProduct).filter(Boolean) as any[];
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

async function getProductDetailAPI(id: string, token?: string) {
    const headers: Record<string, string> = {};
    if (token) {
        headers["Authorization"] = token.startsWith("Bearer ") ? token : `Bearer ${token}`;
    }
    const res = await axiosInstance.get(`/products/get_by_id/${id}`, { headers });
    
    const item = res.data?.data || res.data;
    if (!item) {
        return { data: null };
    }
    
    const mapped = mapSingleProduct(item);
    return { data: mapped };
}

async function deleteProductAPI(id: string | number, token?: string) {
    const headers: Record<string, string> = {};
    if (token) {
        headers["Authorization"] = token.startsWith("Bearer ") ? token : `Bearer ${token}`;
    }
    return await axiosInstance.delete(`/products/delete/${id}`, { headers });
}

async function updateProductAPI(id: string | number, formData: FormData, token?: string) {
    const headers: Record<string, string> = {
        "Content-Type": "multipart/form-data",
    };
    if (token) {
        headers["Authorization"] = token.startsWith("Bearer ") ? token : `Bearer ${token}`;
    }
    return await axiosInstance.put(`/products/update/${id}`, formData, { headers });
}

async function addDiscountAPI(payload: {
    name: string;
    description?: string;
    discount_price: number;
    active: boolean;
    amount: number;
    percent: number;
    start_date: string;
    end_date: string;
    product_id: string;
}, token?: string) {
    const headers: Record<string, string> = {
        "Content-Type": "application/json",
    };
    if (token) {
        headers["Authorization"] = token.startsWith("Bearer ") ? token : `Bearer ${token}`;
    }
    return await axiosInstance.post("/products/add_discount", payload, { headers });
}

async function getProductListAPI(page: number = 1, token?: string) {
    const headers: Record<string, string> = {};
    if (token) {
        headers["Authorization"] = token.startsWith("Bearer ") ? token : `Bearer ${token}`;
    }
    const res = await axiosInstance.get(`/products/get_list?page=${page}`, { headers });
    
    let rawData: any[] = [];
    if (res.data && res.data.data) {
        if (Array.isArray(res.data.data.data)) {
            rawData = res.data.data.data;
        } else if (Array.isArray(res.data.data)) {
            rawData = res.data.data;
        }
    }

    const mapped = rawData.map(mapSingleProduct).filter(Boolean) as any[];

    return {
        data: mapped,
        totalRows: res.data?.data?.total_rows || 0,
        totalPages: res.data?.data?.total_pages || 0,
        page: res.data?.data?.page || 1,
        pageSize: res.data?.data?.page_size || 10,
        valid: res.data?.valid || false,
        message: res.data?.message || ""
    };
}

export { 
    productAPI, 
    createProductAPI, 
    getProductDetailAPI, 
    deleteProductAPI, 
    updateProductAPI, 
    addDiscountAPI, 
    getProductListAPI 
};