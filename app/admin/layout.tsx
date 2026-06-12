"use client";

import React, { useState } from "react";
import { LayoutDashboard, Users, ShieldCheck, Banknote, House, MessageSquare } from "lucide-react";
import { usePathname } from "next/navigation";
import DashboardSidebar from "@/components/dashboard/dashboard_sidebar";
import DashboardTopbar from "@/components/dashboard/dashboard_topbar";
import { ToastContainer } from "react-toastify";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navItems = [
    { name: "Tổng Quan", href: "/admin", icon: LayoutDashboard },
    { name: "Xét Duyệt Chứng Chỉ", href: "/admin/certificates", icon: ShieldCheck },
    { name: "Quản Lý Doanh Thu", href: "/admin/revenue", icon: Banknote },
    { name: "Quản Lý Nhân Sự", href: "/admin/users", icon: Users },
    { name: "Tin Nhắn", href: "/dashboard/chat", icon: MessageSquare },
    { name: "Về trang chủ", href: "/", icon: House },
  ];

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#fafafb] font-sans">
      <ToastContainer position="top-right" autoClose={3000} />
      
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
