"use client";

import React from "react";
import { Bot, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { LucideIcon } from "lucide-react";
import { toast } from "react-toastify";

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
  const [isMobileOpen, setIsMobileOpen] = React.useState(false);

  return (
    <>
      {/* Mobile Top Header for Sidebar Toggle */}
      <div className="md:hidden flex items-center justify-between bg-white px-4 py-3 border-b border-gray-200 sticky top-0 z-50">
        <Link href="/" className="flex items-center gap-2">
          <img src="/logo.svg" alt="PIONE GROUP" className="w-8 h-8 object-contain" />
          <span className="font-extrabold text-xs tracking-tight text-gray-800 uppercase">
            Pione Group
          </span>
        </Link>
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="p-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 focus:outline-none"
        >
          {isMobileOpen ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Backdrop for Mobile Sidebar */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <aside 
        className={`bg-white border-r border-gray-200/80 flex flex-col justify-between transition-all duration-300 
          fixed md:sticky top-0 left-0 h-full md:h-auto z-45 md:z-40
          ${isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
          ${isCollapsed ? "w-64 md:w-[70px]" : "w-64"}
          md:min-h-screen
        `}
      >
        <div>
          {/* Logo Brand area */}
          <div className="h-16 flex items-center justify-between px-4 border-b border-gray-100">
            <Link href="/" className="flex items-center gap-2.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.svg" alt="PIONE GROUP" className="w-9 h-9 object-contain" />
              {(!isCollapsed || isMobileOpen) && (
                <span className="font-extrabold text-sm tracking-tight text-gray-800 uppercase">
                  Pione Group
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
                  onClick={() => setIsMobileOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-3 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-emerald-50 text-emerald-700 shadow-sm shadow-emerald-50"
                      : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                  }`}
                  title={item.name}
                >
                  <Icon className={`w-4.5 h-4.5 ${isActive ? "text-emerald-600" : "text-gray-400"}`} />
                  {(!isCollapsed || isMobileOpen) && <span>{item.name}</span>}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* AI Bot Button at the bottom */}
        <div className="p-3 border-t border-gray-100">
          <button
            onClick={() => toast.info("Trợ lý AI Nông Nghiệp đang khởi chạy...")}
            className="w-full flex items-center justify-center gap-2 px-3 py-3 bg-gradient-to-r from-purple-650 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-lg shadow-md shadow-indigo-100 text-xs font-bold transition-all cursor-pointer"
          >
            <Bot className="w-4.5 h-4.5 animate-pulse" />
            {(!isCollapsed || isMobileOpen) && <span>Trợ lý AI Bot</span>}
          </button>
        </div>
      </aside>
    </>
  );
};

export default DashboardSidebar;
