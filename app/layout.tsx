"use client";

import { ClerkProvider, useUser } from "@clerk/nextjs";
import Navbar from "@/components/Navbar";
import "@/app/globals.css"; // ✅ Import Tailwind global styles

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className="bg-gray-50 text-gray-900 flex h-screen overflow-hidden">
          {/* 🏠 Sidebar */}
          <Navbar />

          {/* 📌 Main Content */}
          <div className="flex-1 flex flex-col ml-64 lg:ml-64 md:ml-60 sm:ml-0 transition-all">
            <main className="p-6 overflow-auto flex-1">{children}</main>
          </div>
        </body>
      </html>
    </ClerkProvider>
  );
}
