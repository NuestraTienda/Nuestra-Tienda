import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formatea precio al estilo argentino: $ 25.000 ARS
 */
export function formatPrice(price: number): string {
  const formatted = new Intl.NumberFormat("es-AR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(price);

  return `$ ${formatted} ARS`;
}

/**
 * Genera el link de WhatsApp con mensaje prearmado
 */
export function getWhatsAppLink(
  phone: string,
  productName: string,
  price: number,
  imageUrl?: string | null
): string {
  const priceText = formatPrice(price);
  let message = `Hola! Quiero encargar esta prenda:\n\n*${productName}*\n${priceText}`;

  if (imageUrl) {
    message += `\n\nFoto: ${imageUrl}`;
  }

  message += `\n\n¿Me confirmás disponibilidad y talles?`;

  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

export const AVAILABLE_SIZES = [
  "XS",
  "S",
  "M",
  "L",
  "XL",
  "XXL",
  "36",
  "38",
  "40",
  "42",
  "44",
  "Único",
] as const;
