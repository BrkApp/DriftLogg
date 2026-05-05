import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";
import { ScanForm } from "@/components/scan/scan-form";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Scan a repository — DriftLogg",
  description: "Run a free drift health check on any public GitHub repository.",
};

export default function ScanPage() {
  return (
    <>
      <Navbar />
      <main className="container flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center py-16">
        <div className="mx-auto w-full max-w-2xl space-y-8">
          <Button asChild variant="ghost" size="sm" className="-ml-2">
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back home
            </Link>
          </Button>
          <div className="space-y-3 text-center">
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
              Scan a GitHub repository
            </h1>
            <p className="text-muted-foreground">
              Paste any public repo and we will compute its DriftLogg health score in
              seconds.
            </p>
          </div>
          <ScanForm />
        </div>
      </main>
      <Footer />
    </>
  );
}
