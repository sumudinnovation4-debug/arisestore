// Generates supabase/seed.sql from assets/catalog.js. Run: node scripts/make-seed.js
const fs = require("fs");
const path = require("path");
const window = {};
eval(fs.readFileSync(path.join(__dirname, "..", "assets", "catalog.js"), "utf8"));
const slug = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const q = (s) => "'" + String(s).replace(/'/g, "''") + "'";
const rows = [];
for (const c of window.CATALOG) {
  for (const b of c.brands) {
    rows.push(`(${q(c.slug + "-" + slug(b))}, ${q(c.slug)}, ${q(b)}, ${q(b + " " + c.singular)}, ${q(c.blurb)})`);
  }
}
const sql = `-- Starting product list: one line per brand in each category, with no prices yet.
-- Set prices in the admin page. Run once, after schema.sql.
insert into products (id, category, brand, name, description) values
${rows.join(",\n")}
on conflict (id) do nothing;
`;
fs.writeFileSync(path.join(__dirname, "..", "supabase", "seed.sql"), sql);
console.log("Wrote supabase/seed.sql with " + rows.length + " products");
