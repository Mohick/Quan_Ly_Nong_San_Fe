# 📜 HƯỚNG DẪN QUY CHUẨN DỰ ÁN (PROJECT DEVELOPMENT GUIDELINES)
> **Dự án:** Quản lý Nông Sản (Frontend)  
> **Vai trò bản tài liệu:** Định hình tiêu chuẩn code, kiến trúc dự án và quy trình làm việc thống nhất cho toàn bộ lập trình viên (Devs) trong team. Được biên soạn bởi Tech Lead.

---

## 🛠️ 1. Công Nghệ Sử Dụng (Tech Stack)

Để đảm bảo hiệu năng và tính ổn định cao nhất, dự án sử dụng các công nghệ cốt lõi sau:
* **Framework:** Next.js 16.2.6 (App Router + Turbopack)
* **Runtime & Package Manager:** Bun
* **State & Data Fetching:** React Query v5 (TanStack Query) & Axios
* **Styling:** Tailwind CSS v4.x
* **Language:** TypeScript (Strict Mode)

---

## 📂 2. Kiến Trúc Thư Mục (Folder Architecture)

Dự án tuân thủ mô hình **Clean Architecture**. Toàn bộ mã nguồn phải được xếp đúng vị trí quy định dưới đây:

```text
my-app/ (Root)
├── app/                  # ROUTING LAYER (Next.js App Router)
│   ├── (auth)/           # Route group cho Authentication (Login, Register)
│   ├── (dashboard)/      # Route group cho Admin & Quản lý Nông Sản
│   ├── layout.tsx        # Server-side HTML layout gốc
│   ├── providers.tsx     # Client-side providers (React Query, Theme, Contexts)
│   └── page.tsx          # Trang chủ chính
├── components/           # UI COMPONENTS LAYER (Tái sử dụng)
│   ├── ui/               # Atom Components (Nút bấm, Input, Card - dạng shadcn/ui)
│   ├── common/           # Organism Components (Header, Footer, Sidebar)
│   └── business/         # Components gắn liền nghiệp vụ nông sản (ProductCard, StockStatus)
├── lib/                  # THIRD-PARTY INTEGRATION LAYER (Khởi tạo SDK/Libraries)
│   └── axios.ts          # Khởi tạo Axios instance (Base URL, Global Headers)
├── services/             # BUSINESS LOGIC & DATA FETCHING LAYER
│   ├── auth.service.ts   # Xử lý gọi API auth & lưu token
│   └── product.service.ts# Xử lý gọi API quản lý sản phẩm
├── hooks/                # CUSTOM REACT HOOKS LAYER (Các hooks dùng chung)
├── utils/                # UTILITY LAYER (Hàm bổ trợ Pure Functions)
│   └── format.ts         # Ví dụ: định dạng tiền VND, format ngày tháng
├── types/                # TYPESCRIPT DEFINITIONS
└── public/               # STATIC ASSETS (Ảnh tĩnh, SVG, Logo)
```

### 🚨 Nguyên Tắc Vàng của Tech Lead:
1. **Không viết logic gọi API trong UI Components:** Components chỉ nhận data và hiển thị giao diện. Toàn bộ logic gọi API phải nằm trong `services/`.
2. **Không để code xử lý nghiệp vụ trong `lib/`:** `lib/` chỉ làm nhiệm vụ khởi tạo cấu hình công cụ.
3. **`utils/` là Pure Functions:** Không gọi API, không dùng React Hooks, đầu vào X đầu ra Y.

---

## 💻 3. Quy Chuẩn Code (Coding Standards)

### 3.1. Ranh Giới React Server Components (RSC) & Client Components
* **Mặc định là Server Components:** Mọi component trong `app/` đều chạy trên server để tăng tốc độ load và SEO.
* **Chỉ chuyển sang Client Component khi:**
  * Cần dùng React Hooks (`useState`, `useEffect`, `useContext`...).
  * Cần tương tác người dùng (`onClick`, `onChange`, `onSubmit`...).
  * Cần truy cập API trình duyệt (`window`, `localStorage`...).
* **Cách khai báo:** Viết `"use client";` ở ngay **dòng đầu tiên** của file.

### 3.2. Quy Chuẩn Khởi Tạo React Query (TanStack Query)
Tránh tuyệt đối việc tạo `new QueryClient()` ở phạm vi toàn cục hoặc trực tiếp trong thân hàm component vì sẽ gây rò rỉ dữ liệu hoặc mất cache khi re-render.
* **Chuẩn áp dụng:** Luôn bọc qua `useState` lazy initializer như cấu hình tại `app/providers.tsx`:
  ```tsx
  "use client";
  import { useState } from "react";
  import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
  
  export default function Providers({ children }) {
    const [queyryClient] = useState(() => new QueryClient());
    return <QueryClientProvider client={queyryClient}>{children}</QueryClientProvider>;
  }
  ```

### 3.3. Đường Dẫn Tuyệt Đối (Path Alias `@/`)
Tuyệt đối không sử dụng đường dẫn tương đối sâu như `../../../../components/button`.
* **Chuẩn áp dụng:** Luôn dùng ký tự `@/` trỏ về thư mục gốc:
  ```typescript
  import axiosInstance from "@/lib/axios";
  import Button from "@/components/ui/Button";
  ```

