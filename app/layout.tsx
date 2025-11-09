import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Theme } from "@radix-ui/themes";
import { TRPCProvider } from "@/trpc/Provider";
import { Toaster } from "sonner";

import "./globals.css";
import "@radix-ui/themes/styles.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Vibecon",
  description: "AI-powered warm introductions for founder-led sales",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <TRPCProvider>
          <Theme
            appearance="light"
            grayColor="auto"
            radius="medium"
            scaling="100%"
          >
            {children}
            <Toaster position="top-right" richColors />
            {/* <div className="bg-[#FAF7F2] min-h-screen">
              <div className="w-full h-full flex">
                <nav className="h-screen fixed bg-[#111] left-0 top-0 w-24 flex flex-col items-center justify-center">
                  <Users className="text-white w-6 h-6" />
                  <Workflow className="text-white w-6 h-6" />
                </nav>
                <main className="flex-1 h-full ml-24"> {children}</main>
              </div>
            </div> */}
          </Theme>
        </TRPCProvider>
      </body>
    </html>
  );
}
