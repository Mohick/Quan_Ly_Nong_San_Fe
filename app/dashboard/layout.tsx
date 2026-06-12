"use client";

import React, { useState } from "react";
import { LayoutDashboard, Sprout, ShoppingBag, Package, Layers, Landmark, House, MessageSquare } from "lucide-react";
import { usePathname } from "next/navigation";
import DashboardSidebar from "@/components/dashboard/dashboard_sidebar";
import DashboardTopbar from "@/components/dashboard/dashboard_topbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navItems = [
    { name: "Tổng Quan", href: "/dashboard", icon: LayoutDashboard },
    { name: "Sản Phẩm", href: "/dashboard/products", icon: Package },
    { name: "Lô Canh Tác", href: "/dashboard/lots", icon: Layers },
    { name: "Thông Tin Trang Trại", href: "/dashboard/farm", icon: Landmark },
    { name: "Doanh Thu", href: "/dashboard/revenue", icon: Sprout },
    { name: "Quản Lý Đơn Hàng", href: "/dashboard/orders", icon: ShoppingBag },
    { name: "Tin Nhắn", href: "/dashboard/chat", icon: MessageSquare },
    { name: "Về trang chủ", href: "/", icon: House },
  ];

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#fafafb] font-sans">
      {/* Sidebar navigation component */}
      <DashboardSidebar
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
        navItems={navItems}
        pathname={pathname}
      />

      {/* Main dynamic children panel */}
      <main className="flex-1 flex flex-col min-h-screen transition-all duration-300">
        <DashboardTopbar />

        {/* Dashboard Content Container */}
        <section className="p-6 md:p-8 flex-1 bg-[#fafafb]">
          {children}
        </section>
      </main>
    </div>
  );
}
