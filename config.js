// Store settings. Fill these in, then upload the site. Leave a value empty to hide that feature.
window.STORE_CONFIG = {
  name: "Arise and Shine Digital World",
  currency: "₦",

  // Supabase: Project Settings > API. The anon key is safe to publish.
  supabaseUrl: "",
  supabaseAnonKey: "",

  // Paystack: Settings > API Keys. Use the PUBLIC key only (pk_live_... or pk_test_...).
  paystackPublicKey: "",

  // Contact details shown in the footer and used for "Ask on WhatsApp" buttons.
  whatsapp: "",   // international format without +, e.g. 2348012345678
  phone: "",
  email: "",
  address: "",

  // Shown to customers who choose "Pay by bank transfer". Leave empty to hide that option.
  bank: { bank: "", accountName: "", accountNumber: "" }
};
