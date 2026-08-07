create type public.user_role as enum ('user', 'admin');
create type public.order_status as enum ('PENDING_PAYMENT', 'PAID', 'PREPARING', 'SHIPPED', 'DELIVERED', 'CANCELLED');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  phone text unique,
  full_name text not null default '',
  avatar_url text not null default '',
  role public.user_role not null default 'user',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table public.addresses (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null, receiver_name text not null, phone text not null, city text not null, address text not null,
  postal_code text not null, is_default boolean not null default false, created_at timestamptz not null default now()
);
create table public.products (
  id uuid primary key default gen_random_uuid(), name text not null, name_fa text not null, brand text not null, category text not null,
  subtitle text not null default '', price_toman integer not null, original_price_toman integer, rating numeric not null default 5,
  reviews_count integer not null default 0, images jsonb not null default '[]', colors jsonb not null default '[]', sizes jsonb not null default '[]',
  in_stock boolean not null default true, stock_count integer not null default 0, description text not null default '',
  is_popular boolean not null default false, is_special_offer boolean not null default false, is_hero_featured boolean not null default false,
  resell_price_range text, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.wishlists (user_id uuid references public.profiles(id) on delete cascade, product_id uuid references public.products(id) on delete cascade, primary key (user_id, product_id));
create table public.orders (id uuid primary key default gen_random_uuid(), user_id uuid not null references public.profiles(id), tracking_code text unique not null,
  customer_name text not null, customer_phone text not null, shipping_address text not null, total_amount_toman integer not null, shipping_fee_toman integer not null default 0,
  status public.order_status not null default 'PENDING_PAYMENT', payment_method text not null default 'ZARINPAL', created_at timestamptz not null default now());

alter table public.profiles enable row level security;
alter table public.addresses enable row level security;
alter table public.products enable row level security;
alter table public.wishlists enable row level security;
alter table public.orders enable row level security;
create policy "profiles own record" on public.profiles for all using (auth.uid() = id) with check (auth.uid() = id);
create policy "addresses own record" on public.addresses for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "products are public" on public.products for select using (true);
create policy "wishlist own record" on public.wishlists for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "orders own record" on public.orders for select using (auth.uid() = user_id);
