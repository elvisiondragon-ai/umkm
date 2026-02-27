import { useState, useEffect } from "react";
import {
  Globe, ShoppingCart, MessageCircle, BarChart3, Zap, Shield, Smartphone,
  Star, ChevronDown, ChevronUp, Check, Plus, Pencil, Trash2, Eye,
  Package, TrendingUp, Users, DollarSign, ArrowLeft, Store, Menu, X,
  Send, MapPin, Phone, Instagram, Facebook, Home, LogOut, LayoutDashboard,
  Settings, User as UserIcon, UploadCloud, Image as ImageIcon, CheckCircle2,
  Lock, ArrowRight, Activity, Inbox
} from "lucide-react";
import { supabase } from "../lib/supabase";

// ==================== TYPES ====================
type View = "home" | "dashboard" | "tools" | "umkm-template" | "login" | "create-store" | "settings" | "profile";
type OrderStatus = "baru" | "proses" | "kirim" | "selesai";

interface Product {
  id: string;
  store_id: string;
  name: string;
  price: number;
  image_url: string;
  description: string;
}

interface DBStore {
  id: string;
  user_id: string;
  alias: string;
  name: string;
  logo_url: string;
  theme_color: string;
  wa_number: string;
  address: string;
  payment_info: string;
  capi?: string;
  pixel?: string;
}

interface Order {
  id: string;
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
  { id: "1", store_id: "demo", name: "Nasi Goreng Spesial", price: 25000, image_url: "", description: "Nasi goreng dengan telur, ayam, dan sayuran segar" },
  { id: "2", store_id: "demo", name: "Mie Ayam Bakso", price: 20000, image_url: "", description: "Mie ayam dengan bakso sapi pilihan" },
  { id: "3", store_id: "demo", name: "Es Teh Manis", price: 5000, image_url: "", description: "Teh manis segar dengan es batu" },
  { id: "4", store_id: "demo", name: "Ayam Geprek", price: 22000, image_url: "", description: "Ayam geprek dengan sambal level pilihan" },
  { id: "5", store_id: "demo", name: "Soto Ayam", price: 18000, image_url: "", description: "Soto ayam kuah bening dengan nasi" },
  { id: "6", store_id: "demo", name: "Jus Alpukat", price: 12000, image_url: "", description: "Jus alpukat segar dengan susu coklat" },
];

const SAMPLE_ORDERS: Order[] = [
  { id: "1001", customer: "Ahmad", wa: "08123456789", items: "2x Nasi Goreng, 1x Es Teh", total: 55000, status: "baru", date: "Hari ini, 14:30" },
  { id: "1002", customer: "Rina", wa: "08198765432", items: "1x Ayam Geprek, 1x Jus Alpukat", total: 34000, status: "proses", date: "Hari ini, 13:15" },
  { id: "1003", customer: "Dedi", wa: "08112233445", items: "3x Mie Ayam Bakso", total: 60000, status: "kirim", date: "Hari ini, 11:00" },
  { id: "1004", customer: "Siti", wa: "08155667788", items: "1x Soto Ayam, 2x Es Teh", total: 28000, status: "selesai", date: "Kemarin, 19:45" },
];

// ==================== HELPERS ====================
const formatRp = (n: number) => `Rp ${n.toLocaleString("id-ID")}`;

