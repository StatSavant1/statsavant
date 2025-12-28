import "./globals.css";
import { AuthProvider } from "@/components/AuthProvider";
import Navbar from "@/components/Navbar";

export const metadata = {
  title: "StatSavant",
  description: "Smarter Player Prop Research",
};

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
          {/* 👇 offset for fixed navbar */}
          <main className="pt-20">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}














