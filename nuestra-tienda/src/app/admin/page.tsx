import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import AdminDashboard from "@/components/AdminDashboard";
import type { Product, Category, Settings } from "@/types/database";

export default async function AdminPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const [{ data: products }, { data: categories }, { data: settingsData }] =
    await Promise.all([
      supabase
        .from("products")
        .select("*, categories(*)")
        .order("created_at", { ascending: false }),
      supabase.from("categories").select("*").order("name"),
      supabase.from("settings").select("*").limit(1).single(),
    ]);

  const settings: Settings = settingsData || {
    id: "",
    brand_name: "Nuestra Tienda",
    whatsapp_number: "5493468542942",
    created_at: "",
    updated_at: "",
  };

  return (
    <AdminDashboard
      initialProducts={(products || []) as Product[]}
      categories={(categories || []) as Category[]}
      settings={settings}
      userEmail={user.email || ""}
    />
  );
}
