"use client";
import { usePathname } from "next/navigation";
import Footer from "./Footer";

export default function FooterWrapper() {
  const pathname = usePathname();
  const noFooterRoutes = ["/login", "/signup", "/SessionLogin", "/SessionSignup"];
  const showFooter = !noFooterRoutes.includes(pathname);

  return showFooter ? <Footer /> : null;
}
