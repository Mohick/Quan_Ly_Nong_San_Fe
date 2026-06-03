"use client";

import React, { useState } from "react";
import { 
  Phone, Mail, MapPin, Clock, Send, CheckCircle2, 
  HelpCircle, ChevronDown, MessageSquare, ShieldCheck, Sparkles, ArrowRight
} from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
}

export default function ContactSupportPage() {
  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState("general");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // FAQ states
  const [openFAQ, setOpenFAQ] = useState<number | null>(0);

  const faqs: FAQItem[] = [
    {
      question: "Nông sản PIONE có nguồn gốc từ đâu và đạt tiêu chuẩn gì?",
      answer: "Tất cả nông sản của PIONE đều được canh tác trực tiếp tại các trang trại thành viên liên kết (Lâm Đồng, Bến Tre, Cần Thơ, Thái Nguyên...). Toàn bộ quy trình gieo trồng và thu hoạch đều được kiểm duyệt gắt gao, đạt các tiêu chuẩn quốc tế uy tín như VietGAP, GlobalGAP và Organic hữu cơ."
    },
    {
      question: "Chính sách đổi trả sản phẩm khi gặp lỗi hoặc không tươi ngon như thế nào?",
      answer: "PIONE cam kết hoàn tiền 100% hoặc đổi mới sản phẩm ngay lập tức nếu quý khách phát hiện nông sản bị giập nát, héo úa hoặc không đạt chất lượng cam kết trong vòng 24h kể từ khi nhận hàng. Vui lòng chụp ảnh sản phẩm lỗi gửi về hòm thư support@pione.vn."
    },
    {
      question: "Tôi có thể đăng ký tham quan trực tiếp các trang trại đối tác không?",
      answer: "Hoàn toàn được! PIONE khuyến khích khách hàng đăng ký trải nghiệm du lịch nông nghiệp trực tiếp. Bạn chỉ cần nhấn đăng ký tham gia hội viên tại trang chi tiết của nhà vườn hoặc gửi yêu cầu tham quan qua form liên hệ bên dưới để chúng tôi sắp xếp lịch đón tiếp chu đáo."
    },
    {
      question: "Làm cách nào để trở thành đối tác nhà nông liên kết của PIONE GROUP?",
      answer: "Chúng tôi luôn chào đón các nông hộ đạt tiêu chuẩn canh tác sạch. Bạn vui lòng chọn chủ đề 'Đăng ký đối tác nhà nông' ở form liên hệ, điền thông tin về diện tích, vị trí và các loại nông sản chủ lực. Ban kiểm duyệt nông nghiệp PIONE sẽ liên hệ khảo sát trực tiếp trong vòng 3 ngày làm việc."
    }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) {
      alert("Vui lòng điền đầy đủ các thông tin bắt buộc!");
      return;
    }

    setIsSubmitting(true);

    // Simulate API request submission
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      // Reset form
      setName("");
      setEmail("");
      setPhone("");
      setSubject("general");
      setMessage("");
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#f8faf9] font-sans selection:bg-[#13a855]/20 selection:text-[#13a855] pb-20">
      
      {/* 1. Stunning Hero Banner Header */}
      <div className="bg-gradient-to-b from-[#eafaf0] to-[#f8faf9] pt-12 pb-10 border-b border-[#e2efe7]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#e8f8f0] text-[#13a855] text-xs font-black rounded-full mb-4 border border-[#d4f2e1]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>PIONE Support Center</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 tracking-tight leading-tight">
            Chúng Tôi Có Thể Giúp Gì Cho Bạn?
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 font-semibold mt-2.5 max-w-xl mx-auto">
            Hỗ trợ giải đáp mọi thắc mắc về đơn hàng, chất lượng nông sản, dịch vụ giao nhận hoặc đăng ký tham gia chuỗi đối tác nhà vườn nông nghiệp sạch.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Contact info cards & FAQ */}
          <div className="lg:col-span-5 space-y-8">
            
            {/* Quick Support Channels Cards */}
            <div className="bg-white border border-gray-200/80 rounded-3xl p-6 shadow-sm space-y-6">
              <h3 className="text-base sm:text-lg font-black text-gray-900 pb-3 border-b border-gray-150">
                Thông Tin Liên Hệ Nhanh
              </h3>
              
              <div className="space-y-5 text-xs sm:text-sm">
                
                {/* Channel 1: Hotline */}
                <div className="flex gap-4 items-start group">
                  <div className="p-3 bg-[#e8f8f0] text-[#13a855] rounded-2xl group-hover:scale-105 transition-all">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="block text-[10px] text-gray-400 font-black uppercase tracking-wider">Tổng đài CSKH (24/7)</span>
                    <span className="block font-black text-gray-900 text-sm mt-0.5 hover:text-[#13a855] cursor-pointer">
                      1900 8899 (Phím 2)
                    </span>
                  </div>
                </div>

                {/* Channel 2: Email */}
                <div className="flex gap-4 items-start group">
                  <div className="p-3 bg-sky-50 text-sky-500 rounded-2xl group-hover:scale-105 transition-all">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="block text-[10px] text-gray-400 font-black uppercase tracking-wider">Hòm thư điện tử</span>
                    <span className="block font-black text-gray-900 text-sm mt-0.5 hover:text-sky-500 cursor-pointer">
                      support@pione.vn
                    </span>
                  </div>
                </div>

                {/* Channel 3: Address */}
                <div className="flex gap-4 items-start group">
                  <div className="p-3 bg-amber-50 text-amber-500 rounded-2xl group-hover:scale-105 transition-all">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="block text-[10px] text-gray-400 font-black uppercase tracking-wider">Văn phòng đại diện</span>
                    <span className="block font-bold text-gray-700 text-xs sm:text-sm mt-0.5 leading-relaxed">
                      Tòa nhà PIONE, Đường Số 12, KĐT Thủ Thiêm, TP. Thủ Đức, TP. Hồ Chí Minh.
                    </span>
                  </div>
                </div>

                {/* Channel 4: Hours */}
                <div className="flex gap-4 items-start group">
                  <div className="p-3 bg-purple-50 text-purple-500 rounded-2xl group-hover:scale-105 transition-all">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="block text-[10px] text-gray-400 font-black uppercase tracking-wider">Thời gian làm việc</span>
                    <span className="block font-black text-gray-900 text-sm mt-0.5">
                      Thứ 2 - Thứ 7: 08:00 - 18:00
                    </span>
                  </div>
                </div>

              </div>
            </div>

            {/* Premium Simulated Live Map Card */}
            <div className="bg-white border border-gray-200/80 rounded-3xl p-5 shadow-sm space-y-4">
              <div className="h-44 w-full rounded-2xl bg-slate-100 overflow-hidden relative border border-gray-150">
                <img 
                  src="https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=600&auto=format&fit=crop" 
                  alt="Văn phòng PIONE Map" 
                  className="w-full h-full object-cover opacity-80"
                />
                <div className="absolute inset-0 bg-[#13a855]/10 mix-blend-multiply"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-white/95 px-4 py-2.5 rounded-full shadow-lg border border-gray-250 flex items-center gap-2 max-w-xs animate-bounce">
                    <MapPin className="w-4 h-4 text-[#13a855] fill-emerald-100 animate-pulse" />
                    <span className="text-[11px] font-black text-gray-800 truncate">Văn phòng PIONE GROUP</span>
                  </div>
                </div>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-400 font-bold">Thành phố Hồ Chí Minh, Việt Nam</span>
                <a 
                  href="https://maps.google.com" 
                  target="_blank" 
                  rel="noreferrer"
                  className="flex items-center gap-1 text-[#13a855] hover:text-[#0f8b44] font-black"
                >
                  <span>Chỉ đường</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

          </div>

          {/* Right Column: Dynamic interactive form & FAQs list */}
          <div className="lg:col-span-7 space-y-8">
            
            {/* Interactive Support Form */}
            <div className="bg-white border border-gray-200/80 rounded-3xl p-6 sm:p-8 shadow-sm">
              <div className="mb-6">
                <h3 className="text-lg font-black text-gray-900">Gửi Yêu Cầu Hỗ Trợ</h3>
                <p className="text-xs text-gray-400 font-semibold mt-0.5">
                  Điền vào biểu mẫu bên dưới và chúng tôi sẽ phản hồi lại bạn sớm nhất trong vòng 2 giờ làm việc.
                </p>
              </div>

              {isSubmitted ? (
                <div className="p-8 text-center bg-[#e8f8f0] border border-[#c3ecd1] rounded-2xl space-y-3 animate-fade-in">
                  <CheckCircle2 className="w-12 h-12 text-[#13a855] mx-auto" />
                  <h4 className="text-base font-black text-gray-900">Gửi Yêu Cầu Thành Công!</h4>
                  <p className="text-xs text-gray-600 font-medium leading-relaxed max-w-sm mx-auto">
                    Cảm ơn bạn đã liên hệ với PIONE. Đội ngũ tổng đài CSKH đã tiếp nhận yêu cầu và sẽ liên hệ trực tiếp hỗ trợ bạn trong thời gian sớm nhất.
                  </p>
                  <button 
                    onClick={() => setIsSubmitted(false)}
                    className="px-5 py-2.5 bg-[#13a855] hover:bg-[#0f8b44] text-white text-xs font-black rounded-xl shadow-sm transition-all"
                  >
                    Gửi yêu cầu mới
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    
                    {/* Input: Fullname */}
                    <div className="space-y-1.5">
                      <label className="block text-[10px] text-gray-400 font-black uppercase tracking-wider">Họ và Tên *</label>
                      <input 
                        type="text" 
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Nguyễn Văn A"
                        className="w-full bg-white border border-gray-300 rounded-xl py-2.5 px-4 font-semibold focus:outline-none focus:border-[#13a855] focus:ring-1 focus:ring-[#13a855] transition-all"
                      />
                    </div>

                    {/* Input: Email */}
                    <div className="space-y-1.5">
                      <label className="block text-[10px] text-gray-400 font-black uppercase tracking-wider">Địa Chỉ Email *</label>
                      <input 
                        type="email" 
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="nguyenvana@gmail.com"
                        className="w-full bg-white border border-gray-300 rounded-xl py-2.5 px-4 font-semibold focus:outline-none focus:border-[#13a855] focus:ring-1 focus:ring-[#13a855] transition-all"
                      />
                    </div>

                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    
                    {/* Input: Phone */}
                    <div className="space-y-1.5">
                      <label className="block text-[10px] text-gray-400 font-black uppercase tracking-wider">Số Điện Thoại</label>
                      <input 
                        type="tel" 
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="0901234567"
                        className="w-full bg-white border border-gray-300 rounded-xl py-2.5 px-4 font-semibold focus:outline-none focus:border-[#13a855] focus:ring-1 focus:ring-[#13a855] transition-all"
                      />
                    </div>

                    {/* Selector: Subject */}
                    <div className="space-y-1.5">
                      <label className="block text-[10px] text-gray-400 font-black uppercase tracking-wider">Chủ Đề Cần Hỗ Trợ</label>
                      <select 
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        className="w-full bg-white border border-gray-300 rounded-xl py-2.5 px-4 font-semibold focus:outline-none focus:border-[#13a855] focus:ring-1 focus:ring-[#13a855] transition-all cursor-pointer"
                      >
                        <option value="general">Thắc mắc chung</option>
                        <option value="order">Hỗ trợ đơn hàng & Thanh toán</option>
                        <option value="quality">Chất lượng nông sản</option>
                        <option value="partner">Đăng ký đối tác nhà nông</option>
                        <option value="other">Ý kiến đóng góp khác</option>
                      </select>
                    </div>

                  </div>

                  {/* Input: Message */}
                  <div className="space-y-1.5">
                    <label className="block text-[10px] text-gray-400 font-black uppercase tracking-wider">Nội Dung Yêu Cầu *</label>
                    <textarea 
                      required
                      rows={5}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Mô tả chi tiết thắc mắc hoặc yêu cầu của bạn..."
                      className="w-full bg-white border border-gray-300 rounded-xl py-2.5 px-4 font-semibold focus:outline-none focus:border-[#13a855] focus:ring-1 focus:ring-[#13a855] transition-all resize-none leading-relaxed"
                    />
                  </div>

                  {/* Privacy / Security Float */}
                  <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-bold">
                    <ShieldCheck className="w-4 h-4 text-[#13a855]" />
                    <span>Dữ liệu của bạn được mã hóa an toàn và tuyệt đối bảo mật.</span>
                  </div>

                  {/* Submit Button */}
                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 bg-[#13a855] hover:bg-[#0f8b44] disabled:bg-gray-300 text-white text-xs sm:text-sm font-black rounded-xl shadow-md transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
                        <span>Đang xử lý gửi...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Gửi Yêu Cầu Hỗ Trợ</span>
                      </>
                    )}
                  </button>

                </form>
              )}
            </div>

            {/* Beautiful Interactive FAQs List */}
            <div className="bg-white border border-gray-200/80 rounded-3xl p-6 sm:p-8 shadow-sm">
              <div className="mb-6 flex gap-2 items-center">
                <HelpCircle className="w-5 h-5 text-[#13a855]" />
                <h3 className="text-lg font-black text-gray-900">Câu Hỏi Thường Gặp (FAQs)</h3>
              </div>

              <div className="space-y-4">
                {faqs.map((faq, idx) => {
                  const isOpen = openFAQ === idx;
                  return (
                    <div 
                      key={idx}
                      className="border border-gray-150 rounded-2xl overflow-hidden transition-all duration-300 bg-[#fbfdfc]"
                    >
                      <button 
                        onClick={() => setOpenFAQ(isOpen ? null : idx)}
                        className="w-full px-5 py-4 flex items-center justify-between text-left font-black text-xs sm:text-sm text-gray-800 hover:text-[#13a855] cursor-pointer transition-colors bg-white select-none"
                      >
                        <span className="max-w-[90%] leading-snug">{faq.question}</span>
                        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${isOpen ? "rotate-180 text-[#13a855]" : ""}`} />
                      </button>
                      
                      <div 
                        className={`transition-all duration-350 ease-in-out overflow-hidden ${
                          isOpen ? "max-h-48 border-t border-gray-150" : "max-h-0"
                        }`}
                      >
                        <p className="p-5 text-xs text-gray-500 font-medium leading-relaxed bg-[#fbfdfc]">
                          {faq.answer}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

        </div>
      </div>

    </div>
  );
}
