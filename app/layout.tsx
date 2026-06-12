import type { Metadata } from "next";
import { Be_Vietnam_Pro } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import Header from "@/utils/header/header";
import Footer from "@/utils/footer/footer";
import Banner from "@/components/banner/banner";
import FloatingChatButton from "@/components/floating-chat-button/floating-chat-button";
import { cn } from "@/lib/utils";

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ["vietnamese", "latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-sans",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={beVietnamPro.variable} suppressHydrationWarning>
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Document</title>
      </head>
      <body className={beVietnamPro.className}>
        <Providers>
          <Header />
          {children}
          <Footer />
          <FloatingChatButton />
        </Providers>
      </body>
    </html>
  );
}
