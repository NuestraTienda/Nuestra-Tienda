"use client";

import { useMemo, useState } from "react";
import type { Product, Settings } from "@/types/database";
import ProductCard from "./ProductCard";
import CatalogFilters from "./CatalogFilters";

type Props = {
  products: Product[];
  settings: Settings;
};

export default function Catalog({ products, settings }: Props) {
  const [search, setSearch] = useState("");
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      // Solo disponibles
      if (!p.is_available) return false;

      // Búsqueda por nombre
      const matchesSearch =
        search.trim() === "" ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        (p.description || "").toLowerCase().includes(search.toLowerCase());

      // Filtro por talla
      const matchesSize =
        selectedSizes.length === 0 ||
        selectedSizes.some((s) => p.sizes?.includes(s));

      return matchesSearch && matchesSize;
    });
  }, [products, search, selectedSizes]);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-6xl mx-auto px-4 py-6 text-center">
          <h1 className="text-2xl md:text-3xl font-semibold tracking-wide text-foreground">
            {settings.brand_name}
          </h1>
          <p className="mt-1 text-sm text-muted">
            Sexy · Elegante · Aesthetic
          </p>
        </div>
      </header>

      {/* Filtros */}
      <CatalogFilters
        search={search}
        onSearchChange={setSearch}
        selectedSizes={selectedSizes}
        onSizesChange={setSelectedSizes}
      />

      {/* Grid de productos */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8">
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted text-lg">
              {products.length === 0
                ? "Todavía no hay prendas cargadas"
                : "No encontramos prendas con esos filtros"}
            </p>
            {(search || selectedSizes.length > 0) && (
              <button
                onClick={() => {
                  setSearch("");
                  setSelectedSizes([]);
                }}
                className="mt-4 text-accent text-sm hover:underline"
              >
                Limpiar filtros
              </button>
            )}
          </div>
        ) : (
          <>
            <p className="text-sm text-muted mb-6">
              {filtered.length}{" "}
              {filtered.length === 1 ? "prenda" : "prendas"}
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {filtered.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  whatsappNumber={settings.whatsapp_number}
                />
              ))}
            </div>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-6 text-center">
        <p className="text-xs text-muted">
          © {new Date().getFullYear()} {settings.brand_name}
        </p>
      </footer>
    </div>
  );
}
