-- Arise and Shine Digital World: database setup.
-- Run this whole file once in Supabase: SQL Editor > New query > paste > Run.
-- Then run seed.sql to add the starting product list.

create table if not exists products (
  id text primary key,
  category text not null,
  brand text not null,
  name text not null,
  description text not null default '',
  price numeric(12,2),            -- empty = "price on request", not buyable online
  stock int,                      -- empty = stock not tracked
  image_url text not null default '',
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  ref text unique not null,
  customer_name text not null,
  phone text not null,
  email text not null,
  delivery_method text not null check (delivery_method in ('delivery','pickup')),
  address text, city text, state text,
  items jsonb not null,
  subtotal numeric(12,2) not null,
  delivery_fee numeric(12,2) not null default 0,
  total numeric(12,2) not null,
  payment_method text not null default 'paystack' check (payment_method in ('paystack','transfer')),
  payment_status text not null default 'pending' check (payment_status in ('pending','paid','failed')),
  status text not null default 'placed' check (status in ('placed','confirmed','processing','out_for_delivery','ready_for_pickup','delivered','cancelled')),
  created_at timestamptz not null default now()
);

create table if not exists order_events (
  id bigserial primary key,
  order_id uuid not null references orders(id) on delete cascade,
  status text not null,
  note text,
  created_at timestamptz not null default now()
);

create table if not exists settings (key text primary key, value text);
insert into settings(key, value) values ('delivery_fee','0'), ('pickup_address','') on conflict do nothing;

-- Who is the owner? Only people listed in this table can open the admin page or change data.
-- After you create your own account on the site, add yourself (see README.md, step 1).
create table if not exists admins (user_id uuid primary key references auth.users(id) on delete cascade);
alter table admins enable row level security;   -- no policies: nobody can read or edit it from the website

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text, phone text, address text, city text, state text
);

create or replace function is_admin() returns boolean
language sql security definer stable set search_path = public as $$
  select exists (select 1 from admins where user_id = auth.uid())
$$;
grant execute on function is_admin() to anon, authenticated;

-- Row level security
alter table products enable row level security;
alter table orders enable row level security;
alter table order_events enable row level security;
alter table settings enable row level security;
alter table profiles enable row level security;

drop policy if exists "public reads active products" on products;
create policy "public reads active products" on products for select to anon, authenticated using (active);
drop policy if exists "owner manages products" on products;
create policy "owner manages products" on products for all to authenticated using (is_admin()) with check (is_admin());

drop policy if exists "public reads settings" on settings;
create policy "public reads settings" on settings for select to anon, authenticated using (true);
drop policy if exists "owner manages settings" on settings;
create policy "owner manages settings" on settings for all to authenticated using (is_admin()) with check (is_admin());

drop policy if exists "owner manages orders" on orders;
create policy "owner manages orders" on orders for all to authenticated using (is_admin()) with check (is_admin());
drop policy if exists "customer reads own orders" on orders;
create policy "customer reads own orders" on orders for select to authenticated using (user_id = auth.uid());

drop policy if exists "owner manages order events" on order_events;
create policy "owner manages order events" on order_events for all to authenticated using (is_admin()) with check (is_admin());

drop policy if exists "customer manages own profile" on profiles;
create policy "customer manages own profile" on profiles for all to authenticated using (id = auth.uid()) with check (id = auth.uid());

-- Customers (signed in or not) create orders through this function. Prices and totals come from the
-- products table here, never from the browser, so they cannot be changed by a customer.
create or replace function create_order(p jsonb) returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  it jsonb; prod products%rowtype; qty int; sub numeric := 0; fee numeric := 0;
  lines jsonb := '[]'::jsonb; v_ref text; v_id uuid; method text; pay text;
begin
  if coalesce(trim(p->>'customer_name'),'') = '' or coalesce(trim(p->>'phone'),'') = '' or coalesce(trim(p->>'email'),'') = '' then
    raise exception 'Name, phone and email are required';
  end if;
  if jsonb_typeof(p->'items') <> 'array' or jsonb_array_length(p->'items') = 0 then
    raise exception 'Your cart is empty';
  end if;
  method := coalesce(p->>'delivery_method','delivery');
  if method not in ('delivery','pickup') then raise exception 'Invalid delivery method'; end if;
  if method = 'delivery' and (coalesce(trim(p->>'address'),'') = '' or coalesce(trim(p->>'city'),'') = '' or coalesce(trim(p->>'state'),'') = '') then
    raise exception 'Delivery address is required';
  end if;
  pay := coalesce(p->>'payment_method','paystack');
  if pay not in ('paystack','transfer') then raise exception 'Invalid payment method'; end if;

  for it in select * from jsonb_array_elements(p->'items') loop
    qty := greatest(1, least(50, coalesce((it->>'qty')::int, 1)));
    select * into prod from products where id = it->>'id' and active for update;
    if not found or prod.price is null then raise exception 'An item in your cart is not available for online order'; end if;
    if prod.stock is not null and prod.stock < qty then raise exception '% has only % left', prod.name, prod.stock; end if;
    sub := sub + prod.price * qty;
    lines := lines || jsonb_build_object('id', prod.id, 'name', prod.name, 'brand', prod.brand, 'price', prod.price, 'qty', qty);
    if prod.stock is not null then update products set stock = stock - qty where id = prod.id; end if;
  end loop;

  if method = 'delivery' then
    select coalesce(nullif(value,'')::numeric, 0) into fee from settings where key = 'delivery_fee';
    fee := coalesce(fee, 0);
  end if;

  v_ref := 'ASDW-' || upper(substr(md5(random()::text || clock_timestamp()::text), 1, 6));
  insert into orders(user_id, ref, customer_name, phone, email, delivery_method, address, city, state, items, subtotal, delivery_fee, total, payment_method)
  values (auth.uid(), v_ref, trim(p->>'customer_name'), trim(p->>'phone'), trim(p->>'email'), method,
          p->>'address', p->>'city', p->>'state', lines, sub, fee, sub + fee, pay)
  returning id into v_id;
  insert into order_events(order_id, status, note) values (v_id, 'placed', 'Order received');
  return jsonb_build_object('ref', v_ref, 'total', sub + fee);
end $$;

-- Customers track an order with the order number plus the phone number used to order.
create or replace function track_order(p_ref text, p_phone text) returns jsonb
language plpgsql security definer set search_path = public as $$
declare o orders%rowtype;
begin
  select * into o from orders where ref = upper(trim(p_ref));
  if not found or right(regexp_replace(o.phone, '\D', '', 'g'), 10) <> right(regexp_replace(p_phone, '\D', '', 'g'), 10) then
    return null;
  end if;
  return jsonb_build_object(
    'ref', o.ref, 'customer_name', o.customer_name, 'email', o.email, 'status', o.status,
    'payment_status', o.payment_status, 'payment_method', o.payment_method, 'delivery_method', o.delivery_method,
    'address', o.address, 'city', o.city, 'state', o.state, 'items', o.items,
    'subtotal', o.subtotal, 'delivery_fee', o.delivery_fee, 'total', o.total, 'created_at', o.created_at,
    'events', (select coalesce(jsonb_agg(jsonb_build_object('status', e.status, 'note', e.note, 'created_at', e.created_at) order by e.created_at), '[]'::jsonb)
               from order_events e where e.order_id = o.id));
end $$;

revoke all on function create_order(jsonb) from public;
revoke all on function track_order(text, text) from public;
grant execute on function create_order(jsonb) to anon, authenticated;
grant execute on function track_order(text, text) to anon, authenticated;
