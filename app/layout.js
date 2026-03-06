import { Inter } from "next/font/google";
import { UserProvider } from "@/lib/contexts/UserContext";
import { Toaster } from "react-hot-toast";
import "./globals.css";
import I18nProvider from "@/components/I18nProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Civic Issue System",
  description: "A platform for managing and resolving civic issues",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <UserProvider>
          <I18nProvider>
            {children}
            <Toaster position="top-right" />
          </I18nProvider>
        </UserProvider>
      </body>
    </html>
  );
}
