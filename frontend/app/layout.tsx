import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PolyYield ⚡ | AI-Powered Cross-Parachain Yield",
  description: "Automatically route your stablecoins to the highest-yielding strategy across multiple yield venues. Powered by Gemini AI.",
  applicationName: "PolyYield",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-gray-950 text-white`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
