import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ScrollProgress } from "@/components/motion/ScrollProgress";

/**
 * Layout condiviso delle pagine pubbliche: header e footer restano fissi
 * durante la navigazione, così non "ricaricano". Solo il contenuto (children)
 * viene animato dal template a ogni cambio pagina.
 */
export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <ScrollProgress />
      <SiteHeader />
      {children}
      <SiteFooter />
    </>
  );
}
