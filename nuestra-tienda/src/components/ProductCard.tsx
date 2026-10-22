"use client";

import { formatPrice, getWhatsAppLink } from "@/lib/utils";
import type { Product } from "@/types/database";
import { MessageCircle } from "lucide-react";

type Props = {
  product: Product;
  whatsappNumber: string;
};

export default function ProductCard({ product, whatsappNumber }: Props) {
  const waLink = getWhatsAppLink(
    whatsappNumber,
    product.name,
    product.price,
    product.image_url
  );

  return (
    <article className="group bg-card rounded-2xl overflow-hidden border border-border hover:border-accent/40 transition-all duration-300 hover:shadow-lg hover:shadow-accent/5 fade-in">
      {/* Imagen */}
      <div className="relative aspect-[3/4] overflow-hidden bg-black/40">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted text-sm">
            Sin foto
          </div>
        )}

        {/* Badge de tallas */}
        {product.sizes && product.sizes.length > 0 && (
          <div className="absolute bottom-3 left-3 flex flex-wrap gap-1">
            {product.sizes.slice(0, 4).map((size) => (
              <span
                key={size}
                className="bg-black/70 backdrop-blur-sm text-white text-[10px] font-medium px-2 py-0.5 rounded-full"
              >
                {size}
              </span>
            ))}
            {product.sizes.length > 4 && (
              <span className="bg-black/70 backdrop-blur-sm text-white text-[10px] px-2 py-0.5 rounded-full">
                +{product.sizes.length - 4}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4 space-y-3">
        <div>
          <h3 className="font-medium text-foreground leading-tight line-clamp-2">
            {product.name}
          </h3>
          {product.description && (
            <p className="mt-1 text-sm text-muted line-clamp-2">
              {product.description}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between gap-3">
          <p className="text-accent font-semibold tracking-wide">
            {formatPrice(product.price)}
          </p>
        </div>

        {/* Botón Encargar */}
        <a
          href={waLink}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full bg-accent hover:bg-accent-soft text-black font-medium text-sm py-2.5 rounded-xl transition-colors duration-200"
        >
          <MessageCircle size={16} />
          Encargar
        </a>
      </div>
    </article>
  );
}
