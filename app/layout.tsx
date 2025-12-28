import "./globals.css";
import { AuthProvider } from "@/components/AuthProvider";

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
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}










