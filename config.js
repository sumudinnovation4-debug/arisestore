// Store settings. Fill these in, then upload the site. Leave a value empty to hide that feature.
window.STORE_CONFIG = {
  name: "Arise and Shine Digital World",
  currency: "₦",

  // Supabase: Project Settings > API. The anon key is safe to publish.
  supabaseUrl: "https://fcdfkfweqqmitteesbqv.supabase.co",
  supabaseAnonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZjZGZrZndlcXFtaXR0ZWVzYnF2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIzMjkxMjEsImV4cCI6MjEwNzkwNTEyMX0.k4zyev_aFKTE9B1Xag5OeFvQSfN2ZmvqUfPVk-LNOnU",

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
