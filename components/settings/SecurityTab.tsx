import React from "react";
import { AlertCircle } from "lucide-react";

export default function SecurityTab() {
    return (
        <div className="space-y-6 animate-fade-in">
            <div className="border-b border-gray-100 pb-4">
                <h3 className="text-base sm:text-lg font-black text-gray-900">Bảo Mật Tài Khoản</h3>
                <p className="text-[11px] sm:text-xs text-gray-500 font-medium mt-0.5">
                    Quản lý các cơ chế bảo mật và thông tin xác thực để bảo vệ ví tài khoản.
                </p>
            </div>

            <div className="space-y-4 text-xs sm:text-sm leading-relaxed text-gray-500 font-medium">
                <div className="p-4.5 bg-yellow-50/50 border border-yellow-100 text-yellow-800 rounded-xl flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
                    <div>
                        <span className="font-extrabold text-yellow-900 block mb-0.5">Đăng nhập thông qua Google</span>
                        Tài khoản của bạn hiện đang liên kết trực tiếp và bảo mật thông qua xác thực bảo vệ của Google Account. Bạn không cần phải đổi mật khẩu thủ công tại đây.
                    </div>
                </div>
            </div>
        </div>
    );
}
