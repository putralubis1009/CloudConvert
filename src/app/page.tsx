import { Navbar } from "@/components/layout/Navbar";
import { Hero } from "@/components/sections/Hero";
import { ConvertSection } from "@/components/sections/ConvertSection";
import { Features } from "@/components/sections/Features";
import { Cta } from "@/components/sections/Cta";
import { Faq } from "@/components/sections/Faq";
import { Footer } from "@/components/layout/Footer";
import { BackToTop } from "@/components/ui/BackToTop";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="flex-grow">
        <Hero />
        <ConvertSection />
        <Features />
        <Cta />
        <Faq />
      </main>
      <Footer />
      <BackToTop />
    </>
  );
}
