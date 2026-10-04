import { useEffect } from "react";
import { ArticleModal, InquiryModal, Lightbox, TourModal } from "./modals";
import { Faq, FinalCta, Footer, Guide, Reviews } from "./sections-bottom";
import { DroneFeature, Gallery, Tours } from "./sections-mid";
import { BottomBar, Comparison, Header, Hero } from "./sections-top";
import { loadStoredLang, useSI } from "./store";

export function SecretIslandsPage() {
  const lang = useSI((s) => s.lang);
  const setLang = useSI((s) => s.setLang);

  useEffect(() => {
    const stored = loadStoredLang();
    if (stored !== useSI.getState().lang) setLang(stored);
  }, [setLang]);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  return (
    <div className="min-h-dvh bg-si-white font-jakarta text-si-navy antialiased [scroll-behavior:smooth]">
      <Header />
      <main>
        <Hero />
        <Comparison />
        <Tours />
        <DroneFeature />
        <Gallery />
        <Guide />
        <Reviews />
        <Faq />
        <FinalCta />
      </main>
      <Footer />
      <BottomBar />
      <InquiryModal />
      <TourModal />
      <ArticleModal />
      <Lightbox />
    </div>
  );
}
