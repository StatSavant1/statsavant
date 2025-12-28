import "./globals.css";
import { AuthProvider } from "@/components/AuthProvider";
import Navbar from "@/components/Navbar"; // 👈 ADD THIS

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
      <body className="bg-black text-white">
        <AuthProvider>
          <Navbar />        {/* 👈 MENU IS BACK */}
          <main>{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}











