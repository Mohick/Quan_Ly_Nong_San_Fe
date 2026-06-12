"use client";

import React from "react";
import Link from "next/link";
import { MessageSquare } from "lucide-react";
import { useAutoLogin } from "@/hooks/useAutoLogin";
import { usePathname } from "next/navigation";

const FloatingChatButton = () => {
  const { user, loading } = useAutoLogin();
  const pathname = usePathname();

  // Do not render if loading, user is not logged in, or already on the chat / dashboard page
  if (loading || !user || pathname === "/chat" || pathname?.startsWith("/dashboard")) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center">
      {/* Pulse Ripple Wave Effect */}
      <span className="absolute inset-0 rounded-full bg-[#13a855]/20 animate-ripple pointer-events-none" />
      <span className="absolute inset-0 rounded-full bg-[#13a855]/15 animate-ripple-delayed pointer-events-none" />

      <Link
        href="/chat"
        aria-label="Nhắn tin hỗ trợ"
        className="relative flex h-full w-full items-center justify-center rounded-full bg-[#13a855] text-white shadow-lg transition-all duration-300 hover:scale-110 hover:bg-[#0f8b44] hover:shadow-xl active:scale-95 cursor-pointer z-10"
      >
        <MessageSquare className="h-6 w-6" />
      </Link>
    </div>
  );
};

export default FloatingChatButton;