---

## 🏷️ 4. Quy Chuẩn Đặt Tên & TypeScript

* **Component Files (.tsx):** Đặt tên theo dạng **PascalCase** (Ví dụ: `ProductCard.tsx`, `HeaderBar.tsx`).
* **Hàm, Biến, Logic (.ts):** Đặt tên theo dạng **camelCase** (Ví dụ: `axiosInstance`, `getProductById`).
* **Khai báo Interface/Type:** Luôn viết hoa chữ cái đầu và đặt tên rõ nghĩa:
  ```typescript
  export interface Product {
    id: string;
    name: string;
    price: number;
  }
  ```
* **Strict Type:** Cấm sử dụng kiểu `any`. Mọi dữ liệu API trả về phải được định nghĩa kiểu dữ liệu rõ ràng.

### 4.1. Quy chuẩn đặt tên thư mục & file đặc biệt trong `app/`
Để hệ thống định tuyến (Routing) hoạt động chính xác và đồng bộ, team phải tuân thủ nghiêm ngặt quy tắc đặt tên thư mục con trong `app/`:

1. **Thư mục Route tĩnh (Static Route):** Đặt tên dạng **kebab-case** (chữ thường, phân tách bằng dấu gạch ngang).
   * *Đúng:* `app/products`, `app/product-categories`
   * *Sai:* `app/productCategories`, `app/Product_Categories`
2. **Thư mục Route động (Dynamic Route):** Bọc trong dấu ngoặc vuông `[parameterName]`, đặt tên parameter theo dạng **camelCase** hoặc **kebab-case**.
   * *Ví dụ:* `app/products/[id]`, `app/products/[productSlug]`
3. **Thư mục nhóm định tuyến (Route Groups):** Bọc trong dấu ngoặc tròn `(groupName)`, viết chữ thường, dạng **kebab-case**.
   * *Ví dụ:* `(auth)`, `(dashboard)` *(Next.js sẽ bỏ qua tên này trong URL)*
4. **Thư mục ẩn (Private Folders):** Bắt đầu bằng dấu gạch dưới `_folderName` để chứa component hoặc hook nội bộ.
   * *Ví dụ:* `_api`, `_components` *(Next.js sẽ không coi đây là một route)*
5. **Tên file hệ thống bắt buộc của Next.js:** Luôn viết chữ thường, không tự ý đổi tên:
   * `page.tsx` (trang nội dung)
   * `layout.tsx` (giao diện khung)
   * `loading.tsx` (hiệu ứng chờ tải trang)
   * `error.tsx` (giao diện báo lỗi)
   * `not-found.tsx` (giao diện 404)

---

## 💅 5. Quy Chuẩn Định Dạng Code (Formatting)

Dự án đã cấu hình Prettier chuẩn tại `.prettierrc.json`. Mọi Devs phải cài đặt extension **Prettier - Code formatter** trên VS Code và kích hoạt tính năng **Format on Save**.

### Cấu hình Prettier quy chuẩn:
* Sử dụng dấu chấm phẩy (`"semi": true`)
* Sử dụng dấu nháy kép (`"singleQuote": false`)
* Thụt lề bằng 2 khoảng trắng (`"tabWidth": 2`)
* Tự động sắp xếp class Tailwind CSS bằng plugin `prettier-plugin-tailwindcss`.

---

## 🌿 6. Quy Trình Git & Commit (Git Flow)

### 6.1. Quy tắc Đặt Tên Nhánh (Branch Naming)
Mọi dev khi nhận task phải tạo nhánh từ nhánh `main` (hoặc `develop`) theo cú pháp:
* **Tính năng mới:** `feat/ten-tinh-nang` (VD: `feat/product-list`, `feat/login`)
* **Sửa lỗi:** `bugfix/ten-loi` (VD: `bugfix/cart-calculation`, `bugfix/layout-overlap`)
* **Tài liệu/Cấu hình:** `docs/ten-tai-lieu` hoặc `chore/ten-cau-hinh`

### 6.2. Quy tắc Viết Commit Message (Conventional Commits)
Nội dung commit phải rõ ràng, ngắn gọn và bắt đầu bằng các tiền tố:
* `feat: ...` ➡️ Khi thêm tính năng mới.
* `fix: ...` ➡️ Khi sửa lỗi.
* `docs: ...` ➡️ Khi cập nhật tài liệu hoặc comment giải thích.
* `style: ...` ➡️ Khi sửa giao diện CSS, Tailwind mà không đổi logic code.
* `refactor: ...` ➡️ Khi tối ưu hóa cấu trúc code cũ mà không đổi tính năng.

*Ví dụ:* `feat: tích hợp Axios client và cấu hình base URL`

---

> **Lời nhắn từ Tech Lead:** *"Code chuẩn chỉnh ngay từ những dòng đầu tiên sẽ giúp chúng ta tiết kiệm 80% thời gian debug về sau. Chúc anh em code vui vẻ và đưa dự án nông sản của chúng ta bay cao!"*
