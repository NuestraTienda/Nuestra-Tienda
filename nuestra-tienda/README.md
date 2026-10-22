# Nuestra Tienda – Catálogo Custom

Catálogo web de ropa de mujer con:

- **Link público**: grilla aesthetic, buscador, filtro por talla, botón “Encargar” → WhatsApp
- **Link privado** (`/admin`): panel para agregar/editar/borrar prendas, categorías y nombre de marca

## Stack

- Next.js 16 + Tailwind CSS v4
- Supabase (Auth + Postgres + Storage futuro)
- Hosting recomendado: Vercel (gratis)

---

## Cómo levantarlo (paso a paso)

### 1. Crear proyecto en Supabase

1. Entrá a [supabase.com](https://supabase.com) y creá una cuenta
2. New Project → poné nombre (ej: `nuestra-tienda`) y una contraseña fuerte
3. Esperá que termine de crear

### 2. Correr el schema

1. En el menú izquierdo andá a **SQL Editor**
2. Copiá y pegá todo el contenido de `supabase/schema.sql`
3. Ejecutá (Run)

### 3. Crear los usuarios admin

1. En Supabase andá a **Authentication → Users**
2. **Add user** → Create new user
3. Email: `palmitestaleo123@gmail.com` + una contraseña que recuerden
4. Cuando tengas el mail de tu amigo, agregalo igual

### 4. Variables de entorno

1. En Supabase → **Project Settings → API**
2. Copiá:
   - Project URL
   - `anon` `public` key

3. En la raíz del proyecto creá un archivo `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
```

### 5. Instalar y correr local

```bash
npm install
npm run dev
```

Abrí http://localhost:3000 → catálogo público  
http://localhost:3000/admin → panel privado (login)

### 6. Subir a Vercel (link público permanente)

1. Subí el repo a GitHub
2. Entrá a [vercel.com](https://vercel.com) → Import project
3. Agregá las mismas 2 variables de entorno
4. Deploy

Vas a tener algo como: `https://nuestra-tienda.vercel.app`

---

## Estructura importante

| Ruta              | Quién la ve          |
|-------------------|----------------------|
| `/`               | Todo el mundo (público) |
| `/admin`          | Solo ustedes (login) |
| `/admin/login`    | Login del panel      |

## Qué se puede editar desde el panel

- Nombre de la marca
- Número de WhatsApp
- Agregar / editar / borrar prendas
- Tallas de cada prenda
- Categorías (botón +)
- Marcar prenda como disponible o no

## Notas

- Por ahora las fotos se cargan pegando una URL (Imgur, Drive público, Cloudinary, etc.). Después se puede sumar subida directa a Supabase Storage.
- Los precios se muestran como `$ 25.000 ARS`.
- El botón Encargar abre WhatsApp con mensaje prearmado + link de la foto.
