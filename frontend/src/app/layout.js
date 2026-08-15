import Navbar from "@/components/navbar/Navbar";
import "./globals.css";
import { Inter } from "next/font/google";
import { ThemeContextProvider } from "@/context/ThemeContext";
import ThemeProvider from "@/providers/ThemeProvider";
import AuthProvider from "@/providers/AuthProvider";
import PageTransition from "@/components/animation/PageTransition";
import AppShell from "@/components/appShell/AppShell";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "BotBlogs - Community Blog & Articles",
  description: "Discover stories, tech articles, and community discussions on BotBlogs.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <ThemeContextProvider>
            <ThemeProvider>
              <AppShell>
                <Navbar />
                <PageTransition>{children}</PageTransition>
              </AppShell>
            </ThemeProvider>
          </ThemeContextProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
