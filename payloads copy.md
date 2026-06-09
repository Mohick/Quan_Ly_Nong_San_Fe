# Product API - Request and Response Payloads Documentation

Tài liệu này mô tả chi tiết định dạng Payload của các Request và Response dành cho các API quản lý Sản phẩm (Product API) có liên quan đến tính năng **Tùy chọn & Biến thể sản phẩm (Product Variants)**.

> [!IMPORTANT]
> Vì một số struct trong Go của dự án hiện tại không cấu hình thẻ JSON (`json:"..."`), dữ liệu trả về từ backend sẽ giữ nguyên định dạng PascalCase của Go (ví dụ: `ID`, `Name`, `Price`, `Stock`, `ImageProducts`) ngoại trừ các trường có thẻ json cụ thể như `product_variants`.

---

## 1. Tạo sản phẩm mới (Create Product)
- **Endpoint:** `POST /products`
- **Headers:** `Content-Type: multipart/form-data`
- **Request Body (form-data):**
  - `crop_lot_id`: `"550e8400-e29b-41d4-a716-446655440004"`
  - `category_id`: `"550e8400-e29b-41d4-a716-446655440005"`
  - `name`: `"Thanh Long Bình Thuận"`
  - `description`: `"Thanh long Bình Thuận thơm ngon, chín mọng"`
  - `price`: `20000.00`
  - `stock`: `10`
  - `product_variants`: `"[{\"tile\": \"Ruột đỏ - Không hạt\", \"price\": \"35000\", \"quantity\": \"50\", \"options\": [{\"name\": \"Màu sắc\", \"value\": \"Ruột đỏ\"}, {\"name\": \"Hạt\", \"value\": \"Không hạt\"}]}, {\"tile\": \"Ruột trắng - Có hạt\", \"price\": \"22000\", \"quantity\": \"100\", \"options\": [{\"name\": \"Màu sắc\", \"value\": \"Ruột trắng\"}, {\"name\": \"Hạt\", \"value\": \"Có hạt\"}]}]"` *(Chuỗi JSON chứa danh sách các biến thể sản phẩm, mỗi biến thể gồm tiêu đề, giá, số lượng tồn và danh sách thuộc tính)*
  - `image`: *(File ảnh upload)*

### Response Payload (200 OK)
```json
{
  "message": "thêm sản phẩm mới thành công",
  "valid": true
}
```

---

## 2. Cập nhật sản phẩm (Update Product)
- **Endpoint:** `PUT /products/:id`
- **Headers:** `Content-Type: multipart/form-data`
- **Request Body (form-data):**
  - `crop_lot_id`: `"550e8400-e29b-41d4-a716-446655440004"`
  - `category_id`: `"550e8400-e29b-41d4-a716-446655440005"`
  - `name`: `"Thanh Long Bình Thuận Chất Lượng Cao"`
  - `description`: `"Thanh long chất lượng cao chuyên xuất khẩu"`
  - `price`: `25000.00`
  - `stock`: `15`
  - `product_variants`: `"[{\"tile\": \"Ruột đỏ\", \"price\": \"36000\", \"quantity\": \"80\", \"options\": [{\"name\": \"Màu sắc\", \"value\": \"Ruột đỏ\"}]}]"` *(Ghi đè toàn bộ các biến thể cũ bằng danh sách biến thể mới này)*
  - `image`: *(File ảnh upload mới - nếu muốn thay đổi)*

### Response Payload (200 OK)
```json
{
  "message": "cập nhật sản phẩm thành công",
  "valid": true
}
```

---

## 3. Xem chi tiết sản phẩm (Get Product Detail)
- **Endpoint:** `GET /products/get_by_id/:id`
- **Headers:** Không yêu cầu.
- **Request Body:** Không có.

### Response Payload (200 OK)
```json
{
  "message": "Lấy dữ liệu thành công",
  "valid": true,
  "data": {
    "ID": "550e8400-e29b-41d4-a716-446655440003",
    "CategoryID": "550e8400-e29b-41d4-a716-446655440005",
    "CropLotID": "550e8400-e29b-41d4-a716-446655440004",
    "Name": "Thanh Long Bình Thuận",
    "Description": "Thanh long Bình Thuận thơm ngon, chín mọng",
    "Price": 20000,
    "Stock": 10,
    "CreatedAt": "2026-06-08T11:15:00Z",
    "UpdatedAt": "2026-06-08T11:15:00Z",
    "Category": null,
    "CropLot": {
      "ID": "550e8400-e29b-41d4-a716-446655440004"
      // ... các thông tin khác của Lô mùa vụ (CropLot)
    },
    "ImageProducts": [
      {
        "ID": "550e8400-e29b-41d4-a716-446655440007",
        "ImageURL": "http://localhost:8080/public/uploads/thanhlong.jpg",
        "ProductID": "550e8400-e29b-41d4-a716-446655440003",
        "CreatedAt": "2026-06-08T11:15:00Z",
        "UpdatedAt": "2026-06-08T11:15:00Z"
      }
    ],
    "Discount": null,
    "product_variants": [
      {
        "id": "pv-1-uuid",
        "product_id": "550e8400-e29b-41d4-a716-446655440003",
        "tile": "Ruột đỏ - Không hạt",
        "price": 35000,
        "quantity": 50,
        "created_at": "2026-06-08T11:15:00Z",
        "updated_at": "2026-06-08T11:15:00Z",
        "options": [
          {
            "id": "opt-1-uuid",
            "product_variant_id": "pv-1-uuid",
            "name": "Màu sắc",
            "value": "Ruột đỏ",
            "created_at": "2026-06-08T11:15:00Z",
            "updated_at": "2026-06-08T11:15:00Z"
          },
          {
            "id": "opt-2-uuid",
            "product_variant_id": "pv-1-uuid",
            "name": "Hạt",
            "value": "Không hạt",
            "created_at": "2026-06-08T11:15:00Z",
            "updated_at": "2026-06-08T11:15:00Z"
          }
        ]
      }
    ]
  }
}
```
