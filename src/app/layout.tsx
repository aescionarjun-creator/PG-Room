import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Stayzy — Your space. Your schedule.",
  description:
    "Find a comfortable stay for an hour, a day, or a little longer. Flexible PG and private room booking with transparent pricing.",
  keywords: "PG booking, flexible stay, hourly room, monthly PG, coliving, Stayzy",
  authors: [{ name: "Stayzy Hospitality" }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${manrope.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans bg-[#F8F7F2] text-[#192621] selection:bg-[#E8F1D5] selection:text-[#123D2B]">
        {children}
      </body>
    </html>
  );
}
