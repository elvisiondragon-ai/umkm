import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Globe, ShoppingCart, MessageCircle, BarChart3, Zap, Shield, Smartphone,
  Star, ChevronDown, ChevronUp, Check, Plus, Pencil, Trash2, Eye,
  Package, TrendingUp, Users, DollarSign, ArrowLeft, Store, Menu, X,
  Send, MapPin, Phone, Instagram, Facebook, Home, LogOut, LayoutDashboard,
  Settings, User as UserIcon, UploadCloud, Image as ImageIcon, CheckCircle2,
  Lock, ArrowRight, Activity, Inbox, Copy
} from "lucide-react";
import { supabase } from "../lib/supabase";
import { toast, Toaster } from "sonner";
import imageCompression from 'browser-image-compression';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import elv3 from '../assets/elv3.png';

// ==================== TYPES ====================
type View = "home" | "dashboard" | "tools" | "umkm-template" | "login" | "create-store" | "settings" | "profile" | "live-store";
type OrderStatus = "baru" | "proses" | "kirim" | "selesai";
type TimeFilter = 'hari_ini' | 'kemarin' | '7_hari' | '1_bulan' | '3_bulan';

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
const formatRp = (n: number) => `Rp ${n.toLocaleString("id-ID")} `;

// Helper to format string input to Rupiah number string (e.g. "20000" -> "20.000")
const formatInputRp = (val: string | number) => {
  if (!val) return "";
  const num = val.toString().replace(/\D/g, "");
  return num.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

// Helper to strip formatted strings back to raw number strings
const parseRp = (val: string) => val.replace(/\D/g, "");

// Helper to compress image
const compressImage = async (file: File, maxWidth = 800, maxFileKB = 100): Promise<File> => {
  try {
    const options = {
      maxSizeMB: maxFileKB / 1024,
      maxWidthOrHeight: maxWidth,
      useWebWorker: true,
      fileType: "image/jpeg"
    };
    const compressedFile = await imageCompression(file, options);

    // Force .jpg extension
    const baseName = file.name.replace(/\.[^/.]+$/, "");
    const finalFileName = `${baseName}.jpg`;

    return new File([compressedFile], finalFileName, {
      type: "image/jpeg",
      lastModified: Date.now(),
    });
  } catch (error) {
    console.error("Compression error:", error);
    return file; // fallback to original
  }
};

const statusColors: Record<OrderStatus, string> = {
  baru: "bg-accent text-accent-foreground",
  proses: "bg-secondary text-secondary-foreground",
  kirim: "bg-primary text-primary-foreground",
  selesai: "bg-success text-success-foreground",
};

// ==================== MAIN COMPONENT ====================
const Index = ({ bypassHome = false }: { bypassHome?: boolean }) => {
  const [view, setView] = useState<View>(bypassHome ? "login" : "home");
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [orderForm, setOrderForm] = useState({ nama: "", wa: "", alamat: "", catatan: "", paymentMethod: "transfer", deliveryMethod: "dikirim" });
  const [demoOrderForm, setDemoOrderForm] = useState({ nama: "", wa: "", alamat: "", catatan: "", paymentMethod: "cod" });
  const [demoCart, setDemoCart] = useState<Record<string, number>>({});
  const [showDemoOutput, setShowDemoOutput] = useState(false);
  const [isMobile, setIsMobile] = useState(true);
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

  const { alias } = useParams();
  const navigate = useNavigate();

  // Handle /pageseller bypass logic
  useEffect(() => {
    if (bypassHome && view === "home") {
      setView("login");
    }
  }, [bypassHome]);

  // Handle Dynamic Public Store Route
  useEffect(() => {
    if (alias) {
      const fetchPublicStore = async () => {
        setIsLoading(true);
        const { data: storeData } = await supabase
          .from('stores')
          .select('*')
          .eq('alias', alias)
          .single();

        if (storeData) {
          setStore(storeData);
          const { data: productsData } = await supabase
            .from('stores_product')
            .select('*')
            .eq('store_id', storeData.id);

          if (productsData) setProducts(productsData);
          setView("live-store");

          // Increment page views
          supabase.from("page_views").insert({ store_id: storeData.id, user_agent: navigator.userAgent }).then();
        } else {
          toast.error("Toko tidak ditemukan");
          navigate('/');
        }
        setIsLoading(false);
      };

      fetchPublicStore();
    }
  }, [alias, navigate]);

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

  const sotoMockOrders = [
    { id: "1001", customer: "Budi Santoso", status: "selesai", items: "2x Sepatu Sneakers Pria", total: 450000, date: "Hari ini, 10:30" },
    { id: "1002", customer: "Siti Aminah", status: "proses", items: "1x Tas Selempang Wanita", total: 120000, date: "Hari ini, 11:15" },
    { id: "1003", customer: "Agus Setiawan", status: "baru", items: "3x Kaos Polos", total: 150000, date: "Hari ini, 12:05" },
    { id: "1004", customer: "Lina Marlina", status: "selesai", items: "1x Topi Baseball", total: 45000, date: "Hari ini, 13:20" },
    { id: "1005", customer: "Deni Ramdani", status: "kirim", items: "2x Celana Chino Pendek", total: 200000, date: "Hari ini, 14:45" },
    { id: "1006", customer: "Rina Kartika", status: "selesai", items: "1x Sepatu Sneakers Pria", total: 225000, date: "Hari ini, 15:30" },
    { id: "1007", customer: "Anton Wijaya", status: "baru", items: "1x Jaket Hoodie", total: 180000, date: "Hari ini, 16:10" },
    { id: "1008", customer: "Maya Sari", status: "proses", items: "4x Kaos Polos", total: 200000, date: "Hari ini, 17:00" },
    { id: "1009", customer: "Hendri Gunawan", status: "kirim", items: "1x Tas Selempang Wanita", total: 120000, date: "Hari ini, 18:05" },
    { id: "1010", customer: "Diana Putri", status: "selesai", items: "2x Sepatu Sneakers Pria", total: 450000, date: "Hari ini, 19:20" },
  ];

  const defaultMockOrders = [
    { id: "1001", customer: "Budi Santoso", status: "selesai", items: "2x Nasi Goreng, 1x Es Teh", total: 55000, date: "Hari ini, 12:30" },
    { id: "1002", customer: "Siti Aminah", status: "proses", items: "1x Ayam Bakar, 1x Es Teh", total: 40000, date: "Hari ini, 13:15" },
    { id: "1003", customer: "Agus Setiawan", status: "baru", items: "3x Nasi Goreng", total: 75000, date: "Hari ini, 14:05" },
  ];

  const mockOrders = user?.email === 'soto@yahoo.com' ? sotoMockOrders : defaultMockOrders;

  // New product editing state
  const [newProduct, setNewProduct] = useState({ id: "", name: "", description: "", price: "", imageFile: null as File | null });
  const [productImagePreview, setProductImagePreview] = useState<string | null>(null);
  const [isSavingProduct, setIsSavingProduct] = useState(false);
  const [storeSettingsForm, setStoreSettingsForm] = useState({ name: "", alias: "", waNumber: "", address: "", theme: "", payment: "", logo_url: "", capi: "", pixel: "", test_event_code: "" });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isSavingStore, setIsSavingStore] = useState(false);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [pageViews, setPageViews] = useState(0);

  // New states for Email Update and Profile
  const [newEmail, setNewEmail] = useState("");
  const [isUpdatingEmail, setIsUpdatingEmail] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [isUpdatingName, setIsUpdatingName] = useState(false);

  // AI Image Generator States
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiImageRef, setAiImageRef] = useState<File | null>(null);
  const [aiImageRefPreview, setAiImageRefPreview] = useState<string | null>(null);
  const [aiPreviewUrl, setAiPreviewUrl] = useState<string | null>(null);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [isUploadingAi, setIsUploadingAi] = useState(false);
  const [isToolsExpanded, setIsToolsExpanded] = useState<string | null>(null);

  // Dashboard Filters
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('7_hari');

  const handleGenerateAiBanner = async () => {
    if (!aiPrompt) return;
    setIsGeneratingAi(true);
    setAiPreviewUrl(null);
    try {
      let imageBase64 = null;
      if (aiImageRef) {
        // Convert the reference image to base64
        imageBase64 = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(aiImageRef);
          reader.onload = () => resolve(reader.result);
          reader.onerror = error => reject(error);
        });
      }

      const storeIdentifier = store?.name || displayName || user?.email?.split('@')[0] || 'Toko Anda';
      const storeWa = store?.wa_number ? `Hub: ${store.wa_number}` : '';
      const secretPrompt = `Buat gambar rasio 1:1. Tuliskan teks promosi menarik untuk produk ini: ${aiPrompt}. PENTING: JANGAN tulis kata "Headline:" atau "Deskripsi:" di dalam gambar, langsung saja tulis kalimat promosinya. Di bagian bawah atau pojok, wajib tuliskan nama toko "${storeIdentifier}" dan nomor WA "${storeWa}".`;

      const { data, error } = await supabase.functions.invoke('stores-banana', {
        body: { prompt: secretPrompt, imageBase64 }
      });
      if (error) throw error;
      if (data && data.image) {
        setAiPreviewUrl(data.image);
      } else {
        throw new Error("Gagal mendapatkan gambar dari AI");
      }
    } catch (e: any) {
      console.error("AI Gen Error:", e);
      toast.error("Gagal", { description: e.message });
    } finally {
      setIsGeneratingAi(false);
    }
  };

  // Helper to convert base64 to Blob
  const base64ToBlob = (base64: string, mimeType: string) => {
    const byteString = atob(base64.split(',')[1] || base64);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: mimeType });
  };

  const handleUseAiBanner = async () => {
    if (!aiPreviewUrl || !store?.id) return;
    setIsUploadingAi(true);
    try {
      // Create a Blob directly from the Base64 string from AI
      const isBase64 = aiPreviewUrl.startsWith('data:image');
      const blob = isBase64
        ? base64ToBlob(aiPreviewUrl, 'image/jpeg')
        : await (await fetch(aiPreviewUrl)).blob();

      const file = new File([blob], `ai-promo-${Date.now()}.jpg`, { type: "image/jpeg" });

      // Inject to New Product Form
      setNewProduct({ id: "", name: "", description: "", price: "", imageFile: file });
      setProductImagePreview(URL.createObjectURL(file));

      setAiPreviewUrl(null);
      setIsToolsExpanded(null);

      // Scroll to product section
      setTimeout(() => {
        document.getElementById("tambah-produk")?.scrollIntoView({ behavior: "smooth" });
      }, 100);

      toast.success("Gambar Disiapkan", { description: "Silakan isi nama dan harga produk baru Anda." });
    } catch (e: any) {
      console.error("AI to Product Error:", e);
      toast.error("Gagal", { description: e.message });
    } finally {
      setIsUploadingAi(false);
    }
  };

  // Auto-generate WhatsApp Demo Text
  const generateOrderWaText = () => {
    const cartItems = Object.entries(demoCart).filter(([_, qty]) => qty > 0);
    if (cartItems.length === 0 && !orderForm.catatan) {
      return `Halo ${store?.name || 'Admin'},\n\nNama: ${orderForm.nama}\nAlamat: ${orderForm.alamat}\n\nPesanan:\n(Belum ada produk dari menu, silahkan dicek)`;
    }

    let itemsText = "";
    let total = 0;
    const activeProducts = (user || alias) ? products : mockProducts;

    cartItems.forEach(([productId, qty]) => {
      const product = activeProducts.find(p => p.id.toString() === productId);
      if (product) {
        const itemTotal = Number(product.price) * qty;
        total += itemTotal;
        itemsText += `\n- ${qty}x ${product.name} (${formatRp(itemTotal)})`;
      }
    });

    // Generate a random tracking ID (e.g., A123123CS)
    const randomChars = Math.random().toString(36).substring(2, 5).toUpperCase();
    const randomNums = Math.floor(100000 + Math.random() * 900000);
    const trackingId = `${randomChars}${randomNums}`;

    let paymentText = "";
    if (orderForm.paymentMethod === "transfer") {
      paymentText = `\n💳 *Metode Bayar:* Transfer Bank (ke: ${store?.payment_info || 'Rekening Penjual'})`;
    } else {
      paymentText = `\n💳 *Metode Bayar:* Bayar di Tempat/COD`;
    }

    let deliveryText = "";
    if (orderForm.deliveryMethod === "dikirim") {
      deliveryText = `\n🚚 *Pengiriman:* Dikirim ke alamat tujuan`;
    } else {
      deliveryText = `\n🏪 *Pengiriman:* Ambil di Toko`;
    }

    return `Halo ${store?.name || 'Admin'}, saya mau pesan:

🔖 *ID Pesanan: #${trackingId}*

📦 *Detail Pesanan*${itemsText}

📝 *Data Pembeli*
Nama: ${orderForm.nama || "[Nama Anda]"}
Wa: ${formatWaNumber(orderForm.wa) || "[No WA]"}
Alamat: ${orderForm.alamat || "[Alamat Lengkap]"}
Catatan: ${orderForm.catatan || "-"}${paymentText}${deliveryText}

💵 *Total: ${formatRp(total)}*

Mohon informasikan total plus ongkir (bila ada) ya.`;
  };

  // Utility to format WA number
  const formatWaNumber = (wa: string) => {
    let num = wa.replace(/\D/g, ''); // Remove all non-digits
    if (num.startsWith('0')) {
      num = '62' + num.substring(1);
    } else if (num.startsWith('8')) {
      num = '62' + num;
    }
    return num;
  };

  const fetchStoreData = async (userId: string) => {
    try {
      const { data: storeData } = await supabase
        .from('stores')
        .select('*')
        .eq('user_id', userId)
        .single();

      let activeStore = storeData;

      // Fetch user profile (display name & email for migration)
      const { data: profileData } = await supabase
        .from('profiles')
        .select('display_name, user_email')
        .eq('user_id', userId)
        .single();

      if (profileData) {
        setDisplayName(profileData.display_name || "");
      }

      // AUTO MIGRATION: Create default store for users missing one (e.g. soto@yahoo.com)
      if (!activeStore && profileData?.user_email) {
        const baseAlias = profileData.user_email.split('@')[0].toLowerCase().replace(/[^a-z0-9]+/g, '-');
        const defaultAlias = `${baseAlias}-${Math.floor(Math.random() * 1000)}`;
        const { data: newStore, error: createError } = await supabase
          .from('stores')
          .insert({
            user_id: userId,
            name: `Toko ${profileData.display_name || baseAlias}`,
            alias: defaultAlias,
            theme_color: '#ffffff',
            user_email: profileData.user_email,
            wa_number: "08000000000"
          })
          .select('*')
          .single();

        if (!createError && newStore) {
          activeStore = newStore;
        }
      }

      if (activeStore) {
        setStore(activeStore);
        setStoreSettingsForm({
          name: activeStore.name,
          alias: activeStore.alias,
          waNumber: activeStore.wa_number,
          address: activeStore.address || "",
          theme: activeStore.theme_color,
          payment: activeStore.payment_info || "",
          logo_url: activeStore.logo_url || "",
          capi: activeStore.capi || "",
          pixel: activeStore.pixel || "",
          test_event_code: activeStore.test_event_code || ""
        });
        if (activeStore.logo_url) setLogoPreview(activeStore.logo_url);

        // Fetch products
        const { data: productsData } = await supabase
          .from('stores_product')
          .select('*')
          .eq('store_id', activeStore.id);
        if (productsData) setProducts(productsData);

        // Fetch orders
        const { data: ordersData } = await supabase
          .from('stores_orders')
          .select('*')
          .eq('store_id', activeStore.id)
          .order('created_at', { ascending: false });
        if (ordersData) {
          setOrders(ordersData);
          const revenue = ordersData.reduce((sum: number, o: any) => sum + (parseFloat(o.total_amount) || 0), 0);
          setTotalRevenue(revenue);
        }

        // Fetch page views (today)
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const { count } = await supabase
          .from('page_views')
          .select('*', { count: 'exact', head: true })
          .eq('store_id', storeData.id)
          .gte('viewed_at', todayStart.toISOString());
        setPageViews(count || 0);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    // Check initial screen size and listen for resize
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);

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

    return () => {
      subscription.unsubscribe();
      window.removeEventListener("resize", checkMobile);
    };
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
      if (!setupForm.email || !setupForm.password || !setupForm.storeName) {
        throw new Error("Mohon lengkapi Email, Password, dan Nama Toko.");
      }

      if (!setupForm.waNumber || setupForm.waNumber.length < 9) {
        throw new Error("Nomor WhatsApp wajib diisi dengan benar (minimal 9 angka).");
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
          theme_color: setupForm.theme === 'gelap' ? '#09090b' :
            setupForm.theme === 'ungu' ? 'linear-gradient(to right, #a855f7, #c084fc)' :
              setupForm.theme === 'yellow' ? 'linear-gradient(to right, #eab308, #facc15)' :
                setupForm.theme === 'pink' ? 'linear-gradient(to right, #ec4899, #f472b6)' :
                  '#ffffff',
          wa_number: setupForm.waNumber,
          address: setupForm.address,
          payment_info: setupForm.bankAccount,
          user_email: setupForm.email
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
          .from('stores_product')
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
      let finalLogoUrl = storeSettingsForm.logo_url;

      // Upload logo if a new file was selected
      if (logoFile) {
        // Hero Banner compression: 1200px max width to preserve 16:9 quality, max 300KB
        const compressed = await compressImage(logoFile, 1200, 300);
        const fileName = `${store.alias}/logo-${Date.now()}.jpg`;
        const { error: uploadError } = await supabase.storage
          .from('Stores')
          .upload(fileName, compressed, { cacheControl: '3600', upsert: true });
        if (uploadError) {
          console.error('Logo upload error:', uploadError);
          throw uploadError;
        }
        const { data: publicUrlData } = supabase.storage.from('Stores').getPublicUrl(fileName);
        finalLogoUrl = publicUrlData.publicUrl;

        // Auto-delete old logo from bucket (Non-blocking)
        if (store.logo_url && store.logo_url !== '/default-hero.png') {
          try {
            const urlObj = new URL(store.logo_url);
            if (urlObj.pathname.includes('/public/Stores/')) {
              const oldPath = urlObj.pathname.split('/public/Stores/')[1];
              if (oldPath) await supabase.storage.from('Stores').remove([decodeURIComponent(oldPath)]).catch(() => { });
            } else if (urlObj.pathname.includes('/public/stores_banana/')) {
              const oldPath = urlObj.pathname.split('/public/stores_banana/')[1];
              if (oldPath) await supabase.storage.from('stores_banana').remove([decodeURIComponent(oldPath)]).catch(() => { });
            }
          } catch (e) {
            console.warn("Non-fatal: Failed to delete old banner:", e);
          }
        }
      }

      // Build update payload - only include fields that exist
      const updatePayload: Record<string, any> = {
        name: storeSettingsForm.name,
        alias: storeSettingsForm.alias,
        wa_number: storeSettingsForm.waNumber,
        address: storeSettingsForm.address,
        payment_info: storeSettingsForm.payment,
        logo_url: finalLogoUrl,
      };
      // Only send capi/pixel if user has entered a value
      if (storeSettingsForm.capi) updatePayload.capi = storeSettingsForm.capi;
      if (storeSettingsForm.pixel) updatePayload.pixel = storeSettingsForm.pixel;
      if (storeSettingsForm.test_event_code !== undefined) updatePayload.test_event_code = storeSettingsForm.test_event_code;

      const { error } = await supabase.from('stores').update(updatePayload).eq('id', store.id);

      if (error) {
        console.error('Store update error:', error);
        throw error;
      }
      setLogoFile(null);
      await fetchStoreData(user.id);
      toast.success("Pengaturan toko berhasil disimpan!", {
        description: "Perubahan logo dan detail website telah diperbarui."
      });
    } catch (e: any) {
      console.error('handleSaveStoreSettings full error:', e);
      toast.error("Gagal menyimpan", {
        description: e.message
      });
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

      if (newProduct.id) {
        // Update existing product
        const { error } = await supabase.from('stores_product').update({
          name: newProduct.name,
          description: newProduct.description,
          price: parseFloat(newProduct.price),
          ...(image_url ? { image_url } : {})
        }).eq('id', newProduct.id);

        if (error) throw error;
      } else {
        // Insert new product
        const { error } = await supabase.from('stores_product').insert({
          store_id: store.id,
          user_email: user?.email || '',
          name: newProduct.name,
          description: newProduct.description,
          price: parseFloat(newProduct.price),
          image_url: image_url
        });

        if (error) throw error;
      }

      setNewProduct({ id: "", name: "", description: "", price: "", imageFile: null });
      await fetchStoreData(user.id);
      toast.success("Produk berhasil ditambahkan!", {
        description: `${newProduct.name} sekarang tersedia di toko Anda.`
      });
    } catch (e: any) {
      toast.error("Gagal menambah produk", {
        description: e.message
      });
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

  const handleUpdateEmail = async () => {
    if (!newEmail || newEmail === user?.email) return;
    try {
      setIsUpdatingEmail(true);
      const { error } = await supabase.auth.updateUser({ email: newEmail });
      if (error) throw error;
      toast.success("Link konfirmasi dikirim", { description: "Cek inbox email baru Anda untuk konfirmasi perubahan." });
    } catch (e: any) {
      toast.error("Gagal ganti email", { description: e.message });
    } finally {
      setIsUpdatingEmail(false);
    }
  };

  const handleUpdateDisplayName = async () => {
    if (!user?.id || !displayName) return;
    try {
      setIsUpdatingName(true);
      const { error } = await supabase
        .from('profiles')
        .update({ display_name: displayName })
        .eq('user_id', user.id);

      if (error) throw error;
      toast.success("Berhasil Update", { description: "Nama tampilan berhasil disimpan." });
    } catch (e: any) {
      toast.error("Gagal update profil", { description: e.message });
    } finally {
      setIsUpdatingName(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!loginForm.email) {
      toast.error("Email diperlukan", { description: "Masukkan email di kolom login terlebih dahulu lalu klik ini." });
      return;
    }
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.resetPasswordForEmail(loginForm.email, {
        redirectTo: window.location.origin,
      });
      if (error) throw error;
      toast.success("Email Reset Password Terkirim", { description: "Cek inbox/spam untuk melanjutkan reset password." });
    } catch (e: any) {
      toast.error("Gagal mengirim reset password", { description: e.message });
    } finally {
      setIsLoading(false);
    }
  };

  // ========== SHARED COMPONENTS ==========
  // Mobile Restriction Component for Authenticated views
  const mobileRestrictionScreen = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-background p-6">
      <div className="max-w-md w-full p-10 rounded-[30px] bg-gradient-to-tr from-amber-500 to-yellow-500 text-amber-950 text-center shadow-2xl relative overflow-hidden group border-4 border-amber-300">
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-64 h-64 bg-white/20 rounded-full blur-3xl" />
        <div className="relative z-10 flex flex-col items-center">
          <div className="w-20 h-20 rounded-full bg-amber-950/10 flex items-center justify-center mb-6 shadow-inner relative overflow-hidden">
            <Smartphone className="w-10 h-10 text-amber-950 absolute" />
            <div className="absolute inset-0 bg-white/20 animate-pulse mix-blend-overlay"></div>
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4 leading-tight">Mobile Only Experience</h2>
          <p className="font-bold text-amber-950/80 mb-6 text-sm">
            Aplikasi Editor Website Hanya bisa diakses di Mobile. Silahkan akses via Handphone anda untuk mulai mengelola toko.
          </p>
          <div className="flex gap-2 items-center text-xs font-semibold bg-amber-950/10 px-4 py-2 rounded-full">
            <Lock className="w-4 h-4" /> Akses Desktop Dikunci
          </div>
          <button onClick={handleLogout} className="mt-8 text-sm font-bold text-amber-950 hover:underline">
            ← Logout dari perangkat ini
          </button>
        </div>
      </div>
    </div>
  );

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

  // Check if user is logged in, not on the homepage, and viewing on desktop
  const isProtectedView = user && view !== "home" && view !== "login";
  if (isProtectedView && !isMobile) {
    return mobileRestrictionScreen;
  }

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
                Buat Website UMKM <span className="text-gradient-hero">Gratis</span> dalam 5 Menit via HANDPHONE
              </h1>
              <p className="text-base md:text-lg text-muted-foreground mb-8 leading-relaxed">
                UMKM elVision adalah spesialisasi Mobile sehingga kamu tidak perlu menyentuh laptop (bahkan tidak bisa karena fitur desktop dikunci). Nikmati simplicity kelola toko langsung dari genggaman tangan, coba deh betapa mudahnya!
              </p>
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

        {/* ================= CONTOH TOKO (BUYER VIEW) ================= */}
        <section id="contoh" className="py-24 relative overflow-hidden bg-muted/20 border-y">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold mb-4">
                <ShoppingCart className="w-3 h-3" /> DEMO PEMBELI
              </div>
              <h2 className="text-3xl md:text-5xl font-extrabold text-foreground leading-tight mb-4">
                Cobain Belanja di <span className="text-primary">Contoh Toko</span>
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Ini adalah halaman yang akan dilihat pelanggan Anda. Coba pilih menu, isi data asal, dan lihat hasil pesanannya (akan terkirim ke WhatsApp Anda nantinya).
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-12 items-start">
              {/* Product Selection */}
              <div className="bg-card rounded-3xl p-6 shadow-xl border">
                <h3 className="font-bold text-xl mb-6 flex items-center gap-2 border-b pb-4">
                  <Package className="w-5 h-5 text-secondary" /> Pilih Produk Demo
                </h3>
                <div className="space-y-4">
                  {mockProducts.map((p) => {
                    const qty = demoCart[p.id] || 0;
                    return (
                      <div
                        key={p.id}
                        className={`flex gap-4 p-4 rounded-2xl border-2 transition-all ${qty > 0 ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30 bg-background'}`}
                      >
                        <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0">
                          <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 flex flex-col justify-between">
                          <div>
                            <h4 className="font-bold text-foreground">{p.name}</h4>
                            <p className="text-xs text-muted-foreground line-clamp-1 mb-1">{p.description}</p>
                            <p className="font-bold text-secondary text-sm">{formatRp(p.price)}</p>
                          </div>

                          <div className="flex items-center justify-end gap-3 mt-2">
                            {qty > 0 ? (
                              <>
                                <button className="w-8 h-8 rounded-full bg-background border flex items-center justify-center font-bold text-muted-foreground hover:bg-muted"
                                  onClick={() => setDemoCart({ ...demoCart, [p.id]: qty - 1 })}>-</button>
                                <span className="font-bold w-4 text-center">{qty}</span>
                                <button className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold shadow-sm"
                                  onClick={() => setDemoCart({ ...demoCart, [p.id]: qty + 1 })}>+</button>
                              </>
                            ) : (
                              <button className="px-4 py-1.5 rounded-full bg-primary/10 text-primary font-bold text-xs hover:bg-primary/20 transition-colors"
                                onClick={() => setDemoCart({ ...demoCart, [p.id]: 1 })}>Tambah</button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Order Form & Output */}
              <div className="space-y-6">
                <div className={`bg-card rounded-3xl p-6 shadow-xl border transition-all duration-300 ${Object.values(demoCart).reduce((a, b) => a + b, 0) === 0 ? 'opacity-50 pointer-events-none' : ''}`}>
                  <h3 className="font-bold text-xl mb-6 flex items-center gap-2 border-b pb-4">
                    <Zap className="w-5 h-5 text-primary" /> Lengkapi Data (Asal saja)
                  </h3>

                  {Object.values(demoCart).reduce((a, b) => a + b, 0) > 0 ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-muted-foreground">Nama Pemesan</label>
                          <input type="text" placeholder="Budi" className="w-full px-4 py-3 rounded-xl border bg-background text-sm focus:ring-2 focus:ring-primary outline-none"
                            value={demoOrderForm.nama} onChange={e => setDemoOrderForm({ ...demoOrderForm, nama: e.target.value })} />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-muted-foreground">No WhatsApp</label>
                          <input type="text" placeholder="0812..." className="w-full px-4 py-3 rounded-xl border bg-background text-sm focus:ring-2 focus:ring-primary outline-none"
                            value={demoOrderForm.wa} onChange={e => setDemoOrderForm({ ...demoOrderForm, wa: e.target.value })} />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-muted-foreground">Metode Pembayaran</label>
                          <select
                            className="w-full px-4 py-3 rounded-xl border bg-background text-sm focus:ring-2 focus:ring-primary outline-none appearance-none"
                            value={demoOrderForm.paymentMethod}
                            onChange={e => setDemoOrderForm({ ...demoOrderForm, paymentMethod: e.target.value })}
                          >
                            <option value="cod">Bayar di Tempat (COD)</option>
                            <option value="transfer">Transfer Bank (BCA / Mandiri)</option>
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-muted-foreground">Catatan Tambahan</label>
                          <input type="text" placeholder="Pedesnya dikit..." className="w-full px-4 py-3 rounded-xl border bg-background text-sm focus:ring-2 focus:ring-primary outline-none"
                            value={demoOrderForm.catatan} onChange={e => setDemoOrderForm({ ...demoOrderForm, catatan: e.target.value })} />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-muted-foreground">Alamat Lengkap (opsional)</label>
                        <input type="text" placeholder="Jl. Sudirman No 1..." className="w-full px-4 py-3 rounded-xl border bg-background text-sm focus:ring-2 focus:ring-primary outline-none"
                          value={demoOrderForm.alamat} onChange={e => setDemoOrderForm({ ...demoOrderForm, alamat: e.target.value })} />
                      </div>

                      <button
                        onClick={() => setShowDemoOutput(true)}
                        className="w-full py-4 rounded-xl font-bold bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 mt-4 transition-all"
                      >
                        Lihat Output Pesanan
                      </button>
                    </div>
                  ) : (
                    <div className="py-12 text-center text-muted-foreground">
                      <ShoppingCart className="w-12 h-12 mx-auto mb-4 opacity-20" />
                      <p>Pilih produk di sebelah kiri terlebih dahulu</p>
                    </div>
                  )}
                </div>

                {/* Simulated WhatsApp Output */}
                {showDemoOutput && Object.values(demoCart).reduce((a, b) => a + b, 0) > 0 && (
                  <div className="bg-[#e5ddd5] rounded-3xl p-6 shadow-xl border border-border/50 animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-hidden relative">
                    <div className="absolute top-0 left-0 right-0 bg-[#075e54] text-white p-3 font-semibold text-sm flex items-center gap-2">
                      <MessageCircle className="w-4 h-4" /> Simulasi WhatsApp Penjual
                    </div>

                    <div className="mt-12 bg-white p-4 rounded-b-xl rounded-tr-xl shadow-sm max-w-[90%] text-sm relative">
                      {/* WA Bubble tail */}
                      <div className="absolute top-0 -left-2 w-0 h-0 border-t-[0px] border-t-transparent border-r-[10px] border-r-white border-b-[10px] border-b-transparent"></div>

                      <div className="whitespace-pre-wrap text-slate-800 leading-relaxed font-sans">
                        {generateOrderWaText()}
                      </div>

                      <div className="text-[10px] text-right text-gray-400 mt-2 flex justify-end items-center gap-1">
                        12:00 <CheckCircle2 className="w-3 h-3 text-blue-500" />
                      </div>
                    </div>
                    <p className="text-center text-xs text-muted-foreground mt-4 mix-blend-multiply opacity-60">
                      Pelanggan tidak perlu repot mengetik manual. Format ini otomatis terbuka di WA mereka.
                    </p>
                  </div>
                )}
              </div>
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
                    Mulai Sekarang
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
                Mulai Sekarang
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

  // --- Dashboard Data Filtering ---
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfYesterday = new Date(startOfToday.getTime() - 24 * 60 * 60 * 1000);
  const startOf7Days = new Date(startOfToday.getTime() - 6 * 24 * 60 * 60 * 1000); // 7 days inclusive 
  const startOf1Month = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
  const startOf3Months = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());

  const filteredOrders = orders.filter(o => {
    // Assuming 'date' is a valid parseable date string or timestamp. 
    // If it's a formatted string like '27 Feb', this logic needs distinct parsing.
    // Default to today if date isn't cleanly parseable for now, but usually it comes from DB as ISO.
    const orderDate = new Date(o.date);
    // Safe fallback if date is invalid in mock data
    if (isNaN(orderDate.getTime())) return true;

    if (timeFilter === 'hari_ini') return orderDate >= startOfToday;
    if (timeFilter === 'kemarin') return orderDate >= startOfYesterday && orderDate < startOfToday;
    if (timeFilter === '7_hari') return orderDate >= startOf7Days;
    if (timeFilter === '1_bulan') return orderDate >= startOf1Month;
    if (timeFilter === '3_bulan') return orderDate >= startOf3Months;
    return true;
  });

  const filteredTotalRevenue = filteredOrders.reduce((sum, order) => sum + order.total, 0);

  const getFilterLabel = (f: TimeFilter) => {
    switch (f) {
      case 'hari_ini': return 'Hari Ini';
      case 'kemarin': return 'Kemarin';
      case '7_hari': return '7 Hari Terakhir';
      case '1_bulan': return 'Bulan Ini';
      case '3_bulan': return '3 Bulan Terakhir';
    }
  }

  const stats = [
    { label: "Total Order", value: user?.email === 'saku@yahoo.com' || user?.email === 'soto@yahoo.com' ? (timeFilter === 'hari_ini' ? '12' : timeFilter === 'kemarin' ? '8' : '215') : filteredOrders.length.toString(), icon: Package, change: "", color: "text-secondary" },
    { label: `Revenue ${getFilterLabel(timeFilter)}`, value: user?.email === 'saku@yahoo.com' ? formatRp(timeFilter === 'hari_ini' ? 1200000 : 40000000) : user?.email === 'soto@yahoo.com' ? formatRp(timeFilter === 'hari_ini' ? 900000 : 30000000) : formatRp(filteredTotalRevenue), icon: DollarSign, change: "", color: "text-success" },
    { label: "Pengunjung", value: user?.email === 'soto@yahoo.com' ? (timeFilter === 'hari_ini' ? '327' : '1.450') : pageViews.toString(), icon: Users, change: "", color: "text-accent" },
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
            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center border shadow-sm overflow-hidden">
              <img src="/favicon.ico" alt="Store Avatar" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        <div>
          <h1 className="text-xl font-bold text-foreground">Selamat Datang, {displayName || user?.email}! 👋</h1>
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

        {/* Analytics Chart */}
        <div className="bg-card rounded-2xl border shadow-sm p-5 w-full">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <h2 className="font-bold text-foreground flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" /> Grafik Pendapatan
            </h2>
            <div className="flex flex-wrap items-center gap-2 bg-muted/50 p-1 rounded-xl">
              {(['hari_ini', 'kemarin', '7_hari', '1_bulan', '3_bulan'] as TimeFilter[]).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setTimeFilter(filter)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${timeFilter === filter
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-md'
                    : 'text-muted-foreground hover:text-foreground hover:bg-black/5'
                    }`}
                >
                  {getFilterLabel(filter)}
                </button>
              ))}
            </div>
          </div>
          <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={
                  user?.email === 'saku@yahoo.com'
                    ? (timeFilter === 'hari_ini' ? [{ name: '00:00', revenue: 0 }, { name: '06:00', revenue: 200000 }, { name: '12:00', revenue: 500000 }, { name: '18:00', revenue: 300000 }, { name: '23:59', revenue: 200000 }] :
                      timeFilter === 'kemarin' ? [{ name: '00:00', revenue: 0 }, { name: '06:00', revenue: 150000 }, { name: '12:00', revenue: 400000 }, { name: '18:00', revenue: 450000 }, { name: '23:59', revenue: 100000 }] :
                        timeFilter === '1_bulan' ? Array.from({ length: 4 }).map((_, i) => ({ name: `Minggu ${i + 1}`, revenue: 10000000 })) :
                          timeFilter === '3_bulan' ? [{ name: 'Des', revenue: 35000000 }, { name: 'Jan', revenue: 42000000 }, { name: 'Feb', revenue: 40000000 }] :
                            [
                              { name: 'Senin', revenue: 1100000 }, { name: 'Selasa', revenue: 1350000 }, { name: 'Rabu', revenue: 950000 }, { name: 'Kamis', revenue: 1600000 }, { name: 'Jumat', revenue: 1950000 }, { name: 'Sabtu', revenue: 3200000 }, { name: 'Minggu', revenue: 4100000 },
                            ])
                    : user?.email === 'soto@yahoo.com'
                      ? (timeFilter === 'hari_ini' ? [{ name: '00:00', revenue: 0 }, { name: '06:00', revenue: 100000 }, { name: '12:00', revenue: 250000 }, { name: '18:00', revenue: 400000 }, { name: '23:59', revenue: 150000 }] :
                        timeFilter === 'kemarin' ? [{ name: '00:00', revenue: 0 }, { name: '06:00', revenue: 50000 }, { name: '12:00', revenue: 300000 }, { name: '18:00', revenue: 350000 }, { name: '23:59', revenue: 200000 }] :
                          timeFilter === '1_bulan' ? Array.from({ length: 4 }).map((_, i) => ({ name: `Minggu ${i + 1}`, revenue: 7500000 })) :
                            timeFilter === '3_bulan' ? [{ name: 'Des', revenue: 22000000 }, { name: 'Jan', revenue: 28000000 }, { name: 'Feb', revenue: 30000000 }] :
                              [
                                { name: 'Senin', revenue: 750000 }, { name: 'Selasa', revenue: 900000 }, { name: 'Rabu', revenue: 650000 }, { name: 'Kamis', revenue: 1100000 }, { name: 'Jumat', revenue: 1400000 }, { name: 'Sabtu', revenue: 2500000 }, { name: 'Minggu', revenue: 2900000 },
                              ])
                      : orders.length === 0
                        ? [
                          { name: 'Senin', revenue: 0 },
                          { name: 'Selasa', revenue: 0 },
                          { name: 'Rabu', revenue: 0 },
                          { name: 'Kamis', revenue: 0 },
                          { name: 'Jumat', revenue: 0 },
                          { name: 'Sabtu', revenue: 0 },
                          { name: 'Minggu', revenue: 0 },
                        ]
                        : [
                          { name: 'Hari 1', revenue: totalRevenue * 0.1 },
                          { name: 'Hari 2', revenue: totalRevenue * 0.15 },
                          { name: 'Hari 3', revenue: totalRevenue * 0.05 },
                          { name: 'Hari 4', revenue: totalRevenue * 0.2 },
                          { name: 'Hari 5', revenue: totalRevenue * 0.1 },
                          { name: 'Hari 6', revenue: totalRevenue * 0.25 },
                          { name: 'Hari 7', revenue: totalRevenue * 0.15 },
                        ]
                }
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <XAxis dataKey="name" fontSize={10} tickLine={false} axisLine={false} tickMargin={8} />
                <YAxis
                  fontSize={10}
                  width={40}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => {
                    if (value === 0) return '0';
                    if (value >= 1000000) return `${(value / 1000000).toFixed(value % 1000000 === 0 ? 0 : 1)}jt`;
                    return `${(value / 1000).toFixed(0)}k`;
                  }}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(0,0,0,0.04)' }}
                  formatter={(value: number) => [formatRp(value), "Pendapatan"]}
                  labelStyle={{ fontWeight: "bold", color: "#333", marginBottom: "4px" }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
                />
                <Bar dataKey="revenue" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
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
            <span className="font-bold text-foreground truncate max-w-[150px]">{store?.name || "Toko Saya"}</span>
          </div>
          <div className="flex items-center gap-3 text-muted-foreground">
            <a href={`https://wa.me/${formatWaNumber(store?.wa_number || '')}`} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs font-medium hover:text-secondary transition-colors">
              <MessageCircle className="w-4 h-4" /> Chat
            </a>
            {user && (
              <button onClick={() => setView("dashboard")} className="hidden md:block text-xs text-muted-foreground hover:text-foreground">← Kembali</button>
            )}
          </div>
        </div>
      </header>

      {/* Store Banner (16:9 Hero Image) */}
      <section className="relative text-primary-foreground min-h-[300px] md:min-h-[400px] flex items-center justify-center overflow-hidden" style={{ backgroundColor: store?.theme_color || '#1E3A5F' }}>
        <img
          src={store?.logo_url || '/default-hero.png'}
          className="absolute inset-0 w-full h-full object-cover"
          alt={`${store?.name || 'Toko'} hero`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center mt-auto pb-10">
          <h1 className="text-3xl md:text-5xl font-extrabold mb-3 text-white drop-shadow-lg">{store?.name || "Toko Saya"}</h1>
          <div className="flex flex-wrap border border-white/20 bg-black/30 backdrop-blur-md rounded-full py-2 px-6 items-center justify-center gap-4 text-xs md:text-sm text-primary-foreground shadow-xl mx-auto w-fit">
            {store?.address && <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> {store.address}</span>}
            <span className="flex items-center gap-1.5 border-l border-white/20 pl-4"><Phone className="w-3.5 h-3.5" /> {store?.wa_number || "-"}</span>
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
                      {demoCart[p.id.toString()] > 0 ? (
                        <div className="flex items-center gap-3">
                          <button onClick={() => setDemoCart({ ...demoCart, [p.id.toString()]: demoCart[p.id.toString()] - 1 })} className="w-8 h-8 rounded-full bg-secondary/10 text-secondary flex items-center justify-center font-bold pb-0.5 hover:bg-secondary/20 transition-colors">-</button>
                          <span className="font-bold text-sm min-w-[12px] text-center">{demoCart[p.id.toString()]}</span>
                          <button onClick={() => setDemoCart({ ...demoCart, [p.id.toString()]: demoCart[p.id.toString()] + 1 })} className="w-8 h-8 rounded-full bg-secondary text-white flex items-center justify-center font-bold pb-0.5 hover:bg-secondary/90 transition-colors">+</button>
                        </div>
                      ) : (
                        <button onClick={() => setDemoCart({ ...demoCart, [p.id.toString()]: 1 })} className="text-[10px] font-semibold px-3 py-1.5 rounded-lg bg-secondary/10 text-secondary hover:bg-secondary/20 transition-colors">
                          Beli
                        </button>
                      )}
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
            <div className="grid grid-cols-2 gap-3 mb-2">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Metode Pengiriman</label>
                <select
                  value={orderForm.deliveryMethod}
                  onChange={(e) => setOrderForm({ ...orderForm, deliveryMethod: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-lg border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-secondary/50"
                >
                  <option value="dikirim">🚚 Dikirim ke Alamat</option>
                  <option value="ambil">🏪 Ambil di Toko</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Metode Pembayaran</label>
                <select
                  value={orderForm.paymentMethod}
                  onChange={(e) => setOrderForm({ ...orderForm, paymentMethod: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-lg border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-secondary/50"
                >
                  <option value="transfer">💳 Rekening Tertuju</option>
                  <option value="cod">💵 COD (Bayar di Tempat)</option>
                </select>
              </div>
            </div>

            <label className="text-xs font-medium text-muted-foreground mb-1 block">Pesan Detail Tambahan</label>
            <textarea
              placeholder="Contoh: Saya ingin order Nasi Goreng Spesial 2 porsi, dikirim ke alamat X..."
              value={orderForm.catatan}
              onChange={(e) => setOrderForm({ ...orderForm, catatan: e.target.value })}
              rows={3}
              className="w-full px-3 py-2.5 rounded-lg border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-secondary/50 resize-none"
            />
          </div>
          <button
            onClick={() => {
              // Calculate total value for CAPI trigger
              let totalValue = 0;
              let hasItem = false;
              products.forEach(p => {
                const qty = demoCart[p.id.toString()] || 0;
                if (qty > 0) {
                  totalValue += (p.price * qty);
                  hasItem = true;
                }
              });

              if (hasItem && store?.id) {
                // Prepare items summary for the Order table
                const itemsSummary = products
                  .filter(p => demoCart[p.id.toString()] > 0)
                  .map(p => `${demoCart[p.id.toString()]}x ${p.name}`)
                  .join(", ");

                // Fire CAPI Purchase Event & Save Order in the background
                fetch("https://api.elvisiongroup.com/functions/v1/capi-stores", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    store_id: store.id,
                    value: totalValue,
                    currency: "IDR",
                    order_id: `ORD_${Date.now()}`,
                    customer_name: orderForm.nama || "Guest",
                    customer_wa: orderForm.wa || "-",
                    items_summary: itemsSummary
                  })
                }).catch(e => console.error("CAPI/Order Trigger failed:", e));
              }

              // Open WhatsApp
              window.open(`https://wa.me/${formatWaNumber(store?.wa_number || '')}?text=${encodeURIComponent(generateOrderWaText())}`, '_blank');
            }}
            className="w-full py-3 rounded-xl bg-success/10 border border-success/30 text-success font-semibold text-sm flex items-center justify-center gap-2 hover:bg-success hover:text-white transition-all shadow-sm"
          >
            <Send className="w-4 h-4" /> Pesan via WhatsApp
          </button>
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

        {/* CAPI Settings Form */}
        <div className="bg-card rounded-2xl shadow-sm border overflow-hidden flex flex-col transition-all">
          <div onClick={() => setIsToolsExpanded(isToolsExpanded === 'capi' ? null : 'capi')} className="p-4 flex flex-col items-center text-center gap-3 cursor-pointer hover:bg-muted/10 relative">
            <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center mt-2 shadow-sm border">
              <Activity className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h4 className="font-bold flex items-center justify-center gap-2">
                CAPI Ads Booster
                <span className="text-[10px] bg-blue-100 text-blue-700 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider hidden sm:inline-block">Purchase Tracker</span>
              </h4>
              <p className="text-xs text-muted-foreground mb-3">Tingkatkan konversi dengan Conversion API Meta.</p>
              <div className="inline-block px-4 py-1.5 bg-blue-600 text-white font-bold text-xs rounded-full shadow-sm">
                Konfigurasi CAPI
              </div>
            </div>
          </div>

          {isToolsExpanded === 'capi' && (
            <div className="p-4 bg-muted/20 border-t space-y-4 text-left">
              <div>
                <label className="text-sm font-semibold text-foreground mb-1 block">Meta Pixel ID</label>
                <input
                  type="text"
                  placeholder="1234567890..."
                  value={storeSettingsForm.pixel}
                  onChange={(e) => setStoreSettingsForm({ ...storeSettingsForm, pixel: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border bg-background text-sm text-foreground focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-foreground mb-1 block">CAPI Access Token</label>
                <input
                  type="text"
                  placeholder="EAAI..."
                  value={storeSettingsForm.capi}
                  onChange={(e) => setStoreSettingsForm({ ...storeSettingsForm, capi: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border bg-background text-sm text-foreground focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-foreground mb-1 block">Test Event Code (Opsional)</label>
                <input
                  type="text"
                  placeholder="TEST51000..."
                  value={storeSettingsForm.test_event_code}
                  onChange={(e) => setStoreSettingsForm({ ...storeSettingsForm, test_event_code: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border bg-background text-sm text-foreground focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
                <p className="text-xs text-muted-foreground mt-2">Dapatkan code testing di Meta Events Manager. Kosongkan jika sudah Live.</p>
              </div>
              <button
                onClick={handleSaveStoreSettings}
                disabled={isSavingStore}
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-sm transition-colors disabled:opacity-50"
              >
                {isSavingStore ? "Menyimpan Konfigurasi..." : "Simpan Konfigurasi CAPI"}
              </button>
            </div>
          )}
        </div>

        {/* Other Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Sosmed Shares */}
          {/* Sosmed Shares */}
          <div
            onClick={async () => {
              if (!store?.alias) return;
              const url = `${window.location.origin}/${store.alias}`;
              if (navigator.share) {
                try {
                  await navigator.share({
                    title: `${store.name} - UMKM Portal`,
                    text: `Kunjungi toko kami dan lihat katalog produk terbaru di ${store.name}!`,
                    url: url
                  });
                } catch (err) {
                  console.error("Share failed", err);
                }
              } else {
                navigator.clipboard.writeText(url);
                toast.success("Link Tersalin!", { description: "Link toko disalin ke clipboard." });
              }
            }}
            className="bg-card rounded-2xl shadow-sm border p-6 flex flex-col items-center text-center gap-3 hover:border-secondary/30 transition-all cursor-pointer"
          >
            <div className="w-14 h-14 rounded-full bg-pink-100 flex items-center justify-center">
              <Instagram className="w-6 h-6 text-pink-500" />
            </div>
            <div>
              <h4 className="font-bold">Sosmed Shares</h4>
              <p className="text-xs text-muted-foreground">Bagikan link toko ke sosmed atau WhatsApp.</p>
            </div>
          </div>

          {/* Image Generator */}
          <div className="bg-card rounded-2xl shadow-sm border overflow-hidden flex flex-col transition-all">
            <div onClick={() => setIsToolsExpanded(isToolsExpanded === 'ai' ? null : 'ai')} className="p-4 flex flex-col items-center text-center gap-3 cursor-pointer hover:bg-muted/10 relative">
              <div className="w-16 h-16 rounded-full bg-transparent flex items-center justify-center mt-2 shadow-sm border overflow-hidden">
                <img src={elv3} alt="eL Vision Logo" className="w-full h-full object-cover" />
              </div>
              <div>
                <h4 className="font-bold">eL Vision Image V.3 - Image Generator AI yang sangat powerful dan cerdas</h4>
                <p className="text-xs text-muted-foreground mb-3">Buat banner toko otomatis dengan AI eL Vision.</p>
                <div className="inline-block px-4 py-1.5 bg-purple-600 text-white font-bold text-xs rounded-full shadow-sm">
                  Buat Promo Disini ✨
                </div>
              </div>
            </div>

            {isToolsExpanded === 'ai' && (
              <div className="p-4 bg-muted/20 border-t space-y-4 text-left">
                <div className="space-y-3">
                  {/* Optional Image Upload */}
                  <div>
                    <label className="text-xs font-semibold text-foreground mb-1 flex items-center justify-between">
                      <span>Foto Produk Anda (Opsional)</span>
                      <span className="text-[10px] font-normal text-muted-foreground bg-secondary/10 text-secondary px-2 py-0.5 rounded-full">Background AI</span>
                    </label>
                    <div className="relative border-2 border-dashed rounded-xl border-border bg-background hover:bg-muted/30 transition-colors p-3 text-center cursor-pointer overflow-hidden flex flex-col items-center justify-center">
                      <input
                        type="file"
                        accept="image/*"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setAiImageRef(file);
                            setAiImageRefPreview(URL.createObjectURL(file));
                          }
                        }}
                      />
                      {aiImageRefPreview ? (
                        <div className="relative w-full h-24 rounded-lg overflow-hidden group">
                          <img src={aiImageRefPreview} alt="Reference" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-xs font-bold text-white mb-1">Ganti Foto</span>
                          </div>
                          <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setAiImageRef(null); setAiImageRefPreview(null); }} className="absolute top-1 right-1 w-6 h-6 bg-red-500 rounded-full text-white flex items-center justify-center z-20 hover:bg-red-600">×</button>
                        </div>
                      ) : (
                        <div className="py-2 flex flex-col items-center gap-1 opacity-60">
                          <ImageIcon className="w-6 h-6" />
                          <span className="text-xs font-medium">Pilih foto produk (di bawah 1MB)</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-foreground mb-1 block">Nama dan Detail Produk Anda</label>
                    <textarea
                      placeholder="Contoh: Sepatu Sneakers Pria warna putih dengan aksen biru tua..."
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      rows={4}
                      className="w-full px-3 py-2 rounded-xl border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none leading-relaxed"
                    />
                    <p className="text-[15px] font-medium text-purple-700/80 mt-3 italic leading-relaxed">
                      * Kamu cukup ketikan produk kamu secara simpel 5 kata saja , misalkan pisang goreng mini, bakso urat isi telor, burger mini sunda, AI eL Vision sudah canggih untuk buat Promo Image !
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleGenerateAiBanner}
                  disabled={isGeneratingAi || !aiPrompt}
                  className="w-full py-2.5 rounded-xl bg-purple-600 text-white font-bold shadow-sm hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isGeneratingAi ? "Membuat Mahakarya..." : <><Zap className="w-4 h-4 fill-white" /> Generate Banner</>}
                </button>

                {aiPreviewUrl && (
                  <div className="pt-4 border-t space-y-3">
                    <p className="text-xs font-semibold text-center text-muted-foreground">Preview Hasil AI:</p>
                    <img src={aiPreviewUrl} alt="AI Generated" className="w-full aspect-video object-cover rounded-xl shadow-sm border" />
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => {
                          const isBase64 = aiPreviewUrl.startsWith('data:image');
                          const blob = isBase64 ? base64ToBlob(aiPreviewUrl, 'image/jpeg') : null;
                          if (blob) {
                            const url = window.URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            const safeEmail = user?.email?.split('@')[0] || 'user';
                            const timestamp = Date.now();
                            a.download = `elvision_${safeEmail}_${timestamp}.jpg`;
                            document.body.appendChild(a);
                            a.click();
                            document.body.removeChild(a);
                            window.URL.revokeObjectURL(url);
                          } else {
                            window.open(aiPreviewUrl, '_blank');
                          }
                        }}
                        className="py-2.5 rounded-xl border border-secondary text-secondary font-bold text-xs flex items-center justify-center text-center hover:bg-secondary/10 transition-colors"
                      >
                        Simpan ke HP
                      </button>
                      <button
                        onClick={handleUseAiBanner}
                        disabled={isUploadingAi}
                        className="py-2.5 rounded-xl bg-secondary text-white font-bold text-xs flex items-center justify-center hover:opacity-90 transition-opacity disabled:opacity-50"
                      >
                        {isUploadingAi ? "Memproses..." : "Jadikan Produk Baru"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Education (LOCKED visually but clickable) */}
          <div
            onClick={() => {
              toast("Fitur Premium 🌟", {
                description: "Maaf Fitur ini untuk akun Pro.",
              });
            }}
            className="bg-card rounded-2xl shadow-sm border p-6 flex flex-col items-center text-center gap-3 md:col-span-2 hover:border-amber-400 transition-colors cursor-pointer"
          >
            <div className="w-14 h-14 rounded-full bg-orange-100 flex items-center justify-center">
              <Zap className="w-6 h-6 text-orange-500" />
            </div>
            <div>
              <h4 className="font-bold flex justify-center items-center gap-2">
                Edukasi Jualan Laris <span className="text-[9px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider">Pro Only</span>
              </h4>
              <p className="text-xs text-muted-foreground mt-1">Strategi meningkatkan omset dari master UMKM.</p>
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
            Mulai Sekarang
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
        <div className="bg-card rounded-2xl shadow-sm border p-8 flex flex-col items-center text-center max-w-md mx-auto relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <h2 className="text-2xl font-black text-amber-950 mb-1 tracking-tight capitalize">{displayName || user?.email}</h2>
          <p className="text-xs text-muted-foreground flex items-center justify-center gap-1 font-bold bg-amber-100/50 text-amber-700 px-3 py-1 rounded-full border border-amber-200">
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

            <div className="py-3 border-b border-dashed">
              <label className="text-sm text-muted-foreground block mb-2">Nama Tampilan</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Masukkan nama tampilan..."
                  className="flex-1 px-3 py-2 rounded-lg border bg-background text-sm"
                />
                <button
                  onClick={handleUpdateDisplayName}
                  disabled={isUpdatingName}
                  className="px-3 py-2 bg-secondary text-white rounded-lg text-sm font-bold shadow-sm disabled:opacity-50"
                >
                  {isUpdatingName ? "..." : "Simpan"}
                </button>
              </div>
            </div>

            <div className="py-3 border-b border-dashed">
              <label className="text-sm text-muted-foreground block mb-2">Ubah Email Login</label>
              <div className="flex items-center gap-2">
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder={user?.email || "Email baru..."}
                  className="flex-1 px-3 py-2 rounded-lg border bg-background text-sm"
                />
                <button
                  onClick={handleUpdateEmail}
                  disabled={isUpdatingEmail || !newEmail}
                  className="px-3 py-2 bg-secondary text-white rounded-lg text-sm font-bold shadow-sm disabled:opacity-50"
                >
                  {isUpdatingEmail ? "..." : "Simpan"}
                </button>
              </div>
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
          <button
            onClick={() => {
              toast("Informasi Langganan 🌟", {
                description: "Untuk saat ini Pro belum tersedia dan full Free.",
              });
            }}
            className="col-span-1 md:col-span-2 p-4 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-600 text-white font-bold shadow-lg flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
          >
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
          <div className="mt-3 border-t border-border/50 pt-3">
            Lupa Password? <button onClick={handleForgotPassword} className="text-destructive font-semibold hover:underline ml-1">Reset Via Email</button>
          </div>
        </div>
      </div>
    </div>
  );

  const createStoreContent = (
    <div className="min-h-screen bg-muted/30 pb-24 md:pb-12 pt-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8 flex items-center gap-4 border-b border-border/50 pb-4">
          <button onClick={() => setView("home")} className="p-3 bg-card border rounded-xl shadow-sm hover:bg-muted transition-colors shrink-0">
            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-foreground text-left">Buat Toko Online</h1>
            <p className="text-xs text-muted-foreground mt-1 text-left">Lengkapi detail untuk membuat website toko.</p>
          </div>
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
                  onChange={(e) => {
                    const val = e.target.value;
                    if (['ungu', 'yellow', 'pink'].includes(val)) {
                      toast.error("Maaf Fitur ini Khusus Pro 🔒", { description: "Upgrade ke Pro untuk unlock semua tema premium." });
                      return;
                    }
                    setSetupForm({ ...setupForm, theme: val });
                  }}
                  className="w-full px-4 py-3 rounded-xl border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-secondary/50"
                >
                  <option value="light">Terang</option>
                  <option value="gelap">Gelap</option>
                  <option value="ungu">Ungu 🔒</option>
                  <option value="yellow">Yellow 🔒</option>
                  <option value="pink">Pink 🔒</option>
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
                          type="text"
                          inputMode="numeric"
                          placeholder="25.000"
                          value={formatInputRp(p.price)}
                          onChange={(e) => {
                            const newProducts = [...setupForm.products];
                            newProducts[index].price = parseRp(e.target.value);
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
    </div >
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
                <label className="text-sm font-semibold text-foreground mb-1 block">Nomor WhatsApp Toko</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">+62</span>
                  <input
                    type="tel"
                    value={storeSettingsForm.waNumber}
                    onChange={(e) => setStoreSettingsForm({ ...storeSettingsForm, waNumber: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 rounded-xl border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-secondary/50"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold text-foreground mb-1 block">Web URL (Alias)</label>
                {store?.alias ? (
                  <div className="flex flex-col gap-2">
                    <div className="w-full px-3 py-3 rounded-xl border bg-muted/30 text-[11px] md:text-sm text-foreground flex items-center justify-between gap-2 overflow-x-auto">
                      <div className="flex items-center gap-1.5 whitespace-nowrap">
                        <Lock className="w-4 h-4 text-muted-foreground shrink-0 hidden sm:block" />
                        <span className="text-muted-foreground">umkm.elvisiongroup.com/</span>
                        <span className="font-bold text-foreground bg-amber-100 text-amber-950 px-1 rounded">{storeSettingsForm.alias}</span>
                      </div>
                      <button
                        onClick={() => {
                          const url = `https://umkm.elvisiongroup.com/${storeSettingsForm.alias}`;

                          const handleSuccess = () => toast.success("Link Tersalin ke Clipboard! 🚀", { description: url });
                          const handleError = () => toast.error("Gagal menyalin link.");

                          if (navigator.clipboard && window.isSecureContext) {
                            navigator.clipboard.writeText(url)
                              .then(handleSuccess)
                              .catch(handleError);
                          } else {
                            // Fallback for non-HTTPS local networks (Mobile preview)
                            const textArea = document.createElement("textarea");
                            textArea.value = url;
                            document.body.appendChild(textArea);
                            textArea.select();
                            try {
                              document.execCommand('copy');
                              handleSuccess();
                            } catch (err) {
                              handleError();
                            }
                            document.body.removeChild(textArea);
                          }
                        }}
                        className="p-2 -mr-2 bg-secondary/10 text-secondary hover:bg-secondary hover:text-white rounded-lg transition-colors shrink-0 flex items-center gap-1 z-10"
                        title="Copy Penuh URL Toko"
                        type="button"
                      >
                        <Copy className="w-4 h-4" />
                        <span className="text-xs font-bold hidden sm:inline">Copy</span>
                      </button>
                    </div>
                    <p className="text-xs font-bold text-secondary flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> copy url ini toko punya kamu
                    </p>
                  </div>
                ) : (
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">/</span>
                    <input
                      type="text"
                      value={storeSettingsForm.alias}
                      onChange={(e) => setStoreSettingsForm({ ...storeSettingsForm, alias: e.target.value })}
                      className="w-full pl-8 pr-4 py-3 rounded-xl border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-secondary/50"
                    />
                  </div>
                )}
                <p className="text-xs text-muted-foreground mt-1">URL publik untuk toko Anda. *hanya bisa diganti 1x</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-foreground mb-1 block">Rekening Pembayaran (BCA/Mandiri dll)</label>
                  <input
                    type="text"
                    value={storeSettingsForm.payment}
                    onChange={(e) => setStoreSettingsForm({ ...storeSettingsForm, payment: e.target.value })}
                    placeholder="Contoh: BCA 12345678 a/n Budi"
                    className="w-full px-4 py-3 rounded-xl border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-secondary/50"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Ini akan ditampilkan ke pembeli saat checkout.</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-foreground mb-1 block">Alamat Toko</label>
                  <input
                    type="text"
                    value={storeSettingsForm.address}
                    onChange={(e) => setStoreSettingsForm({ ...storeSettingsForm, address: e.target.value })}
                    placeholder="Contoh: Jl. Sudirman No 42"
                    className="w-full px-4 py-3 rounded-xl border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-secondary/50"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-foreground mb-2 block">Logo / Hero Banner (16:9)</label>
                <div
                  onClick={() => document.getElementById('logo-upload-input')?.click()}
                  className="w-full h-48 rounded-xl border-2 border-dashed border-muted-foreground/30 bg-muted/10 flex flex-col items-center justify-center cursor-pointer hover:border-secondary/50 hover:bg-secondary/5 transition-all overflow-hidden relative"
                >
                  {logoPreview ? (
                    <img src={logoPreview} alt="Logo Preview" className="w-full h-full object-cover" />
                  ) : (
                    <>
                      <UploadCloud className="w-8 h-8 text-muted-foreground mb-2" />
                      <span className="text-sm text-muted-foreground font-medium">Klik untuk upload Banner Toko</span>
                      <span className="text-xs text-muted-foreground/60 mt-1">Disarankan ukuran Horizontal 16:9</span>
                    </>
                  )}
                </div>
                <input
                  id="logo-upload-input"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setLogoFile(file);
                      const reader = new FileReader();
                      reader.onloadend = () => setLogoPreview(reader.result as string);
                      reader.readAsDataURL(file);
                    }
                  }}
                />
                {logoPreview && (
                  <button
                    type="button"
                    onClick={() => { setLogoFile(null); setLogoPreview(null); setStoreSettingsForm({ ...storeSettingsForm, logo_url: "" }); }}
                    className="text-xs text-destructive mt-2 hover:underline"
                  >
                    Hapus Logo
                  </button>
                )}
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
              {/* New/Edit Product Form */}
              <div id="tambah-produk" className="p-4 rounded-xl border bg-muted/20 space-y-4 mb-6 relative">
                <h4 className="font-semibold text-sm">{newProduct.id ? "Edit Produk" : "Tambah Produk Baru"}</h4>
                {newProduct.id && (
                  <button
                    onClick={() => {
                      setNewProduct({ id: "", name: "", description: "", price: "", imageFile: null });
                      setProductImagePreview(null);
                    }}
                    className="absolute top-4 right-4 text-xs font-bold text-muted-foreground hover:text-foreground"
                  >
                    Batal Edit
                  </button>
                )}
                <div className="flex flex-col gap-3">
                  <input
                    type="text"
                    placeholder="Nama Produk"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                    className="w-full px-3 py-3 rounded-xl border bg-background text-sm focus:ring-2 focus:ring-secondary/50 focus:outline-none"
                  />
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="Harga (Rp)"
                    value={formatInputRp(newProduct.price)}
                    onChange={(e) => setNewProduct({ ...newProduct, price: parseRp(e.target.value) })}
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
                  {/* Image Upload with Preview */}
                  <div
                    onClick={() => document.getElementById('product-image-input')?.click()}
                    className="w-full h-32 rounded-xl border-2 border-dashed border-muted-foreground/30 bg-muted/10 flex flex-col items-center justify-center cursor-pointer hover:border-secondary/50 hover:bg-secondary/5 transition-all overflow-hidden"
                  >
                    {productImagePreview ? (
                      <img src={productImagePreview} alt="Preview" className="w-full h-full object-contain p-2" />
                    ) : (
                      <>
                        <ImageIcon className="w-6 h-6 text-muted-foreground mb-1" />
                        <span className="text-xs text-muted-foreground font-medium">Klik untuk pilih foto produk</span>
                      </>
                    )}
                  </div>
                  <input
                    id="product-image-input"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      setNewProduct({ ...newProduct, imageFile: file });
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => setProductImagePreview(reader.result as string);
                        reader.readAsDataURL(file);
                      } else {
                        setProductImagePreview(null);
                      }
                    }}
                  />
                </div>

                <button
                  onClick={async () => {
                    await handleSaveProduct();
                    setProductImagePreview(null);
                  }}
                  disabled={isSavingProduct || !newProduct.name || !newProduct.price}
                  className="w-full px-4 py-3 rounded-xl bg-secondary text-white text-sm font-bold shadow-sm disabled:opacity-50 hover:opacity-90 transition-opacity mt-2"
                >
                  {isSavingProduct ? "Menyimpan..." : (newProduct.id ? "Simpan Perubahan Produk" : "Tambah Produk")}
                </button>
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
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setNewProduct({
                            id: p.id,
                            name: p.name,
                            description: p.description || "",
                            price: p.price.toString(),
                            imageFile: null
                          });
                          setProductImagePreview(p.image_url);
                          window.scrollTo({ top: document.body.scrollHeight / 2, behavior: 'smooth' });
                        }}
                        className="p-2 text-blue-500 hover:bg-blue-500/10 rounded-lg"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /></svg>
                      </button>
                      <button
                        onClick={async () => {
                          if (confirm('Yakin ingin menghapus produk ini?')) {
                            const { error } = await supabase.from('stores_product').delete().eq('id', p.id);
                            if (!error) fetchStoreData(user.id);
                          }
                        }}
                        className="p-2 text-destructive hover:bg-destructive/10 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
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
    </div >
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

  if (view === "live-store") {
    // Determine data to show (Real data only)
    return (
      <div className="min-h-screen pb-20 md:pb-0 relative bg-muted/30">
        <div className="max-w-md mx-auto min-h-screen bg-card shadow-xl overflow-hidden">
          {storeContent}
        </div>
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
