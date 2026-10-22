import { createClient } from "@/lib/supabase/server";
import Catalog from "@/components/Catalog";
import type { Product, Settings } from "@/types/database";

export const revalidate = 30; // revalida cada 30 segundos

export default async function HomePage() {
  const supabase = await createClient();

  // Traer settings
  const { data: settingsData } = await supabase
    .from("settings")
    .select("*")
    .limit(1)
    .single();

  const settings: Settings = settingsData || {
    id: "",
    brand_name: "Nuestra Tienda",
    whatsapp_number: "5493468542942",
    created_at: "",
    updated_at: "",
  };

  // Traer productos disponibles
  const { data: productsData } = await supabase
    .from("products")
    .select("*, categories(*)")
    .eq("is_available", true)
    .order("created_at", { ascending: false });

  const products = (productsData || []) as Product[];

  return <Catalog products={products} settings={settings} />;
}
