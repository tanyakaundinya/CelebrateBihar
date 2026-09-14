import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-heading",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: "Celebrate Bihar | Aap Requirement Batayein, Arrangement Hum Sambhalenge",
  description:
    "Bihar's premier on-demand home and enterprise service marketplace. Doorstep appliance repairs and turnkey institution setups in Patna, Gaya, Muzaffarpur, Bhagalpur, and across all 38 Bihar districts.",
  keywords: [
    "Celebrate Bihar",
    "Bihar Service Marketplace",
    "Home Services Patna",
    "AC Repair Bihar",
    "Office Setup Patna",
    "Institution Setup Bihar",
    "Appliance Repair Bihar",
    "Corporate Services Bihar"
  ],
  authors: [{ name: "Celebrate Bihar Team" }],
  openGraph: {
    title: "Celebrate Bihar | Aap Requirement Batayein, Arrangement Hum Sambhalenge",
    description: "Premium on-demand home & office services across Bihar.",
    type: "website",
    locale: "en_IN",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var saved = localStorage.getItem('celebrate-bihar-theme');
                  var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  if (saved === 'dark' || (!saved && prefersDark)) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className={`${plusJakartaSans.variable} ${inter.variable} font-sans min-h-screen flex flex-col antialiased bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 transition-colors duration-200`}>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
