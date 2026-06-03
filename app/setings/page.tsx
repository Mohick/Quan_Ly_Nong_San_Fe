"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SetingsRedirect() {
    const router = useRouter();

    useEffect(() => {
        router.replace("/settings");
    }, [router]);

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 text-gray-500 font-sans text-sm font-semibold">
            Đang chuyển hướng đến trang cài đặt...
        </div>
    );
}