// Helper to compress image
const compressImage = (file: File, maxWidth = 800, maxFileKB = 100): Promise<File> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);

        let quality = 0.9;
        const testCompression = () => {
          canvas.toBlob(
            (blob) => {
              if (blob) {
                const kb = blob.size / 1024;
                if (kb > maxFileKB && quality > 0.1) {
                  quality -= 0.1;
                  testCompression();
                } else {
                  const compressedFile = new File([blob], file.name, {
                    type: "image/jpeg",
                    lastModified: Date.now(),
                  });
                  resolve(compressedFile);
                }
              } else {
                reject(new Error("Canvas toBlob failed"));
              }
            },
            "image/jpeg",
            quality
          );
        };
        testCompression();
      };
      img.onerror = (error) => reject(error);
    };
    reader.onerror = (error) => reject(error);
  });
};

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
  const [orderForm, setOrderForm] = useState({ nama: "", wa: "", alamat: "", produk: "", qty: "1", catatan: "" });
  const [setupForm, setSetupForm] = useState({
    storeName: "",
    description: "",
    waNumber: "",
    theme: "light",
    bankAccount: "",
    address: "",
    email: "",
    password: "",
    products: [
      { id: Date.now(), name: "", description: "", price: "" }
    ]
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [user, setUser] = useState<any>(null);
  const [store, setStore] = useState<DBStore | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });

  // Mock Data for Demo (Toko Mandiri)
  const mockStats = [
    { label: "Total Order", value: "142", icon: Package, change: "+12% hari ini", color: "text-secondary" },
    { label: "Revenue Bulan Ini", value: "Rp 2.450.000", icon: DollarSign, change: "+8% hari ini", color: "text-success" },
    { label: "Pengunjung Hari Ini", value: "850", icon: Users, change: "+24% hari ini", color: "text-accent" },
    { label: "Produk Aktif", value: "12", icon: TrendingUp, change: "", color: "text-primary" },
  ];

  const mockProducts = [
    { id: 1, name: "Nasi Goreng Spesial", price: 25000, description: "Nasi goreng dengan bumbu rahasia, telur mata sapi, dan kerupuk udang.", image_url: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&q=80&w=200" },
    { id: 2, name: "Ayam Bakar Madu", price: 35000, description: "Ayam bakar empuk dengan olesan madu murni dan sambal terasi.", image_url: "https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?auto=format&fit=crop&q=80&w=200" },
    { id: 3, name: "Es Teh Manis Jumbo", price: 5000, description: "Kesegaran teh pilihan dengan gula asli dalam ukuran jumbo.", image_url: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&q=80&w=200" },
  ];

  const mockOrders = [
    { id: "1001", customer: "Budi Santoso", status: "selesai", items: "2x Nasi Goreng, 1x Es Teh", total: 55000, date: "Hari ini, 12:30" },
    { id: "1002", customer: "Siti Aminah", status: "proses", items: "1x Ayam Bakar, 1x Es Teh", total: 40000, date: "Hari ini, 13:15" },
    { id: "1003", customer: "Agus Setiawan", status: "baru", items: "3x Nasi Goreng", total: 75000, date: "Hari ini, 14:05" },
  ];

  // New product editing state
  const [newProduct, setNewProduct] = useState({ name: "", description: "", price: "", imageFile: null as File | null });
  const [isSavingProduct, setIsSavingProduct] = useState(false);
  const [storeSettingsForm, setStoreSettingsForm] = useState({ name: "", alias: "", waNumber: "", address: "", theme: "", payment: "", logo_url: "", capi: "", pixel: "" });
  const [isSavingStore, setIsSavingStore] = useState(false);

  const fetchStoreData = async (userId: string) => {
    try {
      const { data: storeData } = await supabase
        .from('stores')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (storeData) {
        setStore(storeData);
        setStoreSettingsForm({
          name: storeData.name,
          alias: storeData.alias,
          waNumber: storeData.wa_number,
          address: storeData.address || "",
          theme: storeData.theme_color,
          payment: storeData.payment_info || "",
          logo_url: storeData.logo_url || "",
          capi: storeData.capi || "",
          pixel: storeData.pixel || ""
        });
        const { data: productsData } = await supabase
          .from('products')
          .select('*')
          .eq('store_id', storeData.id);
        if (productsData) setProducts(productsData);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    // Only use onAuthStateChange — handles both initial session and changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user || null);
        if (session?.user) {
          fetchStoreData(session.user.id);
          setView("dashboard");
        } else if (event === 'SIGNED_OUT') {
          setStore(null);
          setProducts([]);
          setOrders([]);
          setView("home");
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = async () => {
    try {
      setErrorMsg("");
      setIsLoading(true);

      if (!loginForm.email || !loginForm.password) {
        throw new Error("Email dan Password harus diisi.");
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginForm.email,
        password: loginForm.password,
      });

      if (error) throw error;

      // onAuthStateChange will handle the rest (setUser, fetchStoreData, setView)
    } catch (e: any) {
      setErrorMsg(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async () => {
    try {
      setErrorMsg("");
      setIsLoading(true);

      // 1. Basic Validation
      if (!setupForm.email || !setupForm.password || !setupForm.storeName || !setupForm.waNumber) {
        throw new Error("Mohon lengkapi Email, Password, Nama Toko, dan Nomor WhatsApp.");
      }

      // 2. Supabase Auth Sign Up
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: setupForm.email,
        password: setupForm.password,
        options: {
          data: {
            email_confirm: true
          }
        }
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error("Gagal membuat user");

      // If signUp didn't create a session, force sign in with same credentials
      if (!authData.session) {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: setupForm.email,
          password: setupForm.password,
        });
        if (signInError) {
          console.warn("Auto sign-in after signup failed:", signInError.message);
        }
      }

      const userId = authData.user.id;

      // Profile row is auto-created by handle_new_user() trigger on auth.users
      // No manual insert needed — the trigger handles it

      // 3. Generate alias and create store
      const alias = setupForm.storeName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      const { data: storeData, error: storeError } = await supabase
        .from('stores')
        .insert({
          user_id: userId,
          name: setupForm.storeName,
          alias: alias,
          theme_color: setupForm.theme === 'dark' ? '#000000' : setupForm.theme === 'colorful' ? '#ff5722' : '#ffffff',
          wa_number: setupForm.waNumber,
          address: setupForm.address,
          payment_info: setupForm.bankAccount
        })
        .select('id')
        .single();

      if (storeError) {
        console.error("storeError", storeError);
        // If alias is taken, it will throw a unique constraint error
        if (storeError.code === '23505') throw new Error("Nama toko (alias) sudah digunakan. Tolong ganti nama toko Anda.");
        throw new Error("Gagal membuat toko: " + storeError.message);
      }

      // 5. Insert Products (filter out empty ones)
      const validProducts = setupForm.products.filter(p => p.name && p.price).map(p => ({
        store_id: storeData.id,
        name: p.name,
        price: parseFloat(p.price),
        description: p.description
      }));

      if (validProducts.length > 0) {
        const { error: productsError } = await supabase
          .from('products')
          .insert(validProducts);

        if (productsError) {
          console.error("productsError", productsError);
          throw new Error("Gagal menyimpan menu: " + productsError.message);
        }
      }

      // Success → reload to let onAuthStateChange detect the session
      alert("Toko Berhasil Dibuat! \n\nSilakan kelola toko Anda di Dashboard.");
      window.location.reload();

    } catch (error: any) {
      console.error("FULL REGISTER ERROR:", error);
      setErrorMsg(error.message || "Terjadi kesalahan saat pendaftaran");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveStoreSettings = async () => {
    if (!store?.id) return;
    setIsSavingStore(true);
    try {
      const { error } = await supabase.from('stores').update({
        name: storeSettingsForm.name,
        alias: storeSettingsForm.alias,
        wa_number: storeSettingsForm.waNumber,
        address: storeSettingsForm.address,
        theme_color: storeSettingsForm.theme,
        payment_info: storeSettingsForm.payment,
        logo_url: storeSettingsForm.logo_url,
        capi: storeSettingsForm.capi,
        pixel: storeSettingsForm.pixel
      }).eq('id', store.id);

      if (error) throw error;
      await fetchStoreData(user.id);
      alert("Pengaturan toko berhasil disimpan!");
    } catch (e: any) {
      alert("Gagal menyimpan: " + e.message);
    } finally {
      setIsSavingStore(false);
    }
  };

  const handleSaveProduct = async () => {
    if (!store?.id || !newProduct.name || !newProduct.price) return;
    setIsSavingProduct(true);
    try {
      let image_url = "";
      // Handle Image Upload with Compression
      if (newProduct.imageFile) {
        const compressed = await compressImage(newProduct.imageFile, 800, 100);
        const fileName = `${store.alias}/${Date.now()}-${compressed.name}`;

        const { error: uploadError, data: uploadData } = await supabase.storage
          .from('Stores')
          .upload(fileName, compressed, { cacheControl: '3600', upsert: false });

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
          .from('Stores')
          .getPublicUrl(fileName);
        image_url = publicUrlData.publicUrl;
      }

      const { error } = await supabase.from('products').insert({
        store_id: store.id,
        name: newProduct.name,
        description: newProduct.description,
        price: parseFloat(newProduct.price),
        image_url: image_url
      });

      if (error) throw error;

      setNewProduct({ name: "", description: "", price: "", imageFile: null });
      await fetchStoreData(user.id);
      alert("Produk berhasil ditambahkan!");
    } catch (e: any) {
      alert("Gagal menambah produk: " + e.message);
    } finally {
      setIsSavingProduct(false);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setView("home");
      window.scrollTo(0, 0);
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  // ========== SHARED COMPONENTS ==========
  const mobileBottomNav = (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 pb-safe bg-card border-t shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
      <div className="flex items-center justify-around p-2">
        {user ? (
          <>
            <button onClick={() => { setView("dashboard"); setTimeout(() => window.scrollTo(0, 0), 10); }} className={`flex flex-col items-center gap-1 p-2 transition-all duration-300 ${(view as string) === 'dashboard' ? 'text-amber-600 font-extrabold scale-110' : 'text-muted-foreground hover:text-amber-600'}`}>
              <BarChart3 className="w-5 h-5 flex-shrink-0" />
              <span className="text-[10px]">Status</span>
            </button>
            <button onClick={() => { setView("create-store"); setTimeout(() => window.scrollTo(0, 0), 10); }} className={`flex flex-col items-center gap-1 p-2 transition-all duration-300 ${(view as string) === 'create-store' ? 'text-amber-600 font-extrabold scale-110' : 'text-muted-foreground hover:text-amber-600'}`}>
              <Store className="w-5 h-5 flex-shrink-0" />
              <span className="text-[10px]">Stores</span>
            </button>
            <button onClick={() => { setView("tools"); setTimeout(() => window.scrollTo(0, 0), 10); }} className={`flex flex-col items-center gap-1 p-2 transition-all duration-300 ${(view as string) === 'tools' ? 'text-amber-600 font-extrabold scale-110' : 'text-muted-foreground hover:text-amber-600'}`}>
              <Zap className="w-5 h-5 flex-shrink-0" />
              <span className="text-[10px]">Tools</span>
            </button>
            <button onClick={() => { setView("profile"); setTimeout(() => window.scrollTo(0, 0), 10); }} className={`flex flex-col items-center gap-1 p-2 transition-all duration-300 ${(view as string) === 'profile' ? 'text-amber-600 font-extrabold scale-110' : 'text-muted-foreground hover:text-amber-600'}`}>
              <UserIcon className="w-5 h-5 flex-shrink-0" />
              <span className="text-[10px]">Profile</span>
            </button>
          </>
        ) : (
          <>

            <button onClick={() => { setView("login"); window.scrollTo(0, 0); }} className={`flex flex-col items-center gap-1 p-2 transition-all duration-300 ${(view as string) === 'login' ? 'text-secondary drop-shadow-[0_0_8px_rgba(var(--secondary),0.5)] scale-110' : 'text-muted-foreground hover:text-foreground'}`}>
              <Users className="w-5 h-5 flex-shrink-0" />
              <span className="text-[10px] font-medium">Sign in</span>
              {(view as string) === 'login' && <div className="w-1 h-1 rounded-full bg-secondary mt-0.5 animate-pulse" />}
            </button>
          </>
        )}
      </div>
    </div>
  );

  // ========== HOME PAGE ==========
  if (view === "home") {
    return (
      <div className="min-h-screen bg-background relative pb-20 md:pb-0">
        {/* Top Navbar */}
        <nav className="sticky top-0 z-50 bg-card/80 backdrop-blur-lg border-b hidden md:block shadow-sm">
          <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img src="/umkm-logo.png" alt="Logo UMKM" className="w-8 h-8 rounded-[10px] object-cover bg-white p-[2px]" />
              <span className="font-bold text-lg text-foreground">ElVision<span className="text-secondary">UMKM</span></span>
            </div>
            <div className="flex items-center gap-8 text-sm font-medium text-muted-foreground transition-colors">

            </div>
            <div className="flex items-center gap-3">
              {user ? (
                <>
                  <button onClick={() => setView("profile")} className="hidden lg:flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mr-2">
                    <UserIcon className="w-4 h-4" /> Profile
                  </button>
                  <button onClick={() => setView("dashboard")} className="flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-lg bg-secondary/10 text-secondary hover:bg-secondary/20 transition-colors">
                    <Store className="w-4 h-4" /> Edit Toko
                  </button>
                </>
              ) : (
                <>
                  <button onClick={() => setView("login")} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Sign in</button>
                  <button onClick={() => setView("login")} className="px-5 py-2.5 rounded-xl bg-cta-gradient text-accent-foreground font-bold shadow-card hover:shadow-card-hover transition-all text-sm">
                    Buat Website Sekarang →
                  </button>
                </>
              )}
            </div>
          </div>
        </nav>

        {/* Mobile Header (simplified) */}
        <nav className="sticky top-0 z-50 bg-card/80 backdrop-blur-lg border-b md:hidden shadow-sm">
          <div className="px-4 h-14 flex items-center justify-center">
            <div className="flex items-center gap-2">
              <img src="/umkm-logo.png" alt="Logo UMKM" className="w-7 h-7 rounded-[8px] object-cover bg-white p-[2px]" />
              <span className="font-bold text-foreground">ElVision<span className="text-secondary">UMKM</span></span>
            </div>
          </div>
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
              <div className="flex flex-col sm:flex-row gap-4">
                <button onClick={() => setView("login")} className="px-10 py-4 rounded-xl bg-cta-gradient text-accent-foreground shadow-card hover:shadow-card-hover transition-all font-bold text-xl">
                  Mulai Buat Toko — Gratis →
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
              <img src="/umkm.jpeg" alt="Platform UMKM ElVision" className="relative w-full rounded-2xl shadow-card-hover" />
            </div>
          </div>
        </section>

        {/* Features Row */}
        <section id="fitur" className="py-16 bg-muted/30">
          <div className="max-w-6xl mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {FEATURES.map((f, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-card rounded-xl border shadow-sm">
                  <f.icon className="w-5 h-5 text-secondary shrink-0" />
                  <span className="text-xs font-bold text-foreground leading-tight">{f.title}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Demo Section - Embedded Mockup */}
        <section className="py-24 relative overflow-hidden bg-background">
          <div className="max-w-6xl mx-auto px-4 grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/10 text-secondary text-xs font-bold mb-6">
                <Eye className="w-3 h-3" /> LIVE PREVIEW
              </div>
              <h2 className="text-3xl md:text-5xl font-extrabold text-foreground leading-tight mb-6">
                Lihat Dashboard <span className="text-secondary">Toko Mandiri</span>
              </h2>
              <p className="text-lg text-muted-foreground mb-10 leading-relaxed">
                Ini adalah tampilan dashboard yang akan Anda kelola. Pantau pesanan masuk secara real-time dan kelola produk Anda dengan sangat mudah seolah-olah menggunakan aplikasi HP.
              </p>

              <div className="space-y-6">
                {[
                  { title: "Statistik Real-time", desc: "Pantau pengunjung dan revenue harian.", icon: BarChart3 },
                  { title: "Manajemen Produk", desc: "Tambah/edit produk cuma butuh hitungan detik.", icon: Package },
                  { title: "Notifikasi Pesanan", desc: "Orderan masuk langsung muncul di dashboard & WA.", icon: ShoppingCart },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-4 p-4 rounded-2xl hover:bg-muted transition-colors">
                    <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center shrink-0">
                      <item.icon className="w-5 h-5 text-secondary" />
                    </div>
                    <div>
                      <h4 className="font-bold text-foreground">{item.title}</h4>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-12">
                <button onClick={() => setView("login")} className="px-8 py-4 rounded-xl bg-secondary text-white font-extrabold text-lg shadow-xl hover:-translate-y-1 transition-all">
                  Mulai Buat Sekarang →
                </button>
              </div>
            </div>

            <div className="relative">
              {/* Mobile Phone Mockup */}
              <div className="mx-auto w-[320px] h-[640px] border-[8px] border-slate-900 rounded-[3rem] bg-slate-900 shadow-2xl relative overflow-hidden ring-4 ring-slate-800">
                {/* Selfie notch */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-900 rounded-b-2xl z-50"></div>

                {/* Content Container (Simulated App) */}
                <div className="w-full h-full bg-muted/20 overflow-y-auto scrollbar-hide text-[10px]">
                  {/* Internal Header */}
                  <header className="bg-gradient-to-r from-amber-500 to-yellow-400 p-4 pt-8 sticky top-0 z-40 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Store className="w-4 h-4 text-amber-950" />
                        <span className="font-bold text-amber-950 text-xs">Toko Mandiri</span>
                      </div>
                      <div className="w-6 h-6 rounded-full bg-amber-950 flex items-center justify-center font-bold text-amber-400 text-[8px]">T</div>
                    </div>
                  </header>

                  <div className="p-4 space-y-4">
                    <div>
                      <h3 className="font-bold text-foreground text-xs">Selamat Datang! 👋</h3>
                      <p className="text-muted-foreground text-[8px]">Kelola toko Anda di bawah ini.</p>
                    </div>

                    {/* Compact Stats */}
                    <div className="grid grid-cols-2 gap-2">
                      {mockStats.slice(0, 4).map((s, i) => (
                        <div key={i} className="p-2 rounded-lg bg-card border shadow-sm">
                          <div className="flex items-center justify-between mb-1 opacity-60">
                            <span className="scale-75 origin-left">{s.label}</span>
                            <s.icon className={`w-3 h-3 ${s.color}`} />
                          </div>
                          <div className="font-bold text-[9px] truncate">{s.value}</div>
                        </div>
                      ))}
                    </div>

                    {/* Simple Product List */}
                    <div className="rounded-xl bg-card border shadow-sm overflow-hidden text-[8px]">
                      <div className="p-2 border-b bg-muted/10 font-bold flex items-center gap-1">
                        <Package className="w-3 h-3 text-secondary" /> Produk (12)
                      </div>
                      <div className="p-2 space-y-2">
                        {mockProducts.map(p => (
                          <div key={p.id} className="flex gap-2 p-1.5 rounded-lg border bg-background">
                            <div className="w-8 h-8 rounded-md bg-muted overflow-hidden">
                              <img src={p.image_url} alt="" className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-bold truncate">{p.name}</div>
                              <div className="text-secondary font-bold">{formatRp(p.price)}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Simple Order List */}
                    <div className="rounded-xl bg-card border shadow-sm overflow-hidden text-[8px]">
                      <div className="p-2 border-b bg-muted/10 font-bold flex items-center gap-1">
                        <ShoppingCart className="w-3 h-3 text-primary" /> Pesanan Baru
                      </div>
                      <div className="p-2 space-y-2">
                        {mockOrders.slice(0, 2).map(o => (
                          <div key={o.id} className="p-2 rounded-lg border bg-background border-l-2 border-l-primary/30">
                            <div className="flex justify-between items-center mb-1">
                              <span className="font-bold">#{o.id} — {o.customer}</span>
                              <span className="bg-primary/10 text-primary px-1 rounded-full text-[6px]">BARU</span>
                            </div>
                            <div className="opacity-60">{o.items}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Decorative elements */}
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-secondary/5 rounded-full blur-3xl -z-10 animate-pulse"></div>
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl -z-10 animate-pulse" style={{ animationDelay: '1s' }}></div>
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

        {/* Apa Tools Kami? Section (Light Theme) */}
        {!user && (
          <section className="py-20 bg-background border-t">
            <div className="max-w-6xl mx-auto px-4">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4">Apa Tools Kami?</h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Gunakan teknologi terbaik untuk melejitkan bisnis UMKM Anda.</p>
              </div>

              <div className="grid md:grid-cols-3 gap-8 mb-16">
                {[
                  { id: 1, title: "CAPI Ads Booster", desc: "Konversi penjualan meningkat 2x lipat dengan pelacakan data iklan yang lebih akurat.", icon: Activity, color: "text-blue-500", bg: "bg-blue-50" },
                  { id: 2, title: "Image Promo Generator", desc: "Satu klik buat poster promosi cantik untuk sosial media & status WA Anda.", icon: ImageIcon, color: "text-purple-500", bg: "bg-purple-50" },
                  { id: 3, title: "Edukasi Jualan Laris", desc: "Akses tips & trik jualan dari praktisi agar dagangan Anda dicari pelanggan.", icon: Zap, color: "text-orange-500", bg: "bg-orange-50" },
                ].map(tool => (
                  <div key={tool.id} className="p-8 rounded-3xl bg-card border shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col items-center text-center gap-4 group">
                    <div className={`w-16 h-16 rounded-2xl ${tool.bg} flex items-center justify-center ${tool.color} shadow-inner group-hover:scale-110 transition-transform`}>
                      <tool.icon className="w-8 h-8" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-foreground mb-2">{tool.id}. {tool.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{tool.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="max-w-3xl mx-auto p-12 rounded-[40px] bg-muted/50 border border-border text-center relative overflow-hidden group shadow-xl">
                <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-64 h-64 bg-primary/5 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-700" />
                <div className="relative z-10">
                  <h3 className="text-2xl font-extrabold text-foreground mb-2">Mau Buat Sekarang?</h3>
                  <p className="text-muted-foreground mb-8 font-medium">Akses semua fitur di atas dengan mendaftarkan toko Anda.</p>
                  <button onClick={() => setView("login")} className="px-12 py-5 rounded-2xl bg-primary text-primary-foreground font-extrabold text-xl shadow-card hover:shadow-card-hover hover:scale-105 transition-all active:scale-95">
                    MULAI SEKARANG — SIGN IN
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}

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
              <button onClick={() => setView("login")} className="px-10 py-4 rounded-xl bg-cta-gradient text-accent-foreground shadow-card hover:shadow-card-hover transition-all font-bold text-xl inline-block">
                Mulai Sekarang — Sign in
              </button>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t py-8 pb-24 md:pb-8">
          <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <img src="/umkm-logo.png" alt="Logo UMKM" className="w-6 h-6 rounded-[6px] object-cover bg-white p-[1px]" />
              <span className="font-semibold text-foreground">ElVision<span className="text-secondary">UMKM</span></span>
            </div>
            <p>© 2025 ElVision Group. Semua hak dilindungi.</p>
            <div className="flex gap-4">
              <Shield className="w-4 h-4" />
              <span>Data Aman & Terenkripsi</span>
            </div>
          </div>
        </footer>
        {mobileBottomNav}
      </div>
    );
  }

  const stats = [
    { label: "Total Order", value: orders.length.toString(), icon: Package, change: "", color: "text-secondary" },
    { label: "Revenue Bulan Ini", value: "Rp 0", icon: DollarSign, change: "", color: "text-success" },
    { label: "Pengunjung Hari Ini", value: "0", icon: Users, change: "", color: "text-accent" },
    { label: "Produk Aktif", value: products.length.toString(), icon: TrendingUp, change: "", color: "text-primary" },
  ];

  const dashboardContent = (
    <div className="bg-muted/30 pb-12 w-full">
      {/* Dashboard Header - Golden Gradient */}
      <header className="bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 border-b border-amber-600 sticky top-0 z-40 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setView("home")} className="hidden md:flex p-1.5 rounded-lg hover:bg-black/10 transition-colors">
              <ArrowLeft className="w-4 h-4 text-amber-950" />
            </button>
            <div className="flex items-center gap-2">
              <Store className="w-5 h-5 text-amber-950" />
              <span className="font-bold text-amber-950">Dashboard</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setView("profile")} className="hidden md:flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-lg bg-black/10 text-amber-950 hover:bg-black/20 transition-colors">
              <UserIcon className="w-3 h-3" /> Profile
            </button>
            <div className="w-8 h-8 rounded-full bg-amber-950 flex items-center justify-center text-xs font-bold text-amber-400 border border-amber-300">
              {store?.name?.charAt(0).toUpperCase() || (user?.email?.charAt(0).toUpperCase() || 'U')}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        <div>
          <h1 className="text-xl font-bold text-foreground">Selamat Datang, {user?.email}! 👋</h1>
          <p className="text-sm text-muted-foreground">Berikut ringkasan performa toko Anda hari ini.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s, i) => (
            <div key={i} className="p-4 rounded-xl bg-card shadow-sm border border-border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground font-medium">{s.label}</span>
                <s.icon className={`w-4 h-4 ${s.color}`} />
              </div>
              <div className="text-2xl font-bold text-foreground">{s.value}</div>
              {s.change && <div className="text-xs text-success font-medium mt-1">{s.change}</div>}
            </div>
          ))}
        </div>

        {/* Dashboard Grid for Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Products List */}
          <div className="rounded-xl bg-card shadow-sm border overflow-hidden flex flex-col h-96">
            <div className="p-4 border-b flex items-center justify-between bg-muted/20">
              <h2 className="font-semibold text-foreground flex items-center gap-2"><Package className="w-4 h-4 text-secondary" /> Produk Aktif</h2>
            </div>
            <div className="overflow-y-auto flex-1 p-2">
              {products.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-muted-foreground p-6 text-center">
                  <Package className="w-12 h-12 mb-3 text-muted" />
                  <p className="font-semibold text-sm">Belum ada produk.</p>
                  <p className="text-xs mt-1">Tambahkan produk Anda di menu Publish.</p>
                </div>
              ) : (
                <div className="divide-y space-y-1">
                  {products.map((p) => (
                    <div key={p.id} className="p-3 flex items-center gap-3 rounded-lg hover:bg-muted/20 transition-colors">
                      <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center overflow-hidden border">
                        {p.image_url ? (
                          <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                        ) : (
                          <ImageIcon className="w-5 h-5 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm text-foreground truncate">{p.name}</div>
                        <div className="text-xs text-secondary font-medium">{formatRp(p.price)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Orders List */}
          <div className="rounded-xl bg-card shadow-sm border overflow-hidden flex flex-col h-96">
            <div className="p-4 border-b bg-muted/20">
              <h2 className="font-semibold text-foreground flex items-center gap-2"><ShoppingCart className="w-4 h-4 text-primary" /> Order Masuk Terakhir</h2>
            </div>
            <div className="overflow-y-auto flex-1 p-2">
              {orders.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-muted-foreground p-6 text-center">
                  <Inbox className="w-12 h-12 mb-3 text-muted" />
                  <p className="font-semibold text-sm">Belum ada orderan masuk.</p>
                  <p className="text-xs mt-1">Pesan dari customer akan muncul di sini.</p>
                </div>
              ) : (
                <div className="divide-y space-y-1">
                  {orders.map((o) => (
                    <div key={o.id} className="p-4 rounded-lg hover:bg-muted/20 transition-colors">
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
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const storeContent = (
    <div className="bg-background w-full">
      {/* Store Header */}
      <header className="bg-card border-b sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-accent-gradient flex items-center justify-center text-sm">
              {store?.logo_url ? <img src={store.logo_url} className="w-full h-full object-cover rounded-lg" alt="logo" /> : '🏪'}
            </div>
            <span className="font-bold text-foreground truncate max-w-[150px]">{store?.name || "READY SHOP Warung Sejahtera"}</span>
          </div>
          <div className="flex items-center gap-3 text-muted-foreground">
            <a href={`https://wa.me/${store?.wa_number || ''}`} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs font-medium hover:text-secondary transition-colors">
              <MessageCircle className="w-4 h-4" /> Chat
            </a>
            <button onClick={() => setView("dashboard")} className="hidden md:block text-xs text-muted-foreground hover:text-foreground">← Kembali</button>
          </div>
        </div>
      </header>

      {/* Store Banner */}
      <section className="py-10 md:py-16 text-primary-foreground" style={{ backgroundColor: store?.theme_color || '#1E3A5F' }}>
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="text-4xl mb-3">🏪</div>
          <h1 className="text-2xl md:text-3xl font-bold mb-2">{store?.name || "READY SHOP Warung Sejahtera"}</h1>
          <div className="flex items-center justify-center gap-4 mt-4 text-xs text-primary-foreground/90">
            {store?.address && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {store.address}</span>}
            <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {store?.wa_number || "-"}</span>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-8 md:py-12">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-lg font-bold text-foreground mb-6 border-b pb-2">Menu Kami</h2>
          {products.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-muted-foreground italic text-sm">Belum ada menu yang diterbitkan.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {products.map((p) => (
                <div key={p.id} className="rounded-xl bg-card shadow-sm border overflow-hidden group hover:shadow-card-hover transition-shadow flex flex-col">
                  <div className="aspect-square bg-muted flex items-center justify-center overflow-hidden">
                    {p.image_url ? (
                      <img src={p.image_url} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="text-4xl">📦</div>
                    )}
                  </div>
                  <div className="p-3 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-semibold text-sm text-foreground line-clamp-2">{p.name}</h3>
                      {p.description && <p className="text-[10px] text-muted-foreground mt-1 line-clamp-2">{p.description}</p>}
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-sm font-bold text-secondary">{formatRp(p.price)}</span>
                      <a href={`https://wa.me/${store?.wa_number || ''}?text=${encodeURIComponent(`Halo, saya ingin order: ${p.name}`)}`} target="_blank" rel="noreferrer" className="text-[10px] font-semibold px-3 py-1.5 rounded-lg bg-secondary/10 text-secondary hover:bg-secondary/20 transition-colors">
                        Beli
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
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
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Pesan Detail Tambahan</label>
            <textarea
              placeholder="Contoh: Saya ingin order Nasi Goreng Spesial 2 porsi, dikirim ke alamat X..."
              value={orderForm.catatan}
              onChange={(e) => setOrderForm({ ...orderForm, catatan: e.target.value })}
              rows={3}
              className="w-full px-3 py-2.5 rounded-lg border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-secondary/50 resize-none"
            />
          </div>
          <a
            href={`https://wa.me/${store?.wa_number || ''}?text=${encodeURIComponent(`Halo ${store?.name || 'Admin'},\n\nNama: ${orderForm.nama}\nAlamat: ${orderForm.alamat}\n\nPesanan:\n${orderForm.catatan}`)}`}
            target="_blank"
            rel="noreferrer"
            className="w-full py-3 rounded-xl bg-success/10 border border-success/30 text-success font-semibold text-sm flex items-center justify-center gap-2 hover:bg-success hover:text-white transition-all shadow-sm"
          >
            <Send className="w-4 h-4" /> Pesan via WhatsApp
          </a>
        </div>
      </section>

      {/* Payment Info */}
      <section className="py-8 md:py-12">
        <div className="max-w-lg mx-auto px-4">
          <h2 className="text-lg font-bold text-foreground mb-4">Info Pembayaran</h2>
          <div className="rounded-xl bg-card shadow-card border p-5 space-y-3">
            <div className="flex items-center justify-between py-2 border-b">
              <span className="text-sm text-muted-foreground">Bank</span>
              <span className="text-sm font-semibold text-foreground">{store?.payment_info || 'Rekening Penjual'}</span>
            </div>
            <p className="text-xs text-muted-foreground pt-2 border-t mt-2">Pastikan nama rekening sesuai dan simpan bukti transfer untuk keamanan.</p>
          </div>
        </div>
      </section>

      {/* Store Footer */}
      <footer className="border-t bg-card py-8">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-3">
          <div className="flex items-center justify-center gap-4 text-muted-foreground">
            <a href="#" className="hover:text-secondary transition-colors"><Instagram className="w-5 h-5" /></a>
            <a href="#" className="hover:text-secondary transition-colors"><Facebook className="w-5 h-5" /></a>
            <a href={`https://wa.me/${store?.wa_number || ''}`} target="_blank" rel="noreferrer" className="hover:text-secondary transition-colors"><MessageCircle className="w-5 h-5" /></a>
          </div>
          <div className="text-sm text-muted-foreground">
            <MapPin className="w-3 h-3 inline mr-1" /> {store?.address || "Indonesia"}
          </div>
          <p className="text-xs text-muted-foreground">Dibuat dengan ❤️ oleh <button onClick={() => setView("home")} className="text-secondary hover:underline">ElVisionUMKM</button></p>
        </div>
      </footer>
    </div>
  );



  const toolsContent = user ? (
    <div className="w-full bg-muted/30 pb-20 md:pb-0">
      <header className="bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 border-b border-amber-600 sticky top-0 z-40 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-center gap-3">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-950" />
            <span className="font-bold text-amber-950">Tools & Marketing</span>
          </div>
        </div>
      </header>
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">

        {/* CAPI Settings */}
        <div className="bg-card rounded-2xl shadow-sm border p-6">
          <div className="flex items-center gap-3 border-b pb-4 mb-4">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Activity className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-bold text-lg">CAPI Ads Booster</h3>
              <p className="text-xs text-muted-foreground">Tingkatkan konversi dengan Conversion API Meta.</p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-foreground mb-1 block">CAPI Token</label>
              <input
                type="text"
                placeholder="EAAI..."
                value={storeSettingsForm.capi}
                onChange={(e) => setStoreSettingsForm({ ...storeSettingsForm, capi: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-secondary/50"
              />
            </div>
            <button
              onClick={handleSaveStoreSettings}
              disabled={isSavingStore}
              className="w-full py-3 rounded-xl bg-blue-600 text-white font-bold shadow-sm hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {isSavingStore ? "Menyimpan..." : "Simpan Konfigurasi CAPI"}
            </button>
          </div>
        </div>

        {/* Other Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Sosmed Shares */}
          <div className="bg-card rounded-2xl shadow-sm border p-6 flex flex-col items-center text-center gap-3 hover:border-secondary/30 transition-all cursor-pointer">
            <div className="w-14 h-14 rounded-full bg-pink-100 flex items-center justify-center">
              <Instagram className="w-6 h-6 text-pink-500" />
            </div>
            <div>
              <h4 className="font-bold">Sosmed Shares</h4>
              <p className="text-xs text-muted-foreground">Bagikan toko langsung ke media sosial.</p>
            </div>
          </div>

          {/* Image Generator */}
          <div className="bg-card rounded-2xl shadow-sm border p-6 flex flex-col items-center text-center gap-3 hover:border-secondary/30 transition-all cursor-pointer">
            <div className="w-14 h-14 rounded-full bg-purple-100 flex items-center justify-center">
              <ImageIcon className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h4 className="font-bold">Image Generator</h4>
              <p className="text-xs text-muted-foreground">Buat banner promosi otomatis dengan AI.</p>
            </div>
          </div>

          {/* Education */}
          <div className="bg-card rounded-2xl shadow-sm border p-6 flex flex-col items-center text-center gap-3 md:col-span-2 hover:border-secondary/30 transition-all cursor-pointer">
            <div className="w-14 h-14 rounded-full bg-orange-100 flex items-center justify-center">
              <Zap className="w-6 h-6 text-orange-500" />
            </div>
            <div>
              <h4 className="font-bold">Edukasi Jualan Laris</h4>
              <p className="text-xs text-muted-foreground">Strategi meningkatkan omset dari master UMKM.</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  ) : (
    <div className="w-full bg-muted/30 pb-20 md:pb-0">
      <header className="bg-card border-b sticky top-0 z-40 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setView("home")} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
              <ArrowLeft className="w-4 h-4 text-muted-foreground" />
            </button>
            <span className="font-bold text-foreground">Tools & Fitur</span>
          </div>
          <button onClick={() => setView("login")} className="text-xs font-bold px-3 py-1.5 rounded-lg bg-secondary text-white shadow-sm">Sign in</button>
        </div>
      </header>

      <div className="max-w-md mx-auto px-4 py-8 space-y-8">
        <div className="text-center">
          <h1 className="text-2xl font-extrabold text-foreground mb-2">Apa Tools Kami?</h1>
          <p className="text-sm text-muted-foreground italic">Gunakan teknologi terbaik untuk melejitkan bisnis UMKM Anda.</p>
        </div>

        <div className="space-y-4">
          {[
            { id: 1, title: "CAPI Ads Booster", desc: "Konversi penjualan meningkat 2x lipat dengan pelacakan data iklan yang lebih akurat.", icon: Activity, color: "bg-blue-500" },
            { id: 2, title: "Image Promo Generator", desc: "Satu klik buat poster promosi cantik untuk sosial media & status WA Anda.", icon: ImageIcon, color: "bg-purple-500" },
            { id: 3, title: "Edukasi Jualan Laris", desc: "Akses tips & trik jualan dari praktisi agar dagangan Anda dicari pelanggan.", icon: Zap, color: "bg-orange-500" },
          ].map(tool => (
            <div key={tool.id} className="p-5 rounded-2xl bg-card border shadow-sm flex items-start gap-4 group hover:border-secondary/30 transition-all">
              <div className={`w-12 h-12 rounded-xl ${tool.color} flex items-center justify-center text-white shrink-0 shadow-lg group-hover:scale-110 transition-transform`}>
                <tool.icon className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-foreground tracking-tight">{tool.id}. {tool.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{tool.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-gradient-to-br from-secondary/10 to-primary/10 p-8 rounded-3xl border border-secondary/20 text-center relative overflow-hidden group">
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-40 h-40 bg-secondary/5 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000" />
          <h2 className="text-xl font-bold text-foreground mb-4">Mau Buat Sekarang?</h2>
          <p className="text-sm text-muted-foreground mb-6">Akses semua fitur di atas dengan mendaftarkan toko Anda.</p>
          <button onClick={() => setView("login")} className="w-full py-4 rounded-2xl bg-secondary text-white font-extrabold text-lg shadow-xl hover:-translate-y-1 transition-all active:scale-95">
            MULAI SEKARANG — SIGN IN
          </button>
        </div>
      </div>
    </div>
  );

  const profileContent = (
    <div className="w-full bg-muted/30">
      <header className="bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 border-b border-amber-600 sticky top-0 z-40 shadow-sm">
        <div className="max-w-md mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setView("dashboard")} className="p-1.5 rounded-lg hover:bg-black/10 transition-colors">
              <ArrowLeft className="w-4 h-4 text-amber-950" />
            </button>
            <span className="font-bold text-amber-950">Profil Penjual</span>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-lg bg-black/10 text-amber-950 hover:bg-destructive hover:text-white transition-all">
            <LogOut className="w-3 h-3" /> Logout
          </button>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        <div className="bg-card rounded-2xl shadow-sm border p-8 flex flex-col items-center text-center max-w-md mx-auto">
          <div className="w-24 h-24 rounded-full bg-secondary/10 flex items-center justify-center text-secondary mb-4 border-2 border-secondary/20 shadow-inner">
            <UserIcon className="w-12 h-12" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-1">{user?.email}</h2>
          <p className="text-sm text-muted-foreground flex items-center gap-1 font-medium bg-muted px-3 py-1 rounded-full">
            <Shield className="w-3 h-3" /> Merchant Verified
          </p>
        </div>

        <div className="bg-card rounded-2xl shadow-sm border overflow-hidden max-w-md mx-auto">
          <div className="p-4 border-b bg-muted/10 font-bold text-sm">Informasi Akun & Toko</div>
          <div className="p-6 space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-dashed">
              <span className="text-sm text-muted-foreground">ID Penjual</span>
              <span className="text-xs font-mono text-foreground truncate max-w-[150px]">{user?.id}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-dashed">
              <span className="text-sm text-muted-foreground">Nama Toko</span>
              <span className="text-sm font-bold text-foreground">{store?.name || "-"}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-dashed">
              <span className="text-sm text-muted-foreground">Username / Alias</span>
              <span className="text-xs font-mono text-secondary">@{store?.alias}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-muted-foreground">Status Berlangganan</span>
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-success/10 text-success">LIFETIME FREE</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-md mx-auto">
          <button className="col-span-1 md:col-span-2 p-4 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-600 text-white font-bold shadow-lg flex items-center justify-center gap-2 hover:opacity-90 transition-opacity">
            <Star className="w-5 h-5 fill-white" /> UPGRADE TO PRO
          </button>
        </div>
      </div>
    </div>
  );

  const loginContent = (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-card rounded-2xl shadow-card border p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <img src="/umkm-logo.png" alt="Logo UMKM" className="w-full h-full rounded-2xl object-cover bg-white p-[2px] shadow-sm" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Login Penjual</h1>
          <p className="text-sm text-muted-foreground mt-2">Masuk untuk mengelola toko UMKM Anda</p>
        </div>

        <div className="space-y-4">
          {errorMsg && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-lg text-center">
              {errorMsg}
            </div>
          )}
          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">Email</label>
            <input
              type="email"
              placeholder="nama@email.com"
              value={loginForm.email}
              onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-secondary/50"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={loginForm.password}
              onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-secondary/50"
            />
          </div>
          <button
            onClick={handleLogin}
            disabled={isLoading}
            className="w-full py-3 rounded-xl bg-cta-gradient text-accent-foreground font-bold shadow-card hover:opacity-90 transition-opacity mt-2 disabled:opacity-50"
          >
            {isLoading ? "Memproses..." : "Masuk ke Dashboard"}
          </button>
        </div>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          Belum punya akun? <button onClick={() => setView("create-store")} className="text-secondary font-semibold hover:underline">Register disini</button>
        </div>
      </div>
    </div>
  );

  const createStoreContent = (
    <div className="min-h-screen bg-muted/30 pb-24 md:pb-12 pt-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8 relative">
          <button onClick={() => setView("home")} className="absolute left-0 top-1/2 -translate-y-1/2 p-2 rounded-lg hover:bg-muted transition-colors">
            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
          </button>
          <h1 className="text-2xl font-bold text-foreground text-center">Buat Toko Online Anda</h1>
          <p className="text-sm text-muted-foreground mt-2 text-center">Isi detail di bawah untuk membuat website khusus toko Anda. (Bisa diedit nanti)</p>
        </div>
        {errorMsg && (
          <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-lg text-center animate-in fade-in slide-in-from-bottom-2">
            {errorMsg}
          </div>
        )}

        <div className="bg-card rounded-2xl shadow-card border p-6 md:p-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-foreground mb-1 block">Nama Toko <span className="text-destructive">*</span></label>
              <input
                type="text"
                placeholder="Misal: Warung Sejahtera"
                value={setupForm.storeName}
                onChange={(e) => setSetupForm({ ...setupForm, storeName: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-secondary/50"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-foreground mb-1 block">Deskripsi Singkat</label>
              <textarea
                placeholder="Misal: Menjual berbagai macam aneka makanan..."
                value={setupForm.description}
                onChange={(e) => setSetupForm({ ...setupForm, description: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 rounded-xl border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-secondary/50 resize-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-foreground mb-1 block">Nomor WhatsApp <span className="text-destructive">*</span></label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">+62</span>
                  <input
                    type="tel"
                    placeholder="81234567890"
                    value={setupForm.waNumber}
                    onChange={(e) => setSetupForm({ ...setupForm, waNumber: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 rounded-xl border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-secondary/50"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold text-foreground mb-1 block">Tema Toko</label>
                <select
                  value={setupForm.theme}
                  onChange={(e) => setSetupForm({ ...setupForm, theme: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-secondary/50"
                >
                  <option value="light">Terang (Default)</option>
                  <option value="dark">Gelap (Elegant)</option>
                  <option value="colorful">Penuh Warna</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-foreground mb-1 block">Rekening Pembayaran (Opsional)</label>
                <input
                  type="text"
                  placeholder="BCA - 1234567890 a/n Budi"
                  value={setupForm.bankAccount}
                  onChange={(e) => setSetupForm({ ...setupForm, bankAccount: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-secondary/50"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-foreground mb-1 block">Alamat Toko (Opsional)</label>
                <input
                  type="text"
                  placeholder="Jl. Merdeka No. 45..."
                  value={setupForm.address}
                  onChange={(e) => setSetupForm({ ...setupForm, address: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-secondary/50"
                />
              </div>
            </div>

            {/* Products Section */}
            <div className="pt-6 border-t mt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <Package className="w-4 h-4" /> Menu / Produk Toko
                </h3>
                <button
                  onClick={() => setSetupForm({ ...setupForm, products: [...setupForm.products, { id: Date.now(), name: "", description: "", price: "" }] })}
                  className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-secondary/10 text-secondary hover:bg-secondary/20 transition-colors flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" /> Tambah Produk
                </button>
              </div>

              <div className="space-y-4">
                {setupForm.products.map((p, index) => (
                  <div key={p.id} className="p-4 rounded-xl border bg-muted/30 relative">
                    {setupForm.products.length > 1 && (
                      <button
                        onClick={() => setSetupForm({ ...setupForm, products: setupForm.products.filter(item => item.id !== p.id) })}
                        className="absolute top-2 right-2 p-1.5 text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-semibold text-muted-foreground mb-1 block">Nama Produk</label>
                        <input
                          type="text"
                          placeholder="Misal: Nasi Goreng Spesial"
                          value={p.name}
                          onChange={(e) => {
                            const newProducts = [...setupForm.products];
                            newProducts[index].name = e.target.value;
                            setSetupForm({ ...setupForm, products: newProducts });
                          }}
                          className="w-full px-3 py-2 rounded-lg border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-secondary/50"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-muted-foreground mb-1 block">Harga (Rp)</label>
                        <input
                          type="number"
                          placeholder="25000"
                          value={p.price}
                          onChange={(e) => {
                            const newProducts = [...setupForm.products];
                            newProducts[index].price = e.target.value;
                            setSetupForm({ ...setupForm, products: newProducts });
                          }}
                          className="w-full px-3 py-2 rounded-lg border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-secondary/50"
                        />
                      </div>
                    </div>
                    <div className="mt-3">
                      <label className="text-xs font-semibold text-muted-foreground mb-1 block">Deskripsi Produk (Opsional)</label>
                      <input
                        type="text"
                        placeholder="Misal: Telur mata sapi, ayam suwir, krupuk..."
                        value={p.description}
                        onChange={(e) => {
                          const newProducts = [...setupForm.products];
                          newProducts[index].description = e.target.value;
                          setSetupForm({ ...setupForm, products: newProducts });
                        }}
                        className="w-full px-3 py-2 rounded-lg border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-secondary/50"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-6 border-t">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2 mb-4">
              <Users className="w-4 h-4" /> Informasi Akun Login
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="text-sm font-semibold text-foreground mb-1 block">Alamat Email <span className="text-destructive">*</span></label>
                <input
                  type="email"
                  placeholder="nama@email.com"
                  value={setupForm.email}
                  onChange={(e) => setSetupForm({ ...setupForm, email: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-secondary/50"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-foreground mb-1 block">Password <span className="text-destructive">*</span></label>
                <input
                  type="password"
                  placeholder="Minimal 6 karakter"
                  value={setupForm.password}
                  onChange={(e) => setSetupForm({ ...setupForm, password: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-secondary/50"
                />
              </div>
            </div>

            <button
              onClick={handleRegister}
              disabled={isLoading}
              className="w-full py-4 rounded-xl bg-cta-gradient text-accent-foreground font-bold text-lg shadow-card hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <span>Memproses...</span>
              ) : (
                <>
                  <img src="/umkm-logo.png" alt="Logo UMKM" className="w-6 h-6 rounded-[8px] object-cover bg-white p-[1px]" />
                  Buat Website Sekarang!
                </>
              )}
            </button>
            <p className="text-xs text-center text-muted-foreground mt-3">
              Dengan mengklik tombol di atas, Anda telah membuat akun sekaligus website untuk toko Anda.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const manageStoreContent = user ? (
    <div className="min-h-screen bg-muted/30 pb-24 md:pb-12">
      <header className="bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 border-b border-amber-600 sticky top-0 z-40 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-center gap-3">
          <div className="flex items-center gap-2">
            <Store className="w-5 h-5 text-amber-950" />
            <span className="font-bold text-amber-950">Kelola Toko</span>
          </div>
        </div>
      </header>
      <div className="max-w-2xl mx-auto pt-8 px-4">

        <div className="bg-card rounded-2xl shadow-card border p-6 md:p-8 space-y-8">
          {/* Store Settings Section */}
          <div>
            <h3 className="text-lg font-bold text-foreground border-b pb-2 mb-4">Informasi Toko</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-foreground mb-1 block">Nama Toko</label>
                <input
                  type="text"
                  value={storeSettingsForm.name}
                  onChange={(e) => setStoreSettingsForm({ ...storeSettingsForm, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-secondary/50"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-foreground mb-1 block">Web URL (Alias)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">/</span>
                  <input
                    type="text"
                    value={storeSettingsForm.alias}
                    onChange={(e) => setStoreSettingsForm({ ...storeSettingsForm, alias: e.target.value })}
                    className="w-full pl-8 pr-4 py-3 rounded-xl border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-secondary/50"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">Ubah alias url untuk toko Anda.</p>
              </div>
              <div>
                <label className="text-sm font-semibold text-foreground mb-1 block">Logo URL (Preview Image)</label>
                <input
                  type="text"
                  placeholder="https://... (URL gambar logo toko)"
                  value={storeSettingsForm.logo_url}
                  onChange={(e) => setStoreSettingsForm({ ...storeSettingsForm, logo_url: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-secondary/50"
                />
              </div>
              <button
                onClick={handleSaveStoreSettings}
                disabled={isSavingStore}
                className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold shadow-sm hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {isSavingStore ? "Menyimpan..." : "Simpan Perubahan Toko"}
              </button>
            </div>
          </div>

          {/* Product Management Section */}
          <div className="pt-6 border-t">
            <h3 className="text-lg font-bold text-foreground border-b pb-2 mb-4">Kelola Produk</h3>
            <div className="space-y-4">
              {/* New Product Form */}
              <div className="p-4 rounded-xl border bg-muted/20 space-y-4 mb-6">
                <h4 className="font-semibold text-sm">Tambah Produk Baru</h4>
                <div className="flex flex-col gap-3">
                  <input
                    type="text"
                    placeholder="Nama Produk"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                    className="w-full px-3 py-3 rounded-xl border bg-background text-sm focus:ring-2 focus:ring-secondary/50 focus:outline-none"
                  />
                  <input
                    type="number"
                    placeholder="Harga (Rp)"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                    className="w-full px-3 py-3 rounded-xl border bg-background text-sm focus:ring-2 focus:ring-secondary/50 focus:outline-none"
                  />
                </div>
                <input
                  type="text"
                  placeholder="Deskripsi (Opsional)"
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                  className="w-full px-3 py-3 rounded-xl border bg-background text-sm mt-3 focus:ring-2 focus:ring-secondary/50 focus:outline-none"
                />
                <div className="flex flex-col gap-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setNewProduct({ ...newProduct, imageFile: e.target.files?.[0] || null })}
                    className="text-xs w-full p-2 border rounded-lg bg-background"
                  />
                  <button
                    onClick={handleSaveProduct}
                    disabled={isSavingProduct || !newProduct.name || !newProduct.price}
                    className="w-full px-4 py-3 rounded-xl bg-secondary text-white text-sm font-bold shadow-sm disabled:opacity-50 hover:opacity-90 transition-opacity"
                  >
                    {isSavingProduct ? "Menyimpan..." : "Tambah Produk"}
                  </button>
                </div>
              </div>

              {/* Existing Products List */}
              <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                {products.map((p) => (
                  <div key={p.id} className="flex gap-4 p-3 rounded-xl border bg-background items-center">
                    <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
                      {p.image_url ? <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" /> : <Package className="w-5 h-5 text-muted-foreground" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-sm truncate">{p.name}</h4>
                      <span className="text-secondary font-bold text-xs">{formatRp(p.price)}</span>
                    </div>
                    <button className="p-2 text-destructive hover:bg-destructive/10 rounded-lg">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Preview Action */}
          <div className="pt-6 border-t mt-8">
            <button onClick={() => { setShowPreview(true); setView("umkm-template"); setTimeout(() => window.scrollTo(0, 0), 10); }} className="w-full py-4 rounded-xl bg-cta-gradient text-accent-foreground font-bold text-lg shadow-card hover:-translate-y-1 transition-all flex justify-center items-center gap-2">
              <Eye className="w-5 h-5" /> Lihat Tampilan Pembeli
            </button>
          </div>
        </div>
      </div>
    </div>
  ) : null;

  // ========== RENDER LOGIC ==========
  if (view === "login") {
    return (
      <div className="min-h-screen relative">
        {loginContent}
        {mobileBottomNav}
      </div>
    );
  }

  if (view === "create-store") {
    return (
      <div className="min-h-[100dvh] relative pb-20 md:pb-0 bg-muted/30">
        {user ? manageStoreContent : createStoreContent}
        {mobileBottomNav}
      </div>
    );
  }

  if (view === "tools") {
    return (
      <div className="min-h-screen pb-20 md:pb-0 relative bg-muted/30">
        {toolsContent}
        {mobileBottomNav}
      </div>
    );
  }

  if (view === "dashboard") {
    return (
      <div className="min-h-screen pb-20 md:pb-0 relative">
        <div className="max-w-md mx-auto min-h-screen bg-muted/30 pb-10">
          {dashboardContent}
        </div>
        {mobileBottomNav}
      </div>
    );
  }

  if (view === "profile") {
    return (
      <div className="min-h-screen pb-20 md:pb-0 relative">
        <div className="max-w-md mx-auto min-h-screen bg-muted/30">
          {profileContent}
        </div>
        {mobileBottomNav}
      </div>
    );
  }

  if (view === "umkm-template") {
    // Determine data to show (Real or Mock)
    const activeStoreName = user ? (store?.name || "Toko Anda") : "Toko Mandiri";
    const activeProducts = user ? products : mockProducts;
    const activeOrders = user ? orders : mockOrders;
    const activeStats = user ? stats : mockStats;

    if (showPreview) {
      // Buyer View (Live Preview)
      // For Demo, we use a placeholder store UI if no user
      const demoStoreContent = (
        <div className="flex flex-col h-full bg-white">
          <div className="p-6 bg-gradient-to-b from-primary/10 to-transparent">
            <h1 className="text-3xl font-extrabold text-foreground mb-2">{activeStoreName}</h1>
            <p className="text-muted-foreground line-clamp-2">Contoh Toko UMKM yang sukses menggunakan platform kami.</p>
          </div>
          <div className="p-4 space-y-6">
            <h2 className="font-bold text-lg border-b pb-2">Menu Produk</h2>
            <div className="space-y-4">
              {activeProducts.map(p => (
                <div key={p.id} className="flex gap-4 p-3 rounded-xl border border-border/50 hover:border-primary/30 transition-colors">
                  <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                    <img src={p.image_url || "/placeholder.svg"} className="w-full h-full object-cover" alt={p.name} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-sm">{p.name}</h3>
                    <p className="text-[10px] text-muted-foreground line-clamp-2 mb-2">{p.description}</p>
                    <p className="text-sm font-bold text-primary">{formatRp(p.price)}</p>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full py-4 rounded-2xl bg-primary text-primary-foreground font-extrabold text-lg shadow-lg">
              PESAN VIA WHATSAPP
            </button>
          </div>
        </div>
      );

      return (
        <div className="min-h-screen bg-muted flex flex-col items-center pb-24 relative">
          <div className="w-full bg-primary text-primary-foreground p-4 flex items-center justify-between sticky top-0 z-50 shadow-md">
            <div className="font-bold text-lg flex items-center gap-2">
              <Eye className="w-5 h-5" /> Mode Pembeli (Preview)
            </div>
            <button onClick={() => setShowPreview(false)} className="text-sm font-semibold hover:underline bg-primary-foreground/20 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1">
              <Pencil className="w-4 h-4" /> Kembali ke Dashboard
            </button>
          </div>
          <div className="w-full max-w-md mx-auto mt-4 md:mt-12 bg-background border rounded-2xl shadow-2xl overflow-hidden min-h-[800px]">
            {user ? storeContent : demoStoreContent}
          </div>
        </div>
      );
    }

    // Dashboard/Editor View
    return (
      <div className="min-h-screen pb-20 md:pb-0 relative bg-muted/30">
        <div className="max-w-md mx-auto min-h-screen bg-card shadow-xl overflow-hidden">
          <header className={`${user ? "bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 border-b border-amber-600" : "bg-card border-b"} sticky top-0 z-40 shadow-sm`}>
            <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button onClick={() => setView(user ? "dashboard" : "home")} className="p-1.5 rounded-lg hover:bg-black/10 text-amber-950 transition-colors">
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-2">
                  <Store className={`w-5 h-5 ${user ? "text-amber-950" : "text-secondary"}`} />
                  <span className={`font-bold text-lg ${user ? "text-amber-950" : "text-foreground"}`}>{user ? "Editor Website" : "Demo Dashboard"}</span>
                </div>
              </div>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border ${user ? "bg-amber-950 text-amber-400 border-amber-300" : "bg-primary text-primary-foreground"}`}>
                {store?.name?.charAt(0).toUpperCase() || (user?.email?.charAt(0).toUpperCase() || 'M')}
              </div>
            </div>
          </header>

          <div className="px-4 py-8 space-y-8">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Selamat Datang di {activeStoreName}! 👋</h1>
              <p className="text-sm text-muted-foreground">{user ? "Kelola toko Anda di bawah ini." : "Ini adalah contoh Dashboard toko UMKM yang sudah jadi."}</p>
            </div>

            {/* Stats Bar */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {activeStats.map((s, i) => (
                <div key={i} className="p-4 rounded-xl bg-card shadow-sm border border-border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted-foreground font-medium">{s.label}</span>
                    <s.icon className={`w-4 h-4 ${s.color}`} />
                  </div>
                  <div className="text-2xl font-bold text-foreground">{s.value}</div>
                  {s.change && <div className="text-xs text-success font-medium mt-1">{s.change}</div>}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Products Card */}
              <div className="rounded-2xl bg-card shadow-sm border overflow-hidden flex flex-col h-[500px]">
                <div className="p-4 border-b flex items-center justify-between bg-muted/20">
                  <h2 className="font-bold text-foreground flex items-center gap-2"><Package className="w-4 h-4 text-secondary" /> Produk ({activeProducts.length})</h2>
                  {!user && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-secondary/10 text-secondary uppercase animate-pulse">Running Live</span>}
                </div>
                <div className="overflow-y-auto flex-1 p-4 space-y-4">
                  {activeProducts.map((p) => (
                    <div key={p.id} className="p-3 flex items-center gap-4 rounded-xl border bg-background group">
                      <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center overflow-hidden border-2 border-transparent group-hover:border-secondary/20 transition-all">
                        <img src={p.image_url || "/placeholder.svg"} alt={p.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-sm text-foreground truncate">{p.name}</div>
                        <div className="text-[10px] text-muted-foreground line-clamp-1 mb-1">{p.description}</div>
                        <div className="text-xs font-bold text-secondary">{formatRp(p.price)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Orders Card */}
              <div className="rounded-2xl bg-card shadow-sm border overflow-hidden flex flex-col h-[500px]">
                <div className="p-4 border-b bg-muted/20 flex items-center justify-between">
                  <h2 className="font-bold text-foreground flex items-center gap-2"><ShoppingCart className="w-4 h-4 text-primary" /> Pesanan Masuk</h2>
                  <button onClick={() => setShowPreview(true)} className="text-xs font-bold px-3 py-1.5 rounded-lg bg-cta-gradient text-accent-foreground shadow-sm hover:opacity-90 transition-opacity flex items-center">
                    <Eye className="w-3 h-3 mr-1" /> Lihat Mode Pembeli
                  </button>
                </div>
                <div className="overflow-y-auto flex-1 p-4 space-y-4">
                  {activeOrders.map((o) => (
                    <div key={o.id} className="p-4 rounded-xl border bg-background border-l-4 border-l-primary/30">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-sm text-foreground">#{o.id} — {o.customer}</span>
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${(statusColors as any)[o.status]}`}>{o.status}</span>
                      </div>
                      <div className="text-xs text-muted-foreground mb-2 leading-relaxed">{o.items}</div>
                      <div className="flex items-center justify-between pt-2 border-t border-dashed">
                        <span className="text-[10px] text-muted-foreground">{o.date}</span>
                        <span className="text-sm font-bold text-foreground">{formatRp(o.total)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {!user && (
              <div className="p-10 rounded-3xl bg-gradient-to-tr from-amber-500 to-yellow-500 text-amber-950 text-center shadow-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-64 h-64 bg-white/10 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-700" />
                <div className="relative z-10">
                  <Zap className="w-12 h-12 mx-auto mb-4 animate-bounce" />
                  <h2 className="text-3xl font-extrabold mb-4">Ingin Punya Toko Seperti Ini?</h2>
                  <p className="max-w-xl mx-auto text-amber-950/80 mb-8 font-medium">Lupakan website ribet. Fokus dagang saja, biar kami yang urus teknisnya. Gratis selamanya untuk pemula!</p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button onClick={() => setView("login")} className="px-8 py-4 rounded-2xl bg-amber-950 text-amber-400 font-extrabold text-lg shadow-2xl hover:-translate-y-1 transition-all">
                      BUAT TOKO SAYA SEKARANG
                    </button>
                  </div>
                </div>
              </div>
            )}

            {user && (
              <div className="pt-8 border-t">
                <p className="text-center text-sm text-muted-foreground">Ingin mengubah detail produk atau link toko? Gunakan menu Publish atau Settings selengkapnya.</p>
              </div>
            )}
          </div>
        </div>
        {mobileBottomNav}
      </div>
    );
  }

  if (view === "settings") {
    return (
      <div className="min-h-screen pb-20 md:pb-0 relative bg-muted/30">
        <div className="max-w-md mx-auto min-h-screen bg-card shadow-xl">
          <header className="bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 border-b border-amber-600 sticky top-0 z-40 shadow-sm">
            <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Settings className="w-5 h-5 text-amber-950" />
                <span className="font-bold text-amber-950">Settings & Tools</span>
              </div>
              <div className="w-8 h-8 rounded-full bg-amber-950 flex items-center justify-center text-xs font-bold text-amber-400 border border-amber-300">
                {store?.name?.charAt(0).toUpperCase() || (user?.email?.charAt(0).toUpperCase() || 'U')}
              </div>
            </div>
          </header>
          <div className="px-4 py-8">
            <div className="bg-card border rounded-xl p-6 shadow-sm text-center">
              <Settings className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-bold mb-2">Settings Toko</h2>
              <p className="text-sm text-muted-foreground">Area integrasi CAPI, Meta Pixel, dan alat marketing lainnya akan muncul di sini.</p>
            </div>
          </div>
        </div>
        {mobileBottomNav}
      </div>
    );
  }

  // Final fallback to home view if no other matches (though home is usually handled at the start of component)
  return null;
};

export default Index;
