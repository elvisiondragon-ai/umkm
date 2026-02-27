import { useState } from "react";
import heroImg from "@/assets/hero-illustration.png";
import {
  Globe, ShoppingCart, MessageCircle, BarChart3, Zap, Shield, Smartphone,
  Star, ChevronDown, ChevronUp, Check, Plus, Pencil, Trash2, Eye,
  Package, TrendingUp, Users, DollarSign, ArrowLeft, Store, Menu, X,
  Send, MapPin, Phone, Instagram, Facebook
} from "lucide-react";

// ==================== TYPES ====================
type View = "home" | "dashboard" | "umkm-template";
type OrderStatus = "baru" | "proses" | "kirim" | "selesai";

interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  desc: string;
}

interface Order {
  id: number;
  customer: string;
  wa: string;
  items: string;
  total: number;
  status: OrderStatus;
  date: string;
}

// ==================== DATA ====================
const FEATURES = [
  { icon: Globe, title: "Website Instan", desc: "Dapat landing page profesional dalam hitungan menit, tanpa coding." },
  { icon: ShoppingCart, title: "Sistem Order Online", desc: "Terima pesanan langsung dari website, notifikasi otomatis ke WhatsApp." },
  { icon: BarChart3, title: "Dashboard Lengkap", desc: "Pantau orderan, revenue, dan statistik pengunjung real-time." },
  { icon: Smartphone, title: "Mobile Friendly", desc: "Tampil sempurna di semua device, karena pelanggan Anda pakai HP." },
];

const PRICING = [
  { name: "Starter", price: "Gratis", period: "selamanya", features: ["1 Landing Page", "10 Produk", "Order via WhatsApp", "Template Basic"], cta: "Mulai Gratis", popular: false },
  { name: "Pro", price: "Rp 99rb", period: "/bulan", features: ["Custom Domain", "Produk Unlimited", "Dashboard Analytics", "Template Premium", "Priority Support"], cta: "Coba 14 Hari", popular: true },
  { name: "Business", price: "Rp 249rb", period: "/bulan", features: ["Semua fitur Pro", "Multi Outlet", "Integrasi Pembayaran", "Custom Branding", "API Access", "Dedicated Support"], cta: "Hubungi Sales", popular: false },
];

const TESTIMONIALS = [
  { name: "Ibu Sari", biz: "Sari Kue Rumahan", text: "Dulu cuma jualan di WA, sekarang punya website sendiri. Orderan naik 3x lipat!", avatar: "SK", rating: 5 },
  { name: "Pak Budi", biz: "Budi Elektronik", text: "Simple banget, tinggal upload foto produk langsung jadi. Customer juga gampang order.", avatar: "BE", rating: 5 },
  { name: "Dina", biz: "Dina Fashion", text: "Website-nya bagus, profesional. Pelanggan jadi lebih percaya sama toko saya.", avatar: "DF", rating: 5 },
  { name: "Mas Eko", biz: "Eko Catering", text: "Fitur order langsung ke WA bikin saya nggak ketinggalan pesanan lagi.", avatar: "EC", rating: 4 },
];

const FAQS = [
  { q: "Apakah benar-benar gratis?", a: "Ya! Paket Starter 100% gratis selamanya. Anda bisa upgrade kapan saja untuk fitur premium." },
  { q: "Apakah saya perlu bisa coding?", a: "Tidak sama sekali. Cukup daftar, isi data toko, upload produk — website langsung jadi otomatis." },
  { q: "Bagaimana sistem ordernya?", a: "Customer mengisi form order di website Anda, lalu notifikasi otomatis masuk ke WhatsApp Anda. Sangat mudah!" },
  { q: "Bisa custom domain sendiri?", a: "Bisa! Dengan paket Pro, Anda bisa menggunakan domain sendiri seperti www.tokoanda.com." },
  { q: "Data saya aman?", a: "Keamanan data adalah prioritas kami. Semua data dienkripsi dan di-backup secara berkala." },
];

