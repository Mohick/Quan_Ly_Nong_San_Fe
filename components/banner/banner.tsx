"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { ChevronLeft, ChevronRight, Calendar, MapPin, ArrowRight, ChevronDown } from "lucide-react";

interface EventSlide {
  id: number;
  title: string;
  category: string;
  date: string;
  location: string;
  description: string;
  image: string;
  ctaText: string;
  ctaLink: string;
  accentColor: string;
}

const slidesData: EventSlide[] = [
  {
    id: 1,
    category: "SỰ KIỆN NỔI BẬT",
    title: "Hội Chợ Nông Nghiệp Công Nghệ Cao 2026",
    date: "15 - 18 Tháng 6, 2026",
    location: "Trung tâm Hội chợ Triển lãm SECC, TP. HCM",
    description: "Nơi quy tụ hơn 500 gian hàng nông sản sạch đạt tiêu chuẩn VietGAP, GlobalGAP.",
    image: "https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?q=80&w=1600&auto=format&fit=crop",
    ctaText: "Đăng ký ngay",
    ctaLink: "/su-kien/hoi-cho-2026",
    accentColor: "from-[#13a855] to-[#0f8b44]"
  },
  {
    id: 2,
    category: "KÝ KẾT HỢP TÁC",
    title: "Ra Mắt Liên Kết Nhà Vườn Công Nghệ Mới",
    date: "22 Tháng 6, 2026",
    location: "Hợp tác xã Nông nghiệp Xanh, Đà Lạt",
    description: "Ký kết bảo trợ đầu ra toàn diện và chuyển giao công nghệ QR Code truy xuất nguồn gốc.",
    image: "https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?q=80&w=1600&auto=format&fit=crop",
    ctaText: "Xem mô hình",
    ctaLink: "/tin-tuc/nha-vuon-moi",
    accentColor: "from-[#0ea5e9] to-[#0369a1]"
  },
  {
    id: 3,
    category: "CHƯƠNG TRÌNH KHUYẾN MÃI",
    title: "Ngày Hội Giao Thương Nông Sản Việt 2026",
    date: "30 Tháng 6, 2026",
    location: "Hệ thống phân phối PIONE toàn quốc",
    description: "Cơ hội trải nghiệm nông sản sạch với ưu đãi tới 30% và trực tiếp gặp gỡ nông dân.",
    image: "https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1600&auto=format&fit=crop",
    ctaText: "Nhận voucher",
    ctaLink: "/khuyen-mai",
    accentColor: "from-[#f97316] to-[#ea580c]"
  }
];

