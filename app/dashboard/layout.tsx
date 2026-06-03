"use client";

import React, { useState } from "react";
import { LayoutDashboard, Sprout, ShoppingBag, Package, Layers } from "lucide-react";
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
    { name: "Doanh Thu", href: "/dashboard/revenue", icon: Sprout },
    { name: "Quản Lý Đơn Hàng", href: "/dashboard/orders", icon: ShoppingBag },
    { name: "Về trang chủ", href: "/", icon: ShoppingBag },
  ];

  return (
    <div className="grid grid-cols-12 min-h-screen bg-[#fafafb] font-sans">
      {/* 3 columns: Sidebar navigation component */}
      <DashboardSidebar
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
        navItems={navItems}
        pathname={pathname}
      />

      {/* 9 columns: Topbar + Main dynamic children panel */}
      <main className={`col-span-12 ${isCollapsed ? "md:col-span-11.5 flex-1" : "md:col-span-9"} flex flex-col min-h-screen transition-all duration-300`}>
        <DashboardTopbar />
        
        {/* Dashboard Content Container */}
        <section className="p-6 md:p-8 flex-1 bg-[#fafafb]">
          {children}
        </section>
      </main>
    </div>
  );
}
