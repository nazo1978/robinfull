import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { CartProvider } from "@/shared/context/CartContext";
import { GiveawayProvider } from "@/shared/context/GiveawayContext";
import { PricingProvider } from "@/shared/context/PricingContext";
import { AuthProvider } from "@/shared/context/AuthContext";
import ThemeProviderWrapper from '@/components/ThemeProviderWrapper'

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Robinhoot - E-Commerce Platform",
  description: "Tesla tarzı minimal dizayna sahip yenilikçi e-ticaret platformu",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProviderWrapper>
          <AuthProvider>
            <CartProvider>
              <PricingProvider>
                <GiveawayProvider>
                  <Header />
                  <main className="min-h-screen">
                    {children}
                  </main>
                  <Footer />
                </GiveawayProvider>
              </PricingProvider>
            </CartProvider>
          </AuthProvider>
        </ThemeProviderWrapper>
      </body>
    </html>
  );
}
