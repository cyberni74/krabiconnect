import { useEffect } from "react";
import { BookingModal } from "./booking";
import { AuroraBackground, ScrollProgress } from "./fx";
import { ArticleModal, Lightbox, TourModal } from "./modals";
import { Faq, FinalCta, Footer, Guide, Reviews } from "./sections-bottom";
import { DroneFeature, Gallery, Tours } from "./sections-mid";
import { BottomBar, Comparison, Header, Hero } from "./sections-top";
import { LANGS } from "./content";
import { detectLang, useSI } from "./store";

export function SecretIslandsPage() {
  const lang = useSI((s) => s.lang);

  useEffect(() => {
    const detected = detectLang();
    if (detected !== useSI.getState().lang) useSI.setState({ lang: detected });
  }, []);

  useEffect(() => {
    document.documentElement.lang = LANGS.find((l) => l.id === lang)?.html ?? lang;
  }, [lang]);

  return (
    <div className="relative isolate min-h-dvh overflow-x-clip font-jakarta text-white antialiased [scroll-behavior:smooth]">
      <AuroraBackground />
      <ScrollProgress />
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
      <BookingModal />
      <TourModal />
      <ArticleModal />
      <Lightbox />
    </div>
  );
}
