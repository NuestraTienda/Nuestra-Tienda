export type Category = {
  id: string;
  name: string;
  slug: string;
  created_at: string;
};

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string | null;
  category_id: string | null;
  sizes: string[];
  is_available: boolean;
  created_at: string;
  updated_at: string;
  // joined
  categories?: Category | null;
};

export type Settings = {
  id: string;
  brand_name: string;
  whatsapp_number: string;
  created_at: string;
  updated_at: string;
};

export type Database = {
  public: {
    Tables: {
      products: {
        Row: Product;
        Insert: Omit<Product, "id" | "created_at" | "updated_at" | "categories">;
        Update: Partial<Omit<Product, "id" | "created_at" | "categories">>;
      };
      categories: {
        Row: Category;
        Insert: Omit<Category, "id" | "created_at">;
        Update: Partial<Omit<Category, "id" | "created_at">>;
      };
      settings: {
        Row: Settings;
        Insert: Omit<Settings, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<Settings, "id" | "created_at">>;
      };
    };
  };
};
