"use client";

import React from "react";
import { Sprout, Bot, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { LucideIcon } from "lucide-react";

interface NavItem {
  name: string;
  href: string;
  icon: LucideIcon;
}

interface DashboardSidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  navItems: NavItem[];
  pathname: string;
}

const DashboardSidebar: React.FC<DashboardSidebarProps> = ({
  isCollapsed,
  onToggleCollapse,
  navItems,
  pathname,
}) => {
  return (
    <aside 
      className={`col-span-12 md:col-span-3 bg-white border-r border-gray-200/80 flex flex-col justify-between transition-all duration-300 ${
        isCollapsed ? "md:max-w-[70px]" : "w-full"
      } min-h-screen sticky top-0`}
    >
      <div>
        {/* Logo Brand area */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-100">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-250">
              <Sprout className="w-5 h-5" />
            </div>
            {!isCollapsed && (
              <span className="font-extrabold text-sm tracking-tight text-gray-800 uppercase">
                Nông Sản Việt
              </span>
            )}
          </Link>
          
          {/* Collapse toggle button on desktop */}
          <button
            onClick={onToggleCollapse}
            className="hidden md:flex w-6 h-6 items-center justify-center rounded-md border border-gray-200 text-gray-400 hover:text-gray-650 hover:bg-gray-50 transition-all cursor-pointer"
          >
            {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-3 rounded-lg text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-emerald-50 text-emerald-700 shadow-sm shadow-emerald-50"
                    : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                }`}
                title={item.name}
              >
                <Icon className={`w-4.5 h-4.5 ${isActive ? "text-emerald-600" : "text-gray-400"}`} />
                {!isCollapsed && <span>{item.name}</span>}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* AI Bot Button at the bottom */}
      <div className="p-3 border-t border-gray-100">
        <button
          onClick={() => alert("Trợ lý AI Nông Nghiệp đang khởi chạy...")}
          className="w-full flex items-center justify-center gap-2 px-3 py-3 bg-gradient-to-r from-purple-650 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-lg shadow-md shadow-indigo-100 text-xs font-bold transition-all cursor-pointer"
        >
          <Bot className="w-4.5 h-4.5 animate-pulse" />
          {!isCollapsed && <span>Trợ lý AI Bot</span>}
        </button>
      </div>
    </aside>
  );
};

export default DashboardSidebar;
