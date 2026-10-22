-- ============================================
-- NUESTRA TIENDA - Schema de Base de Datos
-- ============================================

-- Extensiones
create extension if not exists "uuid-ossp";

-- ============================================
-- CONFIGURACIÓN DE LA MARCA (editable desde admin)
-- ============================================
create table if not exists public.settings (
  id uuid primary key default uuid_generate_v4(),
  brand_name text not null default 'Nuestra Tienda',
  whatsapp_number text not null default '5493468542942',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Insertar la configuración inicial
insert into public.settings (brand_name, whatsapp_number)
values ('Nuestra Tienda', '5493468542942')
on conflict do nothing;

-- ============================================
-- CATEGORÍAS
-- ============================================
create table if not exists public.categories (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text not null unique,
  created_at timestamptz default now()
);

-- Categoría inicial
insert into public.categories (name, slug)
values ('Verano / Fiesta', 'verano-fiesta')
on conflict do nothing;

-- ============================================
-- PRODUCTOS
-- ============================================
create table if not exists public.products (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text default '',
  price numeric(12,2) not null check (price >= 0),
  image_url text,
  category_id uuid references public.categories(id) on delete set null,
  -- tallas disponibles (ej: ['S','M','L','XL'])
  sizes text[] default '{}',
  is_available boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Índices para búsquedas rápidas
create index if not exists idx_products_name on public.products using gin (to_tsvector('spanish', name));
create index if not exists idx_products_sizes on public.products using gin (sizes);
create index if not exists idx_products_available on public.products (is_available);
create index if not exists idx_products_category on public.products (category_id);

-- ============================================
-- STORAGE para fotos de productos
-- ============================================
-- Crear el bucket (esto se hace desde el dashboard de Supabase también)
-- insert into storage.buckets (id, name, public) values ('product-images', 'product-images', true);

-- ============================================
-- POLÍTICAS DE SEGURIDAD (RLS)
-- ============================================

-- Habilitar RLS
alter table public.settings enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;

-- SETTINGS: cualquiera puede leer, solo autenticados pueden editar
create policy "settings_public_read" on public.settings
  for select using (true);

create policy "settings_admin_update" on public.settings
  for update using (auth.role() = 'authenticated');

-- CATEGORIES: cualquiera puede leer, solo autenticados CRUD
create policy "categories_public_read" on public.categories
  for select using (true);

create policy "categories_admin_all" on public.categories
  for all using (auth.role() = 'authenticated');

-- PRODUCTS: cualquiera puede leer los disponibles, solo autenticados CRUD
create policy "products_public_read" on public.products
  for select using (true);

create policy "products_admin_all" on public.products
  for all using (auth.role() = 'authenticated');

-- ============================================
-- Función para actualizar updated_at automáticamente
-- ============================================
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger products_updated_at
  before update on public.products
  for each row execute procedure public.handle_updated_at();

create trigger settings_updated_at
  before update on public.settings
  for each row execute procedure public.handle_updated_at();
