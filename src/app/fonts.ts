import { Inter } from "next/font/google";
import localFont from "next/font/local";

export const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const bebasNeue = localFont({
  src: [
    {
      path: "../../public/fonts/bebas-neue/BebasNeue-Bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-heading",
  display: "swap",
});