const SAMPLE_PRODUCTS: Product[] = [
  { id: 1, name: "Nasi Goreng Spesial", price: 25000, image: "🍛", desc: "Nasi goreng dengan telur, ayam, dan sayuran segar" },
  { id: 2, name: "Mie Ayam Bakso", price: 20000, image: "🍜", desc: "Mie ayam dengan bakso sapi pilihan" },
  { id: 3, name: "Es Teh Manis", price: 5000, image: "🧊", desc: "Teh manis segar dengan es batu" },
  { id: 4, name: "Ayam Geprek", price: 22000, image: "🍗", desc: "Ayam geprek dengan sambal level pilihan" },
  { id: 5, name: "Soto Ayam", price: 18000, image: "🥣", desc: "Soto ayam kuah bening dengan nasi" },
  { id: 6, name: "Jus Alpukat", price: 12000, image: "🥤", desc: "Jus alpukat segar dengan susu coklat" },
];

const SAMPLE_ORDERS: Order[] = [
  { id: 1001, customer: "Ahmad", wa: "08123456789", items: "2x Nasi Goreng, 1x Es Teh", total: 55000, status: "baru", date: "Hari ini, 14:30" },
  { id: 1002, customer: "Rina", wa: "08198765432", items: "1x Ayam Geprek, 1x Jus Alpukat", total: 34000, status: "proses", date: "Hari ini, 13:15" },
  { id: 1003, customer: "Dedi", wa: "08112233445", items: "3x Mie Ayam Bakso", total: 60000, status: "kirim", date: "Hari ini, 11:00" },
  { id: 1004, customer: "Siti", wa: "08155667788", items: "1x Soto Ayam, 2x Es Teh", total: 28000, status: "selesai", date: "Kemarin, 19:45" },
];

// ==================== HELPERS ====================
const formatRp = (n: number) => `Rp ${n.toLocaleString("id-ID")}`;

const statusColors: Record<OrderStatus, string> = {
  baru: "bg-accent text-accent-foreground",
  proses: "bg-secondary text-secondary-foreground",
  kirim: "bg-primary text-primary-foreground",
  selesai: "bg-success text-success-foreground",
};

