import type { Metadata } from "next";
import { Source_Sans_3, Source_Serif_4 } from "next/font/google";
import { getSiteUrl } from "@/lib/site";
import "./globals.css";

const sourceSans = Source_Sans_3({
  variable: "--font-source-sans",
  subsets: ["latin"],
});

const sourceSerif = Source_Serif_4({
  variable: "--font-source-serif",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: "ContiHub | Continental Construction of Ohio",
    template: "%s | ContiHub",
  },
  description:
    "ContiHub is the operations portal for Continental Construction of Ohio — The Conti Way, on contihub.app.",
  applicationName: "ContiHub",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${sourceSans.variable} ${sourceSerif.variable} antialiased font-sans`}>
        {children}
      </body>
    </html>
  );
}