const Banner = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [progress, setProgress] = useState(0);
  const bannerRef = useRef<HTMLDivElement>(null);

  const nextSlide = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setProgress(0);
    setCurrentSlide((prev) => (prev === slidesData.length - 1 ? 0 : prev + 1));
    setTimeout(() => setIsTransitioning(false), 500);
  }, [isTransitioning]);

  const prevSlide = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setProgress(0);
    setCurrentSlide((prev) => (prev === 0 ? slidesData.length - 1 : prev - 1));
    setTimeout(() => setIsTransitioning(false), 500);
  };

  const scrollToNextSection = () => {
    if (bannerRef.current) {
      // Find the next element sibling or fallback to window height
      const nextElement = bannerRef.current.nextElementSibling;
      if (nextElement) {
        nextElement.scrollIntoView({ behavior: "smooth" });
      } else {
        window.scrollTo({
          top: window.innerHeight - 80,
          behavior: "smooth"
        });
      }
    }
  };

  // Wheel event handler to jump down on scroll down
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      // Check if user is scrolling down and is currently at the top of page
      if (window.scrollY < 10 && e.deltaY > 0) {
        e.preventDefault();
        scrollToNextSection();
      }
    };

    const element = bannerRef.current;
    if (element) {
      // Set passive to false so preventDefault works
      element.addEventListener("wheel", handleWheel, { passive: false });
    }
    return () => {
      if (element) {
        element.removeEventListener("wheel", handleWheel);
      }
    };
  }, []);

  // Autoplay functionality
  useEffect(() => {
    const duration = 5000; // 5 seconds per slide
    const intervalTime = 100;
    const step = (intervalTime / duration) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          nextSlide();
          return 0;
        }
        return prev + step;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [currentSlide, nextSlide]);

  return (
    <section
      ref={bannerRef}
      className="relative w-full overflow-hidden bg-gray-900 group h-[33vh] min-h-[220px] md:h-[calc(100vh-80px)] md:min-h-[550px] font-sans"
    >
      {/* Background Slides */}
      <div className="relative w-full h-full">
        {slidesData.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 w-full h-full transition-opacity duration-700 ease-in-out ${index === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0"
              }`}
          >
            {/* Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-gray-950/90 via-gray-900/65 to-transparent z-10" />
            <img
              src={slide.image}
              alt={slide.title}
              className={`w-full h-full object-cover transform transition-transform duration-[5000ms] ease-out ${index === currentSlide ? "scale-105" : "scale-100"
                }`}
            />

            {/* Slide Content */}
            <div className="absolute inset-0 z-20 flex items-center">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                {/* Mobile: Container with semi-transparent background for high contrast. Desktop: Default clear. */}
                <div className="max-w-3xl space-y-2 md:space-y-6 bg-gray-950/40 backdrop-blur-[2px] p-3 sm:p-4 rounded-xl md:bg-transparent md:backdrop-blur-none md:p-0 md:rounded-none">
                  {/* Category Badge */}
                  <span className="inline-block px-2 py-0.5 md:px-3.5 md:py-1 text-[9px] md:text-xs font-black uppercase tracking-wider text-gray-300 md:text-white rounded-full bg-white/10 backdrop-blur-md border border-white/20 shadow-sm">
                    {slide.category}
                  </span>

                  {/* Title */}
                  <h1 className="text-lg sm:text-3xl md:text-5xl lg:text-6xl font-black text-gray-100 md:text-white tracking-tight leading-[1.15] select-none">
                    {slide.title}
                  </h1>

                  {/* Description */}
                  <p className="text-[11px] sm:text-sm md:text-lg text-gray-400 md:text-gray-350 font-normal leading-relaxed max-w-2xl select-none line-clamp-2 md:line-clamp-none">
                    {slide.description}
                  </p>

                  {/* Details and CTA Row */}
                  <div className="flex flex-wrap items-center gap-2 md:gap-4 pt-0.5 md:pt-3">
                    <div className="flex items-center gap-1.5 md:gap-2 text-[9px] md:text-sm text-gray-400 md:text-gray-200 bg-white/5 backdrop-blur-sm border border-white/10 px-2 py-1 md:px-3 md:py-1.5 rounded-lg shadow-sm">
                      <Calendar className="w-3 h-3 md:w-4 md:h-4 text-[#10b981]" />
                      <span>{slide.date}</span>
                    </div>
                    <div className="flex items-center gap-1.5 md:gap-2 text-[9px] md:text-sm text-gray-400 md:text-gray-200 bg-white/5 backdrop-blur-sm border border-white/10 px-2 py-1 md:px-3 md:py-1.5 rounded-lg shadow-sm">
                      <MapPin className="w-3 h-3 md:w-4 md:h-4 text-[#10b981]" />
                      <span>{slide.location}</span>
                    </div>

                    <a
                      href={slide.ctaLink}
                      className={`inline-flex items-center gap-1.5 md:gap-2 px-3 py-1.5 md:px-5 md:py-2.5 text-[9px] md:text-sm text-white font-extrabold rounded-lg md:rounded-xl bg-gradient-to-r ${slide.accentColor} hover:shadow-lg hover:brightness-110 active:scale-95 transition-all duration-200`}
                    >
                      <span>{slide.ctaText}</span>
                      <ArrowRight className="w-3 h-3 md:w-4 md:h-4" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 z-30 p-2 md:p-3 rounded-full bg-white/10 hover:bg-white/25 border border-white/25 text-white backdrop-blur-md transition-all duration-200 active:scale-90 cursor-pointer hidden sm:block opacity-0 group-hover:opacity-100 shadow-md"
      >
        <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 md:right-6 top-1/2 -translate-y-1/2 z-30 p-2 md:p-3 rounded-full bg-white/10 hover:bg-white/25 border border-white/25 text-white backdrop-blur-md transition-all duration-200 active:scale-90 cursor-pointer hidden sm:block opacity-0 group-hover:opacity-100 shadow-md"
      >
        <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
      </button>

      {/* Slide Indicators & Scroll Down Indicator */}
      <div className="absolute bottom-4 md:bottom-6 left-0 right-0 z-30 flex flex-col items-center gap-2 md:gap-6">
        <div className="flex gap-2 md:gap-2.5">
          {slidesData.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                if (isTransitioning) return;
                setIsTransitioning(true);
                setProgress(0);
                setCurrentSlide(index);
                setTimeout(() => setIsTransitioning(false), 500);
              }}
              className={`h-2 md:h-2.5 rounded-full cursor-pointer transition-all duration-300 ${index === currentSlide ? "w-6 md:w-8 bg-[#10b981]" : "w-2 md:w-2.5 bg-white/40 hover:bg-white/60"
                }`}
            />
          ))}
        </div>

        {/* Scroll Down Hint (Only visible on desktop/md layout) */}
        <button
          onClick={scrollToNextSection}
          className="hidden md:flex flex-col items-center text-white/75 hover:text-white transition-colors duration-200 animate-bounce cursor-pointer group/scroll"
        >
          <span className="text-[10px] uppercase font-bold tracking-widest mb-1 opacity-80 group-hover/scroll:opacity-100 transition-opacity">
            Cuộn xuống
          </span>
          <ChevronDown className="w-5 h-5 text-[#10b981]" />
        </button>
      </div>

      {/* Bottom Autoplay Progress Bar */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-white/10 z-30">
        <div
          className="h-full bg-gradient-to-r from-[#10b981] to-emerald-500 transition-all duration-100 ease-linear"
          style={{ width: `${progress}%` }}
        />
      </div>
    </section>
  );
};

export default Banner;
