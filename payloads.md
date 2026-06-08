# Cart API - Request and Response Payloads Documentation

Tài liệu này mô tả chi tiết định dạng Payload của các Request và Response dành cho các API quản lý giỏ hàng (Cart API).

---

## 1. Lấy thông tin giỏ hàng (Get Cart)
- **Endpoint:** `GET /api/v1/cart`
- **Headers:** `Authorization: Bearer <token>`
- **Request Body:** Không có.

### Response Payload (200 OK)
```json
{
  "message": "Lấy giỏ hàng thành công",
  "valid": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "user_id": "550e8400-e29b-41d4-a716-446655440001",
    "created_at": "2026-06-08T11:15:00Z",
    "updated_at": "2026-06-08T11:15:00Z",
    "cart_items": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440002",
        "cart_id": "550e8400-e29b-41d4-a716-446655440000",
        "product_id": "550e8400-e29b-41d4-a716-446655440003",
        "quantity": 2,
        "created_at": "2026-06-08T11:16:00Z",
        "updated_at": "2026-06-08T11:17:00Z",
        "product": {
          "id": "550e8400-e29b-41d4-a716-446655440003",
          "crop_lot_id": "550e8400-e29b-41d4-a716-446655440004",
          "name": "Sầu riêng Ri6",
          "description": "Sầu riêng thơm ngon chất lượng cao",
          "price": 85000.00,
          "stock": 100,
          "image_products": [
            {
              "id": "550e8400-e29b-41d4-a716-446655440005",
              "image_url": "http://localhost:8080/public/uploads/img.jpg",
              "product_id": "550e8400-e29b-41d4-a716-446655440003"
            }
          ]
        }
      }
    ]
  }
}
```

---

## 2. Thêm sản phẩm vào giỏ hàng (Add To Cart)
- **Endpoint:** `POST /api/v1/cart/add`
- **Headers:** `Authorization: Bearer <token>`

### Request Payload
```json
{
  "product_id": "550e8400-e29b-41d4-a716-446655440003",
  "quantity": 2
}
```

### Response Payload (200 OK)
```json
{
  "message": "Thêm vào giỏ hàng thành công",
  "valid": true
}
```

---

## 3. Cập nhật số lượng sản phẩm trong giỏ (Update Cart Item)
- **Endpoint:** `PUT /api/v1/cart/item/update`
- **Headers:** `Authorization: Bearer <token>`

### Request Payload
```json
{
  "product_id": "550e8400-e29b-41d4-a716-446655440003",
  "quantity": 5
}
```

### Response Payload (200 OK)
```json
{
  "message": "Cập nhật giỏ hàng thành công",
  "valid": true
}
```

---

## 4. Xóa sản phẩm khỏi giỏ hàng (Remove Item)
- **Endpoint:** `DELETE /api/v1/cart/item/delete/:product_id`
- **Headers:** `Authorization: Bearer <token>`
- **Request Body:** Không có.

### Response Payload (200 OK)
```json
{
  "message": "Xóa sản phẩm khỏi giỏ hàng thành công",
  "valid": true
}
```

---

## 5. Xóa sạch giỏ hàng (Clear Cart)
- **Endpoint:** `DELETE /api/v1/cart/clear`
- **Headers:** `Authorization: Bearer <token>`
- **Request Body:** Không có.

### Response Payload (200 OK)
```json
{
  "message": "Xóa sạch giỏ hàng thành công",
  "valid": true
}
```
