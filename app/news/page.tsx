"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import {
  Calendar, Clock, User, ArrowRight, Search, Sparkles,
  TrendingUp, Award, BookOpen, Flame, Newspaper, Mail, CheckCircle
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

export default function NewsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [emailSubscribed, setEmailSubscribed] = useState<boolean>(false);
  const [newsletterEmail, setNewsletterEmail] = useState<string>("");
  
  const [news, setNews] = useState<NewsPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch news on load - exactly like products
  useEffect(() => {
    const fetchNews = async () => {
      try {
        const res = await newsAPI();
        const data = Array.isArray(res.data) ? res.data : [];
        setNews(data);
        console.log("Danh sách tin tức:", data);
      } catch (error) {
        console.error("Error fetching news:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchNews();
  }, []);

  // Lọc bài viết dựa trên danh mục và từ khóa tìm kiếm
  const filteredPosts = useMemo(() => {
    return news.filter((post) => {
      const matchesCategory = selectedCategory === "all" || post.category === selectedCategory;
      const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery, news]);

  const featuredPost = useMemo(() => {
    return news.find(p => p.featured) || news[0];
  }, [news]);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail.trim()) {
      setEmailSubscribed(true);
      setNewsletterEmail("");
      setTimeout(() => setEmailSubscribed(false), 4000);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8faf9] font-sans selection:bg-[#13a855]/20 selection:text-[#13a855]">

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Page Title & Sparkle Info */}
        <div className="mb-10 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#e8f8f0] text-[#13a855] text-xs font-black rounded-full mb-3.5 border border-[#d4f2e1]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Kênh Cập Nhật Tri Thức Nông Nghiệp</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight leading-tight">
            Tin Tức & Kinh Nghiệm Canh Tác
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 font-semibold mt-1.5 max-w-2xl">
            Cập nhật xu hướng thị trường, công nghệ canh tác thông minh mới nhất và chia sẻ bí quyết làm giàu từ những nông gia thành công hàng đầu Việt Nam.
          </p>
        </div>

        {/* Featured Big Post Hero */}
        {featuredPost && (
          <div className="mb-14 overflow-hidden rounded-3xl bg-white border border-gray-150 shadow-md hover:shadow-xl transition-all duration-300 group">
            <div className="grid grid-cols-1 lg:grid-cols-12">
              {/* Image side with zoom hover and absolute glowing tag */}
              <div className="lg:col-span-7 h-64 sm:h-96 relative overflow-hidden">
                <img
                  src={featuredPost.imageUrl}
                  alt={featuredPost.title}
                  className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
                <div className="absolute top-4 left-4 flex gap-2">
                  <span className="flex items-center gap-1.5 px-3 py-1.5 bg-[#13a855] text-white text-[10px] font-black rounded-full shadow-md uppercase tracking-wider">
                    <Flame className="w-3 h-3 fill-current" />
                    <span>Nổi Bật</span>
                  </span>
                  <span className={`px-3 py-1.5 rounded-full border backdrop-blur-md text-[10px] font-black uppercase tracking-wider bg-white/90 text-gray-800 border-white/60`}>
                    {featuredPost.categoryLabel}
                  </span>
                </div>
              </div>

              {/* Text detail side */}
              <div className="lg:col-span-5 p-6 sm:p-8 lg:p-10 flex flex-col justify-between bg-gradient-to-br from-white via-white to-emerald-50/15">
                <div className="space-y-4">
                  {/* Meta stats */}
                  <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-gray-400">
                    <span className="flex items-center gap-1">
                      <User className="w-4 h-4 text-gray-400" />
                      {featuredPost.author}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      {new Date(featuredPost.date).toLocaleDateString("vi-VN", {
                        year: "numeric", month: "long", day: "numeric"
                      })}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4 text-gray-400" />
                      {featuredPost.readTime}
                    </span>
                  </div>

                  {/* Title and Excerpt */}
                  <h3 className="text-xl sm:text-2xl font-black text-gray-900 leading-snug group-hover:text-[#13a855] transition-colors line-clamp-3">
                    <Link href={`/news/${featuredPost.id}`}>
                      {featuredPost.title}
                    </Link>
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-500 font-medium leading-relaxed line-clamp-4">
                    {featuredPost.excerpt}
                  </p>
                </div>

                <div className="pt-6 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-[11px] font-black text-emerald-600 tracking-wide">
                    {featuredPost.views} lượt xem
                  </span>
                  <Link
                    href={`/news/${featuredPost.id}`}
                    className="inline-flex items-center gap-1.5 text-xs font-black text-[#13a855] hover:text-[#0c7038] group/btn transition-colors cursor-pointer"
                  >
                    <span>Đọc bài viết</span>
                    <ArrowRight className="w-4 h-4 transform group-hover/btn:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filter and Search Layout Grid */}
        <div className="flex flex-col lg:flex-row gap-8 items-start mb-10">
          {/* Left: Category Badges Slider */}
          <div className="flex flex-wrap gap-2 w-full lg:flex-1">
            {[
              { id: "all", label: "Tất Cả Tin Tức", icon: Newspaper },
              { id: "technology", label: "Công Nghệ Số", icon: Sparkles },
              { id: "market", label: "Giá Thị Trường", icon: TrendingUp },
              { id: "technique", label: "Kỹ Thuật Canh Tác", icon: BookOpen },
              { id: "story", label: "Gương Nhà Nông", icon: Award },
            ].map((cat) => {
              const Icon = cat.icon;
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex items-center gap-2 px-4.5 py-2.5 rounded-full text-xs font-black border transition-all cursor-pointer ${isActive
                    ? "bg-[#13a855] text-white border-[#13a855] shadow-md scale-102"
                    : "bg-white text-gray-550 border-gray-200 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Right: Modern Search Input */}
          <div className="relative w-full lg:w-80 flex-shrink-0">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm bài viết..."
              className="w-full bg-white border border-gray-300 rounded-full py-2.5 pl-5 pr-10 text-xs sm:text-sm font-semibold focus:outline-none focus:border-[#13a855] focus:ring-1 focus:ring-[#13a855] transition-all"
            />
            <Search className="absolute right-4.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
          </div>
        </div>

        {/* Dynamic Card List Container */}
        {filteredPosts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {filteredPosts.map((post) => (
              <article
                key={post.id}
                className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between group"
              >
                {/* Image wrap with nice overlay */}
                <Link href={`/news/${post.id}`} className="block h-48 relative overflow-hidden bg-gray-100 flex-shrink-0">
                  <img
                    src={post.imageUrl}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-104 transition-transform duration-500 ease-out"
                  />
                  <div className="absolute top-3 left-3">
                    <span className={`px-2.5 py-1 text-[10px] font-extrabold uppercase border rounded-md shadow-sm backdrop-blur-md ${post.categoryColor}`}>
                      {post.categoryLabel}
                    </span>
                  </div>
                </Link>

                {/* Body Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2.5">
                    {/* Meta information */}
                    <div className="flex items-center gap-3 text-[10px] font-extrabold text-gray-400 uppercase tracking-wide">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(post.date).toLocaleDateString("vi-VN")}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {post.readTime}
                      </span>
                    </div>

                    {/* Title */}
                    <h4 className="text-sm sm:text-base font-black text-gray-900 leading-snug group-hover:text-[#13a855] transition-colors line-clamp-2">
                      <Link href={`/news/${post.id}`}>
                        {post.title}
                      </Link>
                    </h4>

                    {/* Excerpt */}
                    <p className="text-xs text-gray-500 font-medium leading-relaxed line-clamp-3">
                      {post.excerpt}
                    </p>
                  </div>

                  {/* Card bottom separator */}
                  <div className="pt-4 border-t border-gray-100 flex items-center justify-between mt-auto">
                    <span className="text-[10px] font-extrabold text-gray-400">
                      Tác giả: {post.author.split(" ").slice(-2).join(" ")}
                    </span>
                    <Link
                      href={`/news/${post.id}`}
                      className="inline-flex items-center gap-1 text-xs font-black text-[#13a855] hover:text-[#0b7339] group/link transition-colors cursor-pointer"
                    >
                      <span>Xem tiếp</span>
                      <ArrowRight className="w-3.5 h-3.5 transform group-hover/link:translate-x-0.5 transition-transform" />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white border border-gray-200 rounded-3xl max-w-xl mx-auto shadow-sm mb-16">
            <Newspaper className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h4 className="text-base font-black text-gray-800">Không tìm thấy bài viết nào!</h4>
            <p className="text-xs text-gray-400 font-semibold mt-1">
              Hãy thử thay đổi từ khóa hoặc bộ lọc danh mục của bạn.
            </p>
          </div>
        )}

        {/* Premium Elegant Newsletter Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-[#0c5c37] to-[#1bb55e] text-white rounded-3xl p-8 sm:p-12 shadow-xl">
          {/* Subtle decoration elements */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-2xl"></div>
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/5 rounded-full blur-2xl"></div>

          <div className="relative max-w-3xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center justify-center p-3 bg-white/10 backdrop-blur-md rounded-full shadow-lg">
              <Mail className="w-6 h-6 text-white" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl sm:text-2xl font-black tracking-tight">Đăng Ký Nhận Bản Tin Nhà Nông</h3>
              <p className="text-xs sm:text-sm text-emerald-100 font-medium max-w-md mx-auto leading-relaxed">
                Đăng ký ngay để nhận miễn phí các kỹ thuật nông nghiệp hữu cơ mới nhất và thông báo biến động thị trường hàng tuần trực tiếp qua Email.
              </p>
            </div>

            {/* Subscribe Form */}
            {emailSubscribed ? (
              <div className="inline-flex items-center gap-2 bg-white/15 border border-white/20 backdrop-blur-md px-6 py-3 rounded-full text-xs sm:text-sm font-extrabold animate-fade-in shadow-inner">
                <CheckCircle className="w-5 h-5 text-emerald-300" />
                <span>Chúc mừng! Bạn đã đăng ký thành công bản tin chuyên ngành.</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <input
                  type="email"
                  required
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="Địa chỉ Email của bạn..."
                  className="flex-1 bg-white/10 focus:bg-white text-white focus:text-gray-900 border border-white/20 focus:border-transparent rounded-full px-5 py-3 text-xs sm:text-sm font-semibold placeholder-emerald-100/70 focus:outline-none transition-all"
                />
                <button
                  type="submit"
                  className="bg-white hover:bg-emerald-50 text-[#0c5c37] text-xs sm:text-sm font-black rounded-full px-6 py-3 shadow-md active:scale-97 cursor-pointer transition-all hover:shadow-lg"
                >
                  Đăng ký ngay
                </button>
              </form>
            )}
          </div>
        </section>

      </main>
    </div>
  );
}