// ==================== MAIN COMPONENT ====================
const Index = () => {
  const [view, setView] = useState<View>("home");
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [orderForm, setOrderForm] = useState({ nama: "", wa: "", alamat: "", produk: "", qty: "1", catatan: "" });

  // ========== HOME PAGE ==========
  if (view === "home") {
    return (
      <div className="min-h-screen bg-background">
        {/* Navbar */}
        <nav className="sticky top-0 z-50 bg-card/80 backdrop-blur-lg border-b">
          <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-accent-gradient flex items-center justify-center">
                <Zap className="w-4 h-4 text-accent-foreground" />
              </div>
              <span className="font-bold text-lg text-foreground">ElVision<span className="text-secondary">UMKM</span></span>
            </div>
            <div className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
              <a href="#fitur" className="hover:text-foreground transition-colors">Fitur</a>
              <a href="#harga" className="hover:text-foreground transition-colors">Harga</a>
              <a href="#testimoni" className="hover:text-foreground transition-colors">Testimoni</a>
              <a href="#faq" className="hover:text-foreground transition-colors">FAQ</a>
            </div>
            <div className="hidden md:flex items-center gap-3">
              <button onClick={() => setView("dashboard")} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Masuk</button>
              <button onClick={() => setView("dashboard")} className="text-sm font-semibold px-4 py-2 rounded-lg bg-cta-gradient text-accent-foreground shadow-card hover:opacity-90 transition-opacity">Daftar Gratis</button>
            </div>
            <button className="md:hidden" onClick={() => setMobileMenu(!mobileMenu)}>
              {mobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
          {mobileMenu && (
            <div className="md:hidden border-t bg-card px-4 py-4 space-y-3">
              <a href="#fitur" className="block text-sm font-medium text-muted-foreground" onClick={() => setMobileMenu(false)}>Fitur</a>
              <a href="#harga" className="block text-sm font-medium text-muted-foreground" onClick={() => setMobileMenu(false)}>Harga</a>
              <a href="#testimoni" className="block text-sm font-medium text-muted-foreground" onClick={() => setMobileMenu(false)}>Testimoni</a>
              <a href="#faq" className="block text-sm font-medium text-muted-foreground" onClick={() => setMobileMenu(false)}>FAQ</a>
              <div className="pt-2 border-t flex gap-2">
                <button onClick={() => { setView("dashboard"); setMobileMenu(false); }} className="flex-1 text-sm font-medium py-2 rounded-lg border text-foreground">Masuk</button>
                <button onClick={() => { setView("dashboard"); setMobileMenu(false); }} className="flex-1 text-sm font-semibold py-2 rounded-lg bg-cta-gradient text-accent-foreground">Daftar Gratis</button>
              </div>
            </div>
          )}
        </nav>

        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-hero-gradient opacity-[0.03]" />
          <div className="max-w-6xl mx-auto px-4 py-16 md:py-24 grid md:grid-cols-2 gap-8 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/10 text-secondary text-xs font-semibold mb-6">
                <Zap className="w-3 h-3" /> Platform #1 untuk UMKM Indonesia
              </div>
              <h1 className="text-3xl md:text-5xl font-extrabold text-foreground leading-tight mb-4">
                Buat Website UMKM <span className="text-gradient-hero">Gratis</span> dalam 5 Menit
              </h1>
              <p className="text-base md:text-lg text-muted-foreground mb-8 leading-relaxed">
                Daftar, upload produk, langsung terima orderan. Tanpa coding, tanpa ribet. Website profesional untuk bisnis Anda.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <button onClick={() => setView("dashboard")} className="px-6 py-3 rounded-xl bg-cta-gradient text-accent-foreground font-semibold text-base shadow-card hover:shadow-card-hover transition-shadow">
                  Mulai Gratis Sekarang →
                </button>
                <button onClick={() => setView("umkm-template")} className="px-6 py-3 rounded-xl border-2 border-border text-foreground font-semibold text-base hover:bg-muted transition-colors">
                  <Eye className="w-4 h-4 inline mr-2" /> Lihat Demo Toko
                </button>
              </div>
              <div className="flex items-center gap-4 mt-8 text-sm text-muted-foreground">
                <div className="flex -space-x-2">
                  {["SK", "BE", "DF"].map((a, i) => (
                    <div key={i} className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-[10px] font-bold text-primary-foreground border-2 border-background">
                      {a}
                    </div>
                  ))}
                </div>
                <span><strong className="text-foreground">2,500+</strong> UMKM sudah bergabung</span>
              </div>
            </div>
            <div className="relative">
              <div className="absolute -inset-4 bg-secondary/10 rounded-3xl blur-3xl" />
              <img src={heroImg} alt="Platform UMKM ElVision" className="relative w-full rounded-2xl shadow-card-hover" />
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="fitur" className="py-16 md:py-24">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">Semua yang UMKM Butuhkan</h2>
              <p className="text-muted-foreground max-w-lg mx-auto">Fitur lengkap untuk menjalankan bisnis online Anda, dari website hingga manajemen order.</p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {FEATURES.map((f, i) => (
                <div key={i} className="group p-6 rounded-2xl bg-card shadow-card hover:shadow-card-hover transition-all duration-300 border border-transparent hover:border-secondary/30">
                  <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center mb-4 group-hover:bg-secondary/20 transition-colors">
                    <f.icon className="w-6 h-6 text-secondary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{f.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section id="harga" className="py-16 md:py-24 bg-dark-section">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold mb-3">Harga Terjangkau untuk Semua</h2>
              <p className="text-dark-bg-foreground/60 max-w-lg mx-auto">Mulai gratis, upgrade sesuai kebutuhan bisnis Anda.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {PRICING.map((p, i) => (
                <div key={i} className={`relative rounded-2xl p-6 ${p.popular ? "bg-card text-foreground ring-2 ring-secondary scale-105" : "bg-dark-bg-foreground/5 text-dark-bg-foreground"}`}>
                  {p.popular && <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent-gradient text-accent-foreground text-xs font-bold px-4 py-1 rounded-full">POPULER</div>}
                  <h3 className="font-semibold text-lg mb-1">{p.name}</h3>
                  <div className="flex items-baseline gap-1 mb-6">
                    <span className="text-3xl font-extrabold">{p.price}</span>
                    <span className={`text-sm ${p.popular ? "text-muted-foreground" : "text-dark-bg-foreground/50"}`}>{p.period}</span>
                  </div>
                  <ul className="space-y-3 mb-6">
                    {p.features.map((f, j) => (
                      <li key={j} className="flex items-center gap-2 text-sm">
                        <Check className={`w-4 h-4 flex-shrink-0 ${p.popular ? "text-secondary" : "text-secondary"}`} />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <button onClick={() => setView("dashboard")} className={`w-full py-3 rounded-xl font-semibold text-sm transition-opacity hover:opacity-90 ${p.popular ? "bg-cta-gradient text-accent-foreground" : "bg-dark-bg-foreground/10 text-dark-bg-foreground hover:bg-dark-bg-foreground/20"}`}>
                    {p.cta}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section id="testimoni" className="py-16 md:py-24">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">Dipercaya UMKM Seluruh Indonesia</h2>
              <p className="text-muted-foreground">Cerita nyata dari pemilik usaha yang sudah merasakan manfaatnya.</p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {TESTIMONIALS.map((t, i) => (
                <div key={i} className="p-6 rounded-2xl bg-card shadow-card border hover:shadow-card-hover transition-shadow">
                  <div className="flex gap-1 mb-3">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <Star key={j} className={`w-4 h-4 ${j < t.rating ? "text-accent fill-accent" : "text-muted"}`} />
                    ))}
                  </div>
                  <p className="text-sm text-foreground mb-4 leading-relaxed">"{t.text}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-primary-foreground">{t.avatar}</div>
                    <div>
                      <div className="font-semibold text-sm text-foreground">{t.name}</div>
                      <div className="text-xs text-muted-foreground">{t.biz}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="py-16 md:py-24 bg-muted/50">
          <div className="max-w-2xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">Pertanyaan Umum</h2>
              <p className="text-muted-foreground">Jawaban untuk pertanyaan yang sering ditanyakan.</p>
            </div>
            <div className="space-y-3">
              {FAQS.map((f, i) => (
                <div key={i} className="rounded-xl bg-card shadow-card overflow-hidden">
                  <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex items-center justify-between p-4 text-left">
                    <span className="font-medium text-sm text-foreground">{f.q}</span>
                    {openFaq === i ? <ChevronUp className="w-4 h-4 text-muted-foreground flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />}
                  </button>
                  {openFaq === i && (
                    <div className="px-4 pb-4 text-sm text-muted-foreground leading-relaxed">{f.a}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Final */}
        <section className="py-16 md:py-24">
          <div className="max-w-3xl mx-auto px-4 text-center">
            <div className="p-8 md:p-12 rounded-3xl bg-hero-gradient text-primary-foreground">
              <h2 className="text-2xl md:text-3xl font-bold mb-3">Siap Bawa Bisnis Anda Go Online?</h2>
              <p className="text-primary-foreground/70 mb-8 max-w-md mx-auto">Bergabung dengan 2,500+ UMKM yang sudah punya website sendiri. Gratis, tanpa coding.</p>
              <button onClick={() => setView("dashboard")} className="px-8 py-3 rounded-xl bg-cta-gradient text-accent-foreground font-semibold text-base shadow-card hover:shadow-card-hover transition-shadow">
                Buat Website Gratis Sekarang →
              </button>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t py-8">
          <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-accent-gradient flex items-center justify-center">
                <Zap className="w-3 h-3 text-accent-foreground" />
              </div>
              <span className="font-semibold text-foreground">ElVision<span className="text-secondary">UMKM</span></span>
            </div>
            <p>© 2025 ElVision Group. Semua hak dilindungi.</p>
            <div className="flex gap-4">
              <Shield className="w-4 h-4" />
              <span>Data Aman & Terenkripsi</span>
            </div>
          </div>
        </footer>
      </div>
    );
  }

  // ========== DASHBOARD ==========
  if (view === "dashboard") {
    const stats = [
      { label: "Total Order", value: "156", icon: Package, change: "+12 hari ini", color: "text-secondary" },
      { label: "Revenue Bulan Ini", value: "Rp 4.2jt", icon: DollarSign, change: "+18%", color: "text-success" },
      { label: "Pengunjung Hari Ini", value: "84", icon: Users, change: "+23%", color: "text-accent" },
      { label: "Produk Aktif", value: "6", icon: TrendingUp, change: "2 baru", color: "text-primary" },
    ];

    return (
      <div className="min-h-screen bg-muted/30">
        {/* Dashboard Header */}
        <header className="bg-card border-b sticky top-0 z-40">
          <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={() => setView("home")} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
                <ArrowLeft className="w-4 h-4 text-muted-foreground" />
              </button>
              <div className="flex items-center gap-2">
                <Store className="w-5 h-5 text-secondary" />
                <span className="font-bold text-foreground">Dashboard</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setView("umkm-template")} className="text-xs font-medium px-3 py-1.5 rounded-lg bg-secondary/10 text-secondary hover:bg-secondary/20 transition-colors">
                <Eye className="w-3 h-3 inline mr-1" /> Lihat Toko
              </button>
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-primary-foreground">WS</div>
            </div>
          </div>
        </header>

        <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
          <div>
            <h1 className="text-xl font-bold text-foreground">Selamat Datang, Warung Sejahtera! 👋</h1>
            <p className="text-sm text-muted-foreground">Berikut ringkasan toko Anda hari ini.</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((s, i) => (
              <div key={i} className="p-4 rounded-xl bg-card shadow-card border">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-muted-foreground font-medium">{s.label}</span>
                  <s.icon className={`w-4 h-4 ${s.color}`} />
                </div>
                <div className="text-xl font-bold text-foreground">{s.value}</div>
                <div className="text-xs text-success font-medium mt-1">{s.change}</div>
              </div>
            ))}
          </div>

          {/* Products */}
          <div className="rounded-xl bg-card shadow-card border overflow-hidden">
            <div className="p-4 border-b flex items-center justify-between">
              <h2 className="font-semibold text-foreground">Produk</h2>
              <button className="text-xs font-medium px-3 py-1.5 rounded-lg bg-cta-gradient text-accent-foreground flex items-center gap-1">
                <Plus className="w-3 h-3" /> Tambah
              </button>
            </div>
            <div className="divide-y">
              {SAMPLE_PRODUCTS.map((p) => (
                <div key={p.id} className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-xl">{p.image}</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm text-foreground truncate">{p.name}</div>
                    <div className="text-xs text-muted-foreground">{formatRp(p.price)}</div>
                  </div>
                  <div className="flex gap-1">
                    <button className="p-1.5 rounded-lg hover:bg-muted transition-colors"><Pencil className="w-3.5 h-3.5 text-muted-foreground" /></button>
                    <button className="p-1.5 rounded-lg hover:bg-destructive/10 transition-colors"><Trash2 className="w-3.5 h-3.5 text-destructive" /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Orders */}
          <div className="rounded-xl bg-card shadow-card border overflow-hidden">
            <div className="p-4 border-b">
              <h2 className="font-semibold text-foreground">Order Masuk</h2>
            </div>
            <div className="divide-y">
              {SAMPLE_ORDERS.map((o) => (
                <div key={o.id} className="p-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-sm text-foreground">#{o.id} — {o.customer}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${statusColors[o.status]}`}>{o.status}</span>
                  </div>
                  <div className="text-xs text-muted-foreground mb-1">{o.items}</div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{o.date}</span>
                    <span className="text-sm font-semibold text-foreground">{formatRp(o.total)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Settings */}
          <div className="rounded-xl bg-card shadow-card border p-4 space-y-4">
            <h2 className="font-semibold text-foreground">Pengaturan Toko</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { label: "Nama Toko", value: "Warung Sejahtera" },
                { label: "Nomor WhatsApp", value: "08123456789" },
                { label: "Rekening", value: "BCA - 1234567890" },
                { label: "Alamat", value: "Jl. Merdeka No. 45, Jakarta" },
              ].map((s, i) => (
                <div key={i}>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">{s.label}</label>
                  <div className="px-3 py-2 rounded-lg bg-muted text-sm text-foreground">{s.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ========== UMKM TEMPLATE (Generated Store Page) ==========
  return (
    <div className="min-h-screen bg-background">
      {/* Store Header */}
      <header className="bg-card border-b sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-accent-gradient flex items-center justify-center text-sm">🏪</div>
            <span className="font-bold text-foreground">Warung Sejahtera</span>
          </div>
          <div className="flex items-center gap-3 text-muted-foreground">
            <a href="https://wa.me/08123456789" target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs font-medium hover:text-secondary transition-colors">
              <MessageCircle className="w-4 h-4" /> Chat
            </a>
            <button onClick={() => setView("home")} className="text-xs text-muted-foreground hover:text-foreground">← Kembali</button>
          </div>
        </div>
      </header>

      {/* Store Banner */}
      <section className="bg-hero-gradient text-primary-foreground py-10 md:py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="text-4xl mb-3">🏪</div>
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Warung Sejahtera</h1>
          <p className="text-primary-foreground/70 text-sm">Makanan rumahan lezat dengan harga terjangkau. Pesan sekarang!</p>
          <div className="flex items-center justify-center gap-4 mt-4 text-xs text-primary-foreground/60">
            <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> Jakarta</span>
            <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> 08123456789</span>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-8 md:py-12">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-lg font-bold text-foreground mb-6">Menu Kami</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {SAMPLE_PRODUCTS.map((p) => (
              <div key={p.id} className="rounded-xl bg-card shadow-card border overflow-hidden group hover:shadow-card-hover transition-shadow">
                <div className="h-24 md:h-32 bg-muted flex items-center justify-center text-4xl">{p.image}</div>
                <div className="p-3">
                  <h3 className="font-semibold text-sm text-foreground">{p.name}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{p.desc}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-sm font-bold text-secondary">{formatRp(p.price)}</span>
                    <a
                      href={`#order`}
                      className="text-[10px] font-semibold px-2.5 py-1 rounded-lg bg-cta-gradient text-accent-foreground"
                    >
                      Pesan
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Order Form */}
      <section id="order" className="py-8 md:py-12 bg-muted/50">
        <div className="max-w-lg mx-auto px-4">
          <h2 className="text-lg font-bold text-foreground mb-2">Form Pemesanan</h2>
          <p className="text-sm text-muted-foreground mb-6">Isi data di bawah, pesanan akan dikirim ke WhatsApp kami.</p>
          <div className="space-y-4 rounded-xl bg-card shadow-card border p-5">
            {[
              { label: "Nama Lengkap", key: "nama" as const, type: "text", placeholder: "Masukkan nama Anda" },
              { label: "Nomor WhatsApp", key: "wa" as const, type: "tel", placeholder: "08xxxxxxxxxx" },
              { label: "Alamat Pengiriman", key: "alamat" as const, type: "text", placeholder: "Jl. ..." },
            ].map((f) => (
              <div key={f.key}>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">{f.label}</label>
                <input
                  type={f.type}
                  placeholder={f.placeholder}
                  value={orderForm[f.key]}
                  onChange={(e) => setOrderForm({ ...orderForm, [f.key]: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-lg border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-secondary/50"
                />
              </div>
            ))}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Pilih Menu</label>
              <select
                value={orderForm.produk}
                onChange={(e) => setOrderForm({ ...orderForm, produk: e.target.value })}
                className="w-full px-3 py-2.5 rounded-lg border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-secondary/50"
              >
                <option value="">-- Pilih Menu --</option>
                {SAMPLE_PRODUCTS.map((p) => (
                  <option key={p.id} value={p.name}>{p.name} - {formatRp(p.price)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Jumlah</label>
              <input
                type="number"
                min="1"
                value={orderForm.qty}
                onChange={(e) => setOrderForm({ ...orderForm, qty: e.target.value })}
                className="w-full px-3 py-2.5 rounded-lg border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-secondary/50"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Catatan (opsional)</label>
              <textarea
                placeholder="Contoh: tanpa pedas, extra sambal..."
                value={orderForm.catatan}
                onChange={(e) => setOrderForm({ ...orderForm, catatan: e.target.value })}
                rows={2}
                className="w-full px-3 py-2.5 rounded-lg border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-secondary/50 resize-none"
              />
            </div>
            <a
              href={`https://wa.me/08123456789?text=${encodeURIComponent(`Halo, saya ingin pesan:\n\nNama: ${orderForm.nama}\nMenu: ${orderForm.produk}\nJumlah: ${orderForm.qty}\nAlamat: ${orderForm.alamat}\nCatatan: ${orderForm.catatan}`)}`}
              target="_blank"
              rel="noreferrer"
              className="w-full py-3 rounded-xl bg-cta-gradient text-accent-foreground font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
            >
              <Send className="w-4 h-4" /> Kirim Pesanan via WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* Payment Info */}
      <section className="py-8 md:py-12">
        <div className="max-w-lg mx-auto px-4">
          <h2 className="text-lg font-bold text-foreground mb-4">Info Pembayaran</h2>
          <div className="rounded-xl bg-card shadow-card border p-5 space-y-3">
            <div className="flex items-center justify-between py-2 border-b">
              <span className="text-sm text-muted-foreground">Bank BCA</span>
              <span className="text-sm font-semibold text-foreground">1234567890 (a.n Warung Sejahtera)</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-muted-foreground">QRIS</span>
              <span className="text-sm font-semibold text-secondary">Tersedia ✓</span>
            </div>
            <p className="text-xs text-muted-foreground pt-2">Kirim bukti transfer ke WhatsApp setelah melakukan pembayaran.</p>
          </div>
        </div>
      </section>

      {/* Store Footer */}
      <footer className="border-t bg-card py-8">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-3">
          <div className="flex items-center justify-center gap-4 text-muted-foreground">
            <a href="#" className="hover:text-secondary transition-colors"><Instagram className="w-5 h-5" /></a>
            <a href="#" className="hover:text-secondary transition-colors"><Facebook className="w-5 h-5" /></a>
            <a href="https://wa.me/08123456789" target="_blank" rel="noreferrer" className="hover:text-secondary transition-colors"><MessageCircle className="w-5 h-5" /></a>
          </div>
          <div className="text-sm text-muted-foreground">
            <MapPin className="w-3 h-3 inline mr-1" /> Jl. Merdeka No. 45, Jakarta Selatan
          </div>
          <p className="text-xs text-muted-foreground">Dibuat dengan ❤️ oleh <button onClick={() => setView("home")} className="text-secondary hover:underline">ElVisionUMKM</button></p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
