"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Calendar, Clock, User, ArrowLeft, Share2, Eye,
  BookOpen, Sparkles, MessageSquare, Heart, Bookmark, AlertCircle
} from "lucide-react";
import { newsAPI } from "@/lib/_api/news";

interface NewsPost {
  id: string;
  title: string;
  excerpt: string;
  category: "technology" | "market" | "technique" | "story";
  categoryLabel: string;
  categoryColor: string;
  author: string;
  date: string;
  readTime: string;
  imageUrl: string;
  featured?: boolean;
  views: number;
}

export default function NewsDetailClient({ id }: { id: string }) {
  const router = useRouter();

  const [post, setPost] = useState<NewsPost | null>(null);
  const [allNews, setAllNews] = useState<NewsPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchPostDetail = async () => {
      try {
        const res = await newsAPI();
        const data = Array.isArray(res.data) ? res.data : [];
        setAllNews(data);
        const found = data.find((item: NewsPost) => item.id === id);
        if (found) {
          setPost(found);
        } else {
          console.error("Không tìm thấy tin tức");
        }
      } catch (error) {
        console.error("Error fetching news detail:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPostDetail();
  }, [id]);

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      alert("Đã sao chép liên kết bài viết tin tức!");
    }
  };

  // Lọc lấy 3 tin tức liên quan khác bài hiện tại
  const otherNews = allNews.filter(item => item.id !== id).slice(0, 4);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f8faf9] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-t-transparent border-[#13a855] rounded-full animate-spin"></div>
          <span className="text-xs font-bold text-gray-500">Đang tải tin tức...</span>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-[#f8faf9] flex items-center justify-center p-4">
        <div className="bg-white border border-gray-200 p-8 rounded-3xl text-center max-w-sm w-full shadow-sm">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <h3 className="text-lg font-black text-gray-900">Không tìm thấy bài viết</h3>
          <p className="text-xs text-gray-500 font-semibold mt-1 mb-5">
            Bài viết này không tồn tại hoặc đã bị gỡ bỏ khỏi hệ thống.
          </p>
          <button 
            onClick={() => router.push("/news")}
            className="w-full py-3 bg-[#13a855] hover:bg-[#0f8b44] text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-md"
          >
            Quay lại danh mục tin tức
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8faf9] font-sans selection:bg-[#13a855]/20 selection:text-[#13a855] pb-12">
      
      {/* Sleeker Cover Hero (Saves massive page space vertically) */}
      <div className="relative h-44 sm:h-64 w-full overflow-hidden bg-gray-900">
        <img 
          src={post.imageUrl} 
          alt={post.title} 
          className="w-full h-full object-cover opacity-75"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#f8faf9] via-black/50 to-black/30"></div>
        
        {/* Navigation Floating bar */}
        <div className="absolute top-4 left-0 right-0 z-10">
          <div className="max-w-6xl mx-auto px-4 flex items-center justify-between">
            <button 
              onClick={() => router.push("/news")}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white/95 backdrop-blur-md text-gray-700 hover:text-[#13a855] text-[11px] font-bold rounded-full shadow-sm active:scale-95 transition-all cursor-pointer border border-gray-100"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Quay lại tin tức</span>
            </button>
            
            <button 
              onClick={handleShare}
              className="p-1.5 bg-white/95 backdrop-blur-md text-gray-700 hover:text-[#13a855] rounded-full shadow-sm active:scale-95 transition-all cursor-pointer border border-gray-100"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Bottom Banner inside the cover */}
        <div className="absolute bottom-4 left-0 right-0">
          <div className="max-w-6xl mx-auto px-4">
            <span className="inline-block px-2.5 py-0.5 bg-[#13a855] text-white text-[9px] font-black uppercase rounded shadow-sm mb-1.5">
              {post.categoryLabel}
            </span>
            <h1 className="text-base sm:text-2xl font-black text-white leading-tight drop-shadow-md max-w-4xl">
              {post.title}
            </h1>
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout (Highly optimized for screen area utilization) */}
      <div className="max-w-6xl mx-auto px-4 mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: Article Body (8 columns) */}
          <div className="lg:col-span-8 bg-white border border-gray-250/60 rounded-2xl p-5 sm:p-6 shadow-sm space-y-6">
            
            {/* Metadata Row */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-gray-100">
              <div className="flex flex-wrap items-center gap-3 text-[11px] font-bold text-gray-400">
                <span className="flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-[#13a855]" />
                  {post.author}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {new Date(post.date).toLocaleDateString("vi-VN")}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {post.readTime}
                </span>
              </div>
              
              <span className="flex items-center gap-1 text-[11px] font-black text-emerald-600">
                <Eye className="w-3.5 h-3.5" />
                {post.views + 25} lượt đọc
              </span>
            </div>

            {/* Excerpt Lead */}
            <blockquote className="border-l-4 border-[#13a855] pl-3 py-0.5 text-gray-700 font-extrabold text-xs sm:text-sm leading-relaxed">
              {post.excerpt}
            </blockquote>

            {/* Core Body Rich Text */}
            <div className="space-y-4 text-xs sm:text-sm text-gray-650 leading-relaxed font-medium">
              <p>
                Theo báo cáo phân tích thực nghiệm và các chuyên gia nông nghiệp hàng đầu trong khu vực, việc chuyển đổi từ phương thức sản xuất truyền thống sang canh tác ứng dụng công nghệ khoa học bài bản đang đem lại hiệu quả bền vững vượt trội cho bà con nông dân.
              </p>
              <p>
                Đây không đơn thuần chỉ là việc thay thế phân bón hóa học bằng phân hữu cơ sinh học, mà còn bao gồm cả sự tối ưu hóa kỹ năng quản lý nông vụ, cải thiện chất lượng đất và nguồn nước lâu dài.
              </p>
              
              <h3 className="font-black text-[#13a855] text-xs sm:text-sm pt-2 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                <span>1. Định Hướng Quy Trình Canh Tác Chuẩn Hóa</span>
              </h3>
              <p>
                Bước quan trọng nhất chính là theo dõi sát sao chu kỳ phát triển của cây trồng. Việc lưu trữ các số liệu vụ mùa, phân tích mẫu đất định kỳ và bổ sung hệ vi sinh có lợi giúp duy trì sức đề kháng tự nhiên của cây trước sâu bệnh.
              </p>
              <p>
                Ngoài ra, ứng dụng hệ thống cảm biến độ ẩm tưới nước tự động hay theo dõi dự báo thời tiết cục bộ giúp bà con chủ động lên phương án bảo vệ tốt nhất, hạn chế hao hụt và tiết kiệm đến 40% chi phí vận hành thường niên.
              </p>

              <h3 className="font-black text-[#13a855] text-xs sm:text-sm pt-2 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4" />
                <span>2. Nâng Cao Giá Trị Thương Hiệu Nông Sản</span>
              </h3>
              <p>
                Sản phẩm đạt chuẩn sạch phải đi kèm với tính minh bạch cao. Việc đăng ký tem nhãn truy xuất nguồn gốc QR code giúp sản phẩm dễ dàng tiếp cận người tiêu dùng tại các siêu thị lớn và đủ điều kiện xuất khẩu sang các thị trường quốc tế khó tính như Mỹ, EU, hay Nhật Bản.
              </p>
            </div>

            {/* Social Feedback & Share buttons */}
            <div className="pt-5 border-t border-gray-100 flex items-center justify-between flex-wrap gap-3">
              <div className="flex gap-2">
                <button 
                  onClick={() => setIsLiked(!isLiked)}
                  className={`flex items-center gap-1 px-3 py-1.5 border rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                    isLiked 
                      ? "bg-red-50 text-red-500 border-red-200" 
                      : "bg-white text-gray-500 hover:text-red-500 border-gray-250"
                  }`}
                >
                  <Heart className={`w-3.5 h-3.5 ${isLiked ? "fill-current" : ""}`} />
                  <span>{isLiked ? "Đã thích" : "Yêu thích"}</span>
                </button>

                <button 
                  onClick={() => setIsBookmarked(!isBookmarked)}
                  className={`flex items-center gap-1 px-3 py-1.5 border rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                    isBookmarked 
                      ? "bg-emerald-50 text-[#13a855] border-emerald-250" 
                      : "bg-white text-gray-500 hover:text-[#13a855] border-gray-250"
                  }`}
                >
                  <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? "fill-current" : ""}`} />
                  <span>{isBookmarked ? "Đã lưu" : "Lưu tin"}</span>
                </button>
              </div>

              <button 
                onClick={handleShare}
                className="flex items-center gap-1 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-700 text-[11px] font-bold rounded-full transition-all cursor-pointer border border-gray-200"
              >
                <Share2 className="w-3 h-3" />
                <span>Chia sẻ bài viết</span>
              </button>
            </div>

          </div>

          {/* Right Column: Sticky Related Sidebar (4 columns - Saves massive page length) */}
          <div className="lg:col-span-4 space-y-4 lg:sticky lg:top-4">
            <div className="bg-white border border-gray-250/60 rounded-2xl p-4 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <h3 className="text-xs sm:text-sm font-black text-gray-900 tracking-tight">Các Tin Tức Khác</h3>
                <Link href="/news" className="text-[10px] font-black text-[#13a855] hover:text-[#0b7038] transition-colors">
                  Xem tất cả
                </Link>
              </div>

              {otherNews.length > 0 ? (
                <div className="space-y-3.5">
                  {otherNews.map((item) => (
                    <Link 
                      key={item.id} 
                      href={`/news/${item.id}`}
                      className="flex gap-3 items-center group pb-3.5 border-b border-gray-50 last:border-0 last:pb-0"
                    >
                      <div className="w-16 h-12 rounded-lg overflow-hidden bg-gray-100 relative flex-shrink-0">
                        <img 
                          src={item.imageUrl} 
                          alt={item.title} 
                          className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                        />
                      </div>
                      <div className="space-y-1 min-w-0 flex-1">
                        <h4 className="text-[11px] sm:text-xs font-black text-gray-900 leading-snug group-hover:text-[#13a855] transition-colors line-clamp-2">
                          {item.title}
                        </h4>
                        <span className="block text-[9px] font-bold text-gray-400">
                          {new Date(item.date).toLocaleDateString("vi-VN")}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-[10px] text-gray-400 font-semibold text-center py-4">Không có tin tức liên quan nào.</p>
              )}
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
