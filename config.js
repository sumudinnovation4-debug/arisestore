// Store settings. Fill these in, then upload the site. Leave a value empty to hide that feature.
window.STORE_CONFIG = {
  name: "Arise and Shine Digital World",
  currency: "₦",

  // Supabase: Project Settings > API. The anon key is safe to publish.
  supabaseUrl: "https://fcdfkfweqqmitteesbqv.supabase.co",
  supabaseAnonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZjZGZrZndlcXFtaXR0ZWVzYnF2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIzMjkxMjEsImV4cCI6MjEwNzkwNTEyMX0.k4zyev_aFKTE9B1Xag5OeFvQSfN2ZmvqUfPVk-LNOnU",

  // Paystack: Settings > API Keys. Use the PUBLIC key only (pk_live_... or pk_test_...).
  paystackPublicKey: "pk_live_c6328255025c6981d845aa4ebacab5a3ab11bb24",

  // Contact details shown in the footer and used for "Ask on WhatsApp" buttons.
  whatsapp: "+2348167956341",   // 0816 795 6341, shown in the footer as WhatsApp
  phone: "08167956341",
  email: "contact@ariseandshineworlddigital.com",
  facebook: "https://www.facebook.com/share/19fzgLfb9T/",

  // Owner order alerts: both of these numbers get a WhatsApp message whenever an order is placed.
  // (Sent by the notify-owner function. See the note at the top of supabase/functions/notify-owner/index.ts)
  ownerWhatsapp: ["2349134487573", "2348167956341"],
  address: "lambu phase 1,keffi Nasarawa state, Nigeria",

  // Shown to customers who choose "Pay by bank transfer". Leave empty to hide that option.
  bank: { bank: "FCMB", accountName: "Arise and shine digital world", accountNumber: "2001322041" }
};
