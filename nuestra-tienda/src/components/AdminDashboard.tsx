"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import type { Product, Category, Settings } from "@/types/database";
import { formatPrice, AVAILABLE_SIZES } from "@/lib/utils";
import {
  Plus,
  LogOut,
  Pencil,
  Trash2,
  X,
  Check,
  Settings as SettingsIcon,
  Package,
} from "lucide-react";

type Props = {
  initialProducts: Product[];
  categories: Category[];
  settings: Settings;
  userEmail: string;
};

export default function AdminDashboard({
  initialProducts,
  categories: initialCategories,
  settings: initialSettings,
  userEmail,
}: Props) {
  const [products, setProducts] = useState(initialProducts);
  const [categories, setCategories] = useState(initialCategories);
  const [settings, setSettings] = useState(initialSettings);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const router = useRouter();
  const supabase = createClient();

  // Form state
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    image_url: "",
    category_id: "",
    sizes: [] as string[],
    is_available: true,
  });

  const resetForm = () => {
    setForm({
      name: "",
      description: "",
      price: "",
      image_url: "",
      category_id: categories[0]?.id || "",
      sizes: [],
      is_available: true,
    });
    setEditingProduct(null);
  };

  const openNew = () => {
    resetForm();
    setShowForm(true);
  };

  const openEdit = (p: Product) => {
    setForm({
      name: p.name,
      description: p.description || "",
      price: String(p.price),
      image_url: p.image_url || "",
      category_id: p.category_id || "",
      sizes: p.sizes || [],
      is_available: p.is_available,
    });
    setEditingProduct(p);
    setShowForm(true);
  };

  const toggleSize = (size: string) => {
    setForm((prev) => ({
      ...prev,
      sizes: prev.sizes.includes(size)
        ? prev.sizes.filter((s) => s !== size)
        : [...prev.sizes, size],
    }));
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.price) {
      setMessage("Nombre y precio son obligatorios");
      return;
    }

    setLoading(true);
    setMessage("");

    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      price: parseFloat(form.price.replace(",", ".")),
      image_url: form.image_url.trim() || null,
      category_id: form.category_id || null,
      sizes: form.sizes,
      is_available: form.is_available,
    };

    if (editingProduct) {
      const { data, error } = await supabase
        .from("products")
        .update(payload)
        .eq("id", editingProduct.id)
        .select("*, categories(*)")
        .single();

      if (error) {
        setMessage("Error al actualizar: " + error.message);
      } else {
        setProducts((prev) =>
          prev.map((p) => (p.id === editingProduct.id ? (data as Product) : p))
        );
        setShowForm(false);
        resetForm();
        setMessage("Prenda actualizada ✓");
      }
    } else {
      const { data, error } = await supabase
        .from("products")
        .insert(payload)
        .select("*, categories(*)")
        .single();

      if (error) {
        setMessage("Error al crear: " + error.message);
      } else {
        setProducts((prev) => [data as Product, ...prev]);
        setShowForm(false);
        resetForm();
        setMessage("Prenda creada ✓");
      }
    }

    setLoading(false);
    setTimeout(() => setMessage(""), 3000);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Seguro que querés borrar esta prenda?")) return;

    const { error } = await supabase.from("products").delete().eq("id", id);
    if (!error) {
      setProducts((prev) => prev.filter((p) => p.id !== id));
      setMessage("Prenda eliminada");
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  };

  const saveSettings = async () => {
    setLoading(true);
    const { error } = await supabase
      .from("settings")
      .update({
        brand_name: settings.brand_name,
        whatsapp_number: settings.whatsapp_number,
      })
      .eq("id", settings.id);

    if (!error) {
      setMessage("Configuración guardada ✓");
      setShowSettings(false);
    } else {
      setMessage("Error al guardar configuración");
    }
    setLoading(false);
    setTimeout(() => setMessage(""), 3000);
  };

  const addCategory = async () => {
    const name = prompt("Nombre de la nueva categoría:");
    if (!name?.trim()) return;

    const slug = name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");

    const { data, error } = await supabase
      .from("categories")
      .insert({ name: name.trim(), slug })
      .select()
      .single();

    if (!error && data) {
      setCategories((prev) => [...prev, data as Category]);
      setMessage("Categoría agregada ✓");
      setTimeout(() => setMessage(""), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header admin */}
      <header className="border-b border-border sticky top-0 bg-background/95 backdrop-blur z-20">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="font-semibold text-lg">Panel Privado</h1>
            <p className="text-xs text-muted">{userEmail}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSettings(true)}
              className="p-2 rounded-lg hover:bg-card text-muted hover:text-foreground"
              title="Configuración"
            >
              <SettingsIcon size={20} />
            </button>
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg hover:bg-card text-muted hover:text-foreground"
              title="Cerrar sesión"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6">
        {/* Mensaje */}
        {message && (
          <div className="mb-4 text-center text-sm text-accent fade-in">
            {message}
          </div>
        )}

        {/* Stats + botón nueva */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 text-muted">
            <Package size={18} />
            <span className="text-sm">
              {products.length} prenda{products.length !== 1 ? "s" : ""}
            </span>
          </div>
          <button
            onClick={openNew}
            className="flex items-center gap-2 bg-accent hover:bg-accent-soft text-black font-medium text-sm px-4 py-2.5 rounded-xl transition-colors"
          >
            <Plus size={18} />
            Nueva Prenda
          </button>
        </div>

        {/* Lista de productos */}
        <div className="space-y-3">
          {products.length === 0 ? (
            <div className="text-center py-16 text-muted">
              <p>Todavía no hay prendas.</p>
              <p className="text-sm mt-1">
                Tocá “+ Nueva Prenda” para empezar.
              </p>
            </div>
          ) : (
            products.map((p) => (
              <div
                key={p.id}
                className="flex gap-4 bg-card border border-border rounded-xl p-3 items-center"
              >
                <div className="w-16 h-20 rounded-lg overflow-hidden bg-black/40 shrink-0">
                  {p.image_url ? (
                    <img
                      src={p.image_url}
                      alt={p.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[10px] text-muted">
                      Sin foto
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-medium truncate">{p.name}</h3>
                  <p className="text-sm text-accent">{formatPrice(p.price)}</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {(p.sizes || []).map((s) => (
                      <span
                        key={s}
                        className="text-[10px] bg-border/60 px-1.5 py-0.5 rounded"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                  {!p.is_available && (
                    <span className="text-xs text-red-400">No disponible</span>
                  )}
                </div>

                <div className="flex gap-1 shrink-0">
                  <button
                    onClick={() => openEdit(p)}
                    className="p-2 rounded-lg hover:bg-border/50 text-muted hover:text-foreground"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(p.id)}
                    className="p-2 rounded-lg hover:bg-red-500/20 text-muted hover:text-red-400"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {/* Modal Form Nueva / Editar Prenda */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 p-4">
          <div className="bg-card w-full max-w-lg rounded-2xl border border-border max-h-[90vh] overflow-y-auto fade-in">
            <div className="sticky top-0 bg-card border-b border-border px-5 py-4 flex items-center justify-between">
              <h2 className="font-semibold">
                {editingProduct ? "Editar prenda" : "Nueva prenda"}
              </h2>
              <button
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
                className="p-1 rounded-lg hover:bg-border/50"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm text-muted mb-1">
                  Nombre *
                </label>
                <input
                  value={form.name}
                  onChange={(e) =>
                    setForm({ ...form, name: e.target.value })
                  }
                  className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm"
                  placeholder="Ej: Body de encaje negro"
                />
              </div>

              <div>
                <label className="block text-sm text-muted mb-1">
                  Descripción
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  rows={2}
                  className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm resize-none"
                  placeholder="Breve descripción..."
                />
              </div>

              <div>
                <label className="block text-sm text-muted mb-1">
                  Precio (ARS) *
                </label>
                <input
                  type="number"
                  value={form.price}
                  onChange={(e) =>
                    setForm({ ...form, price: e.target.value })
                  }
                  className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm"
                  placeholder="25000"
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm text-muted mb-1">
                  URL de la foto
                </label>
                <input
                  value={form.image_url}
                  onChange={(e) =>
                    setForm({ ...form, image_url: e.target.value })
                  }
                  className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm"
                  placeholder="https://..."
                />
                <p className="text-[11px] text-muted mt-1">
                  Por ahora pegá el link de la imagen (Imgur, Google Drive
                  público, etc.). Después sumamos subida directa.
                </p>
              </div>

              <div>
                <label className="block text-sm text-muted mb-1">
                  Categoría
                </label>
                <div className="flex gap-2">
                  <select
                    value={form.category_id}
                    onChange={(e) =>
                      setForm({ ...form, category_id: e.target.value })
                    }
                    className="flex-1 bg-background border border-border rounded-xl px-4 py-2.5 text-sm"
                  >
                    <option value="">Sin categoría</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={addCategory}
                    className="px-3 rounded-xl border border-border text-muted hover:text-foreground text-sm"
                  >
                    +
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm text-muted mb-2">
                  Tallas disponibles
                </label>
                <div className="flex flex-wrap gap-2">
                  {AVAILABLE_SIZES.map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => toggleSize(size)}
                      className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                        form.sizes.includes(size)
                          ? "bg-accent text-black border-accent"
                          : "border-border text-muted hover:border-muted"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="available"
                  checked={form.is_available}
                  onChange={(e) =>
                    setForm({ ...form, is_available: e.target.checked })
                  }
                  className="w-4 h-4 accent-accent"
                />
                <label htmlFor="available" className="text-sm">
                  Disponible para la venta
                </label>
              </div>

              <button
                onClick={handleSave}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-accent hover:bg-accent-soft text-black font-medium py-3 rounded-xl transition-colors disabled:opacity-50"
              >
                <Check size={18} />
                {loading
                  ? "Guardando..."
                  : editingProduct
                    ? "Guardar cambios"
                    : "Crear prenda"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Settings */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 p-4">
          <div className="bg-card w-full max-w-md rounded-2xl border border-border fade-in">
            <div className="border-b border-border px-5 py-4 flex items-center justify-between">
              <h2 className="font-semibold">Configuración</h2>
              <button
                onClick={() => setShowSettings(false)}
                className="p-1 rounded-lg hover:bg-border/50"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm text-muted mb-1">
                  Nombre de la marca
                </label>
                <input
                  value={settings.brand_name}
                  onChange={(e) =>
                    setSettings({ ...settings, brand_name: e.target.value })
                  }
                  className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm text-muted mb-1">
                  Número de WhatsApp (solo números)
                </label>
                <input
                  value={settings.whatsapp_number}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      whatsapp_number: e.target.value,
                    })
                  }
                  className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm"
                  placeholder="5493468542942"
                />
                <p className="text-[11px] text-muted mt-1">
                  Sin + ni espacios. Ej: 5493468542942
                </p>
              </div>
              <button
                onClick={saveSettings}
                disabled={loading}
                className="w-full bg-accent hover:bg-accent-soft text-black font-medium py-2.5 rounded-xl"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
