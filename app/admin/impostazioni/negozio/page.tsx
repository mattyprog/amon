import Link from "next/link";
import { getShop, SHOP_FIELDS } from "@/lib/shop";
import { ensureSeeded } from "@/lib/seed";
import { ShopForm, type Field } from "./ShopForm";

export const metadata = { title: "Dati negozio" };

export default async function ShopSettings() {
  await ensureSeeded();
  const shop = await getShop();
  const fields: Field[] = SHOP_FIELDS.map((f) => ({
    key: f.key,
    label: f.label,
    value: shop[f.key],
  }));

  return (
    <main className="mx-auto max-w-3xl px-4 py-6">
      <Link
        href="/admin/impostazioni"
        className="text-sm text-muted underline-offset-4 hover:text-ink hover:underline"
      >
        ← Impostazioni
      </Link>
      <h1 className="mt-3 font-display text-3xl text-ink">Dati del negozio</h1>
      <p className="mt-1 text-sm text-muted">
        Compaiono sul sito (intestazione, footer, contatti).
      </p>
      <div className="mt-6">
        <ShopForm fields={fields} />
      </div>
    </main>
  );
}
