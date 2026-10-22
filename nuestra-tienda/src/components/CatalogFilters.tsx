"use client";

import { useState } from "react";
import { Search, Menu, X } from "lucide-react";
import { AVAILABLE_SIZES } from "@/lib/utils";
import { cn } from "@/lib/utils";

type Props = {
  search: string;
  onSearchChange: (value: string) => void;
  selectedSizes: string[];
  onSizesChange: (sizes: string[]) => void;
};

export default function CatalogFilters({
  search,
  onSearchChange,
  selectedSizes,
  onSizesChange,
}: Props) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const toggleSize = (size: string) => {
    if (selectedSizes.includes(size)) {
      onSizesChange(selectedSizes.filter((s) => s !== size));
    } else {
      onSizesChange([...selectedSizes, size]);
    }
  };

  const clearFilters = () => {
    onSizesChange([]);
  };

  return (
    <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-md border-b border-border">
      <div className="max-w-6xl mx-auto px-4 py-3">
        <div className="flex items-center gap-2">
          {/* Botón de tallas (3 rayitas) */}
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={cn(
              "flex items-center justify-center w-11 h-11 rounded-xl border transition-colors",
              isFilterOpen || selectedSizes.length > 0
                ? "bg-accent/20 border-accent text-accent"
                : "bg-card border-border text-muted hover:text-foreground hover:border-muted"
            )}
            aria-label="Filtrar por talla"
          >
            {isFilterOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          {/* Buscador */}
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"
            />
            <input
              type="search"
              placeholder="Buscar prenda..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full bg-card border border-border rounded-xl pl-11 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted focus:border-accent transition-colors"
            />
          </div>
        </div>

        {/* Panel de tallas */}
        {isFilterOpen && (
          <div className="mt-3 p-4 bg-card rounded-xl border border-border fade-in">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-foreground">
                Filtrar por talla
              </p>
              {selectedSizes.length > 0 && (
                <button
                  onClick={clearFilters}
                  className="text-xs text-accent hover:underline"
                >
                  Limpiar
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {AVAILABLE_SIZES.map((size) => {
                const isSelected = selectedSizes.includes(size);
                return (
                  <button
                    key={size}
                    onClick={() => toggleSize(size)}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-sm font-medium border transition-all",
                      isSelected
                        ? "bg-accent text-black border-accent"
                        : "bg-transparent text-muted border-border hover:border-muted hover:text-foreground"
                    )}
                  >
                    {size}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Chips de tallas activas */}
        {selectedSizes.length > 0 && !isFilterOpen && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {selectedSizes.map((size) => (
              <span
                key={size}
                className="inline-flex items-center gap-1 bg-accent/20 text-accent text-xs font-medium px-2.5 py-1 rounded-full"
              >
                {size}
                <button
                  onClick={() => toggleSize(size)}
                  className="hover:text-white"
                >
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
