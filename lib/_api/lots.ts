import axiosInstance from "../axios";

async function lotsAPI(farmId?: string, token?: string) {
    if (!farmId) {
        return { data: [] };
    }
    try {
        const headers: Record<string, string> = {};
        if (token) {
            headers["Authorization"] = token.startsWith("Bearer ") ? token : `Bearer ${token}`;
        }
        const res = await axiosInstance.get(`/crop-lot/get-crop-lot/${farmId}`, { headers });
        const rawData = Array.isArray(res.data) ? res.data : res.data?.data || [];
        
        // Map PascalCase backend properties to camelCase expected by frontend
        const mapped = rawData.map((item: any) => ({
            farm_id: item.FarmID || item.farm_id,
            id: item.ID || item.id,
            name: item.Name || item.name || "",
            area: item.Area || item.area || 0,
            area_unit: item.AreaUnit || item.area_unit || "M2",
            tree_count: item.TreeCount || item.tree_count || 0,
            start_date: item.StartDate || item.start_date || "",
            expected_harvest_date: item.ExpectedHarvestDate || item.expected_harvest_date || "",
            status: item.Status || item.status || "PROCESS",
            note: item.Note || item.note || "",
        }));

        return { data: mapped };
    } catch (error) {
        console.error("Lỗi khi lấy dữ liệu lô đất từ backend API:", error);
    }
    return { data: [] };
}

export { lotsAPI };