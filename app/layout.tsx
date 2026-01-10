import "./globals.css";
import { AuthProvider } from "@/components/AuthProvider";
import Navbar from "@/components/Navbar";
import { Analytics } from "@vercel/analytics/next";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-black text-white" key="layout-v3">
        <AuthProvider>
          <Navbar />
          {/* 👇 THIS is the ONLY place navbar spacing lives */}
          <main className="pt-24">{children}</main>
        </AuthProvider>

        {/* ✅ Vercel Analytics */}
        <Analytics />
      </body>
    </html>
  );
}

















