import React from "react";
import { AlertCircle } from "lucide-react";

export default function SecurityTab() {
  return (
    <div className="animate-fade-in space-y-6">
      <div className="border-b border-gray-100 pb-4">
        <h3 className="text-base font-black text-gray-900 sm:text-lg">
          Bảo Mật Tài Khoản
        </h3>
        <p className="mt-0.5 text-[11px] font-medium text-gray-500 sm:text-xs">
          Quản lý các cơ chế bảo mật và thông tin xác thực để bảo vệ ví tài
          khoản.
        </p>
      </div>

      <div className="space-y-4 text-xs leading-relaxed font-medium text-gray-500 sm:text-sm">
        <div className="flex items-start gap-3 rounded-xl border border-yellow-100 bg-yellow-50/50 p-4.5 text-yellow-800">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-yellow-600" />
          <div>
            <span className="mb-0.5 block font-extrabold text-yellow-900">
              Đăng nhập thông qua Google
            </span>
            Tài khoản của bạn hiện đang liên kết trực tiếp và bảo mật thông qua
            xác thực bảo vệ của Google Account. Bạn không cần phải đổi mật khẩu
            thủ công tại đây.
          </div>
        </div>
      </div>
    </div>
  );
}
