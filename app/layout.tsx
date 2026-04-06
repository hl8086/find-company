import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "校招公司池",
  description: "展示在中国有校园招聘信号的公司，支持筛选、搜索和直达招聘页。"
};

type RootLayoutProps = {
  children: React.ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
