/**
 * Utility to print simple invoices from Order details.
 * Supports different order object structures from Checkout, History, and Dashboard.
 */

interface NormalizedOrderItem {
  name: string;
  quantity: number;
  price: number;
  unit: string;
  total: number;
}

interface NormalizedOrder {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  address: string;
  paymentMethod: string;
  totalAmount: number;
  createdAt: string;
  items: NormalizedOrderItem[];
}

export function printInvoice(order: any) {
  if (typeof window === "undefined") return;

  // 1. Normalize the order object structure
  const rawId = order.id || order.ID || "";
  const displayId = rawId.length > 8 ? rawId.slice(0, 8).toUpperCase() : rawId.toUpperCase();

  const customerName = order.customerName || order.customer_name || "Khách Hàng";
  const customerPhone = order.customerPhone || order.customer_phone || order.phone || "N/A";
  const address = order.address || order.shippingAddress || order.shipping_address || "N/A";
  const paymentMethod = (order.paymentMethod || order.payment_method || "COD").toUpperCase();
  const totalAmount = order.totalAmount || order.total || order.total_amount || 0;
  
  const rawDate = order.createdAt || order.created_at || order.date || new Date().toISOString();
  let displayDate = "";
  try {
    displayDate = new Date(rawDate).toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit"
    });
  } catch (_) {
    displayDate = rawDate;
  }

  const rawItems = Array.isArray(order.items) ? order.items : [];
  const items: NormalizedOrderItem[] = rawItems.map((item: any) => {
    const name = item.productName || item.name || "Nông sản sạch";
    const quantity = item.quantity || 1;
    const price = item.price || 0;
    const unit = item.unit || "kg";
    return {
      name,
      quantity,
      price,
      unit,
      total: price * quantity
    };
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  // 2. Build print-friendly HTML string (Simple layout)
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="vi">
    <head>
      <meta charset="UTF-8">
      <title>Hóa Đơn - ${displayId}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          color: #333;
          margin: 0;
          padding: 20px;
          line-height: 1.4;
          font-size: 14px;
        }
        .invoice-box {
          max-width: 700px;
          margin: auto;
          padding: 20px;
          border: 1px solid #ddd;
          background: #fff;
        }
        .header-table {
          width: 100%;
          border-bottom: 2px solid #333;
          padding-bottom: 10px;
          margin-bottom: 20px;
        }
        .header-title {
          font-size: 20px;
          font-weight: bold;
          text-transform: uppercase;
        }
        .header-shop {
          text-align: right;
          font-size: 12px;
        }
        .info-section {
          width: 100%;
          margin-bottom: 20px;
        }
        .info-col {
          vertical-align: top;
          width: 50%;
        }
        .info-col h3 {
          font-size: 13px;
          margin: 0 0 8px 0;
          text-transform: uppercase;
          border-bottom: 1px solid #ddd;
          padding-bottom: 4px;
          color: #555;
        }
        .info-row {
          margin-bottom: 4px;
        }
        .info-label {
          color: #666;
          display: inline-block;
          width: 100px;
        }
        .info-value {
          font-weight: bold;
        }
        .items-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
        }
        .items-table th {
          border-top: 1px solid #333;
          border-bottom: 1px solid #333;
          padding: 8px 5px;
          font-size: 12px;
          text-align: left;
        }
        .items-table td {
          border-bottom: 1px solid #eee;
          padding: 8px 5px;
        }
        .qty {
          text-align: center;
        }
        .num {
          text-align: right;
        }
        .summary-table {
          width: 100%;
          margin-bottom: 30px;
        }
        .summary-table td {
          padding: 4px 5px;
        }
        .summary-label {
          text-align: right;
          color: #666;
        }
        .summary-value {
          text-align: right;
          font-weight: bold;
          width: 150px;
        }
        .total-row td {
          border-top: 1px solid #333;
          border-bottom: 2px double #333;
          font-size: 16px;
          font-weight: bold;
          padding-top: 8px;
          padding-bottom: 8px;
        }
        .signature-section {
          width: 100%;
          margin-top: 40px;
          text-align: center;
        }
        .signature-col {
          width: 50%;
          vertical-align: top;
        }
        .signature-title {
          font-weight: bold;
          margin-bottom: 50px;
        }
        .footer {
          margin-top: 50px;
          border-top: 1px solid #eee;
          padding-top: 10px;
          text-align: center;
          font-size: 12px;
          color: #777;
          font-style: italic;
        }
        @media print {
          body {
            padding: 0;
          }
          .invoice-box {
            border: none;
            padding: 0;
          }
          @page {
            size: A4;
            margin: 10mm;
          }
        }
      </style>
    </head>
    <body>
      <div class="invoice-box">
        <!-- Header -->
        <table class="header-table">
          <tr>
            <td class="header-title">HÓA ĐƠN BÁN HÀNG</td>
            <td class="header-shop">
              <strong>MOHICK ORGANIC FARM</strong><br>
              Địa chỉ: Xuân Khánh, Ninh Kiều, Cần Thơ<br>
              Điện thoại: 090 123 4567 | contact@mohickfarm.com
            </td>
          </tr>
        </table>

        <!-- Details -->
        <table class="info-section">
          <tr>
            <td class="info-col">
              <h3>Thông tin đơn hàng</h3>
              <div class="info-row"><span class="info-label">Mã hóa đơn:</span><span class="info-value">#HD-${displayId}</span></div>
              <div class="info-row"><span class="info-label">Ngày lập:</span><span class="info-value">${displayDate}</span></div>
              <div class="info-row"><span class="info-label">Thanh toán:</span><span class="info-value">${paymentMethod}</span></div>
            </td>
            <td class="info-col">
              <h3>Thông tin khách hàng</h3>
              <div class="info-row"><span class="info-label">Khách hàng:</span><span class="info-value">${customerName}</span></div>
              <div class="info-row"><span class="info-label">Điện thoại:</span><span class="info-value">${customerPhone}</span></div>
              <div class="info-row"><span class="info-label">Địa chỉ nhận:</span><span class="info-value">${address}</span></div>
            </td>
          </tr>
        </table>

        <!-- Items Table -->
        <table class="items-table">
          <thead>
            <tr>
              <th style="width: 40px;">STT</th>
              <th>Tên sản phẩm</th>
              <th style="width: 60px; text-align: center;">ĐVT</th>
              <th class="qty" style="width: 70px;">Số lượng</th>
              <th class="num" style="width: 100px;">Đơn giá</th>
              <th class="num" style="width: 120px;">Thành tiền</th>
            </tr>
          </thead>
          <tbody>
            ${items.map((item, index) => `
              <tr>
                <td>${index + 1}</td>
                <td><strong>${item.name}</strong></td>
                <td style="text-align: center;">${item.unit}</td>
                <td class="qty">${item.quantity}</td>
                <td class="num">${formatCurrency(item.price)}</td>
                <td class="num" style="font-weight: bold;">${formatCurrency(item.total)}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>

        <!-- Summary -->
        <table class="summary-table">
          <tr class="total-row">
            <td class="summary-label">TỔNG CỘNG THANH TOÁN:</td>
            <td class="summary-value">${formatCurrency(totalAmount)}</td>
          </tr>
        </table>

        <!-- Signatures -->
        <table class="signature-section">
          <tr>
            <td class="signature-col">
              <div class="signature-title">Người mua hàng</div>
              <div>(Ký và ghi rõ họ tên)</div>
              <div style="margin-top: 50px; font-weight: bold;">${customerName}</div>
            </td>
            <td class="signature-col">
              <div class="signature-title">Người bán hàng</div>
              <div>(Ký và đóng dấu)</div>
              <div style="margin-top: 50px; font-weight: bold;">Mohick Farm</div>
            </td>
          </tr>
        </table>

        <div class="footer">
          Cảm ơn Quý khách đã mua sắm tại Mohick Organic Farm!
        </div>
      </div>

      <script>
        window.onload = function() {
          setTimeout(function() {
            window.print();
          }, 200);
        }
      </script>
    </body>
    </html>
  `;

  // 3. Open print popup window
  const printWindow = window.open("", "_blank", "width=800,height=700,scrollbars=yes");
  if (printWindow) {
    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  } else {
    alert("Không thể mở cửa sổ in. Vui lòng cho phép Pop-up trong trình duyệt của bạn!");
  }
}
