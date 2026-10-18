# Arise and Shine Digital World: online store

A plain HTML, CSS and JavaScript store. Customers can browse category pages, add to cart, check out, pay with Paystack (or by bank transfer) and track their order. You manage orders, prices and stock from `admin.html`.

## Try it first (no setup)

Open `index.html` in a browser. With `config.js` left empty, the site runs in **demo mode**: orders and payments are simulated in your own browser, and the prices are made-up demo prices. Use it to see every page.

## Go live

1. **Supabase (database).** Create a free project at supabase.com.
   - SQL Editor: run `supabase/schema.sql`, then `supabase/seed.sql`.
   - Authentication > Providers > Email: keep sign-ups **on** (customers create accounts). Optional: turn "Confirm email" on if you want customers to confirm their email address first.
   - **Make yourself the owner.** Open your site's Profile page and create your own account. Then in the SQL Editor run this, with your email:
     `insert into admins (user_id) select id from auth.users where email = 'owner@example.com';`
     Only accounts in this table can open the admin page or change orders, products and prices. Everyone else gets "only for the store owner", and the database refuses their changes too.
   - Project Settings > API: copy the Project URL and the `anon` public key into `config.js`.
2. **Paystack (payments).** Create an account at paystack.com. Copy your **public** key (`pk_live_...`, or `pk_test_...` while testing) into `config.js`. Never put the secret key in any site file.
3. **Payment check (important).** This makes sure an order is only marked paid after Paystack confirms the money.
   - Install the Supabase CLI, then in this folder run: `supabase functions deploy verify-payment`
   - Set the secret: `supabase secrets set PAYSTACK_SECRET_KEY=sk_live_...`
4. **Store details.** In `config.js` fill in `whatsapp`, `phone`, `email`, `address` and `bank` (the bank details are optional and enable "Pay by bank transfer").
5. **Upload the folder** to any static host (Netlify, Vercel, Cloudflare Pages, or your web hosting).
6. Sign in on the Profile page with your owner account. A **Store admin** button then appears there (customers never see it). Or open `admin.html` directly. In the admin page:
   - **Settings**: set the delivery fee and pickup address.
   - **Products and prices**: set a price on each product. A product with no price shows "Price on request" and cannot be bought online. Add more products, stock counts and image links here.

## Product photos

Paste an image link in the admin page for each product. Use photos you have the right to use, such as your own or ones supplied by distributors. Products without a photo show a category icon.

## Notes

- Customers can sign up and sign in, save their delivery details, and see their orders on the Profile page. Guests can still check out and track with the order number plus the phone number they ordered with.
- The bottom bar has Home, Categories, Cart and Profile.
- Orders reduce stock when placed. If you cancel an order, add the stock back in the admin page.
- Test one full order with Paystack test keys before switching to live keys.
- To change the category list or brands, edit `assets/catalog.js`. To add new starting products to the database, run `node scripts/make-seed.js` and run the new `supabase/seed.sql`.
