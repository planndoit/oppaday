import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "오빠 오늘 무슨 날인지 몰라?",
  description:
    "공개 달력에 기념일을 올리고 함께 구경하는 기념일 기반 소셜 캘린더",
  openGraph: {
    title: "오빠 오늘 무슨 날인지 몰라?",
    description:
      "공개 달력에 기념일을 올리고 공유하는 기념일 기반 소셜 캘린더",
    type: "website",
    locale: "ko_KR",
    images: [
      {
        url: "/og-thumbnail.png",
        width: 1200,
        height: 630,
        alt: "오빠 오늘 무슨 날인지 몰라? 공유 썸네일",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "오빠 오늘 무슨 날인지 몰라?",
    description:
      "공개 달력에 기념일을 올리고 공유하는 기념일 기반 소셜 캘린더",
    images: ["/og-thumbnail.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <Header />
        <div className="flex-1">{children}</div>
      </body>
    </html>
  );
}
