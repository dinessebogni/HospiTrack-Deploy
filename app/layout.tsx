import "./globals.css";
import FooterWrapper from "../components/FooterWrapper";
import { MyProvider } from "../context/MyContext";

export const metadata = {
  title: "Hospi Track",
  description: "With Tailwind CSS and Next.js",
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body className="bg-white text-black dark:bg-black dark:text-white">
        <MyProvider>
          <div className="min-h-screen flex flex-col">
            <main className="flex-grow">{children}</main>
            {/* Footer géré côté client */}
            <FooterWrapper />
          </div>
        </MyProvider>
      </body>
    </html>
  );
}
