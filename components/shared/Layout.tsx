import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-dl-bg text-dl-fg">
      <Navbar />
      <main>{children}</main>
      <Footer />
    </div>
  );
}
