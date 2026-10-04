import type { ReactNode } from "react";
import { BookingModal } from "./booking";
import { AuroraBackground, ScrollProgress } from "./fx";
import { ArticleModal, Lightbox, TourModal } from "./modals";
import { Faq, FinalCta, Footer, Guide, LongtailFaq, Reviews } from "./sections-bottom";
import { DroneFeature, FishingSection, Gallery, Tours } from "./sections-mid";
import { BottomBar, Comparison, Header, Hero } from "./sections-top";
import { REVIEWS_VERIFIED, type Lang } from "./content";
import { LangBoundary, useHtmlLang } from "./lang";

/** `urlLang` = validated `?lang=` search param (undefined = German default URL). */
export function SecretIslandsPage({ urlLang }: { urlLang?: Lang }) {
  return (
    <LangBoundary urlLang={urlLang}>
      <PageBody />
    </LangBoundary>
  );
}

function PageBody(): ReactNode {
  useHtmlLang();

  return (
    <div className="relative isolate min-h-dvh overflow-x-clip font-jakarta text-white antialiased [scroll-behavior:smooth]">
      <AuroraBackground />
      <ScrollProgress />
      <Header />
      <main>
        <Hero />
        <Comparison />
        <Tours />
        <FishingSection />
        <DroneFeature />
        <Gallery />
        <Guide />
        {REVIEWS_VERIFIED ? <Reviews /> : null}
        <LongtailFaq />
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
