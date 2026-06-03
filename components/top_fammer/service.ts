interface Farmer {
    id: number;
    name: string;
    avatar: string;
    coverImage: string;
    location: string;
    specialty: string;
    experience: string;
    landArea: string;
    rating: number;
    badge: string;
    likes: number;
}

const topFarmers: Farmer[] = [
    {
        id: 1,
        name: "Chú Sáu Đà Lạt",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop",
        coverImage: "https://images.unsplash.com/photo-1500937386664-56d159062255?q=80&w=600&auto=format&fit=crop",
        location: "Trại Mát, Đà Lạt, Lâm Đồng",
        specialty: "Dâu tây Mỹ đá, Hoa quả hữu cơ, Cà chua bi",
        experience: "15 năm kinh nghiệm",
        landArea: "2.8 Hécta",
        rating: 4.9,
        badge: "Đạt Chuẩn VietGAP",
        likes: 342
    },
    {
        id: 2,
        name: "Anh Hai Bến Tre",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=150&auto=format&fit=crop",
        coverImage: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=600&auto=format&fit=crop",
        location: "Chợ Lách, Bến Tre",
        specialty: "Sầu riêng Ri6, Măng cụt, Chôm chôm thái",
        experience: "10 năm kinh nghiệm",
        landArea: "3.5 Hécta",
        rating: 4.8,
        badge: "Đối tác Tiêu Biểu PIONE",
        likes: 298
    },
    {
        id: 3,
        name: "Cô Út Cần Thơ",
        avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=150&auto=format&fit=crop",
        coverImage: "https://images.unsplash.com/photo-1628157582853-a796fa650a6a?q=80&w=600&auto=format&fit=crop",
        location: "Phong Điền, Cần Thơ",
        specialty: "Vú sữa Lò Rèn, Nhãn xuồng cơm vàng",
        experience: "12 năm kinh nghiệm",
        landArea: "2.0 Hécta",
        rating: 4.9,
        badge: "Chuẩn GlobalGAP",
        likes: 412
    }
];
