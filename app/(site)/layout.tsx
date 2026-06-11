import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ScrollProgress } from "@/components/motion/ScrollProgress";
import { SmoothScroll } from "@/components/motion/SmoothScroll";
import { LayoutTransition } from "@/components/motion/LayoutTransition";

/**
 * Layout condiviso delle pagine pubbliche: header e footer restano fissi
 * durante la navigazione. Il contenuto passa per LayoutTransition (uscita +
 * entrata animate) e lo scroll è ammorbidito da Lenis (SmoothScroll).
 */
export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SmoothScroll />
      <ScrollProgress />
      <SiteHeader />
      <LayoutTransition>{children}</LayoutTransition>
      <SiteFooter />
    </>
  );
}
