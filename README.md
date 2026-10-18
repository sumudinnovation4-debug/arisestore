# Arise and Shine Digital World: online store

A plain HTML, CSS and JavaScript store. Customers can browse category pages, add to cart, check out, pay with Paystack (or by bank transfer) and track their order. You manage orders, prices and stock from `admin.html`.

## Try it first (no setup)

Open `index.html` in a browser. With `config.js` left empty, the site runs in **demo mode**: orders and payments are simulated in your own browser, and the prices are made-up demo prices. Use it to see every page.

## Go live

1. **Supabase (database).** Create a free project at supabase.com.
   - SQL Editor: run `supabase/schema.sql`, then `supabase/seed.sql`, then `supabase/storage-images.sql` (lets the owner upload product photos).
   - Authentication > Providers > Email: keep sign-ups **on** (customers create accounts). Optional: turn "Confirm email" on if you want customers to confirm their email address first.
   - **Make the owner account.** Run `supabase/make-admin.sql` in the SQL Editor (after `schema.sql`). It creates the owner login `ariseandshine@gmail.com` with the password written in that file, and adds it to the `admins` table. Only accounts in that table can open the admin page or change orders, products and prices. Everyone else sees "only for the store owner", and the database refuses their changes too.
     If login fails afterwards, create the user in Authentication > Users > Add user (tick "Auto Confirm User") and run only the last commented line of that file.
     Change the password after your first login, and delete `make-admin.sql` from anything you share, because the password is written in it.
   - Project Settings > API: copy the Project URL and the `anon` public key into `config.js`.
2. **Paystack (payments).** Create an account at paystack.com. Copy your **public** key (`pk_live_...`, or `pk_test_...` while testing) into `config.js`. Never put the secret key in any site file.
3. **Payment check (important).** This makes sure an order is only marked paid after Paystack confirms the money.
   - Install the Supabase CLI, then in this folder run: `supabase functions deploy verify-payment`
   - Set the secret: `supabase secrets set PAYSTACK_SECRET_KEY=sk_live_...`
4. **Store details.** In `config.js` fill in `whatsapp`, `phone`, `email`, `address` and `bank` (the bank details are optional and enable "Pay by bank transfer").
5. **Upload the folder** to any static host (Netlify, Vercel, Cloudflare Pages, or your web hosting).
6. Sign in on the Profile page with `ariseandshine@gmail.com`. A **Store admin** row then appears there (customers never see it). Or open `admin.html` directly.

## Admin dashboard (owner only)

- **Overview:** orders to fulfil, orders waiting for payment, paid sales for 30 days and all time, a 14-day sales chart, and warnings for products with no price or low stock.
- **Orders:** search and filter, open an order to mark it paid (bank transfers), change its status with a message for the customer, and message the customer on WhatsApp. Cancelling an order puts its items back in stock.
- **Products:** every product in one list. Search, filter (no price, low stock, out of stock, hidden), change a price or stock number right in the row, show or hide a product, edit all details, upload a photo, duplicate or delete. Tick several products to set a price or stock, hide, show or delete them together. "Add product" creates a new one. "Download list" saves everything as a spreadsheet file.
- **Add many at once:** paste rows from Excel or Google Sheets (Name, Brand, Category, Price, Stock, Description, Photo link) and add them all in one go. Re-pasting a product with the same brand and name updates it.
- **Settings:** delivery fee, pickup address, and change password.

Products with no price can still be added to the cart. The cart then sends the customer's list to you on WhatsApp for a price, and only priced items go to checkout.

## Product photos

Out of the box, each product shows a free-licensed photo of its product type from Wikipedia, loaded in the visitor's browser (the same photo can appear for several brands). If a photo cannot load, a category icon shows instead. For real photos of each model, paste an image link in the admin page (Products and prices). Use photos you have the right to use, such as your own or ones supplied by distributors. Wikipedia photos are free to use with credit, so replace them with your own before relying on them for advertising.

## Notes

- Customers can sign up and sign in, save their delivery details, and see their orders on the Profile page. Guests can still check out and track with the order number plus the phone number they ordered with.
- The bottom bar has Home, Categories, Cart and Profile.
- Orders reduce stock when placed. Cancelling an order in the admin dashboard puts the stock back.
- Test one full order with Paystack test keys before switching to live keys.
- Categories are fixed in `assets/catalog.js`; to add a new category, add an entry there (name, slug, icon, brands, tips). To add new starting products to the database, run `node scripts/make-seed.js` and run the new `supabase/seed.sql`.
