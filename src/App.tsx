import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";

// Lazy Loaded Routes
// Lazy Loaded Routes
const Index = lazy(() => import("./pages/Index")) as React.LazyExoticComponent<React.FC<{ bypassHome?: boolean }>>;
const NotFound = lazy(() => import("./pages/NotFound"));
const Auth = lazy(() => import("./pages/Auth").then(m => ({ default: m.Auth })));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
import ServiceWorkerUpdater from "./components/ServiceWorkerUpdater";

// Loading Fallback Component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-muted/30">
    <div className="flex flex-col items-center gap-4">
      <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-sm font-semibold text-muted-foreground animate-pulse">Menyiapkan Aplikasi...</p>
    </div>
  </div>
);

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner
        position="top-center"
        expand={false}
        toastOptions={{
          style: {
            background: 'linear-gradient(135deg, #FFFEFA 0%, #FFF9E6 50%, #F5E6A1 100%)',
            border: '1px solid #E5C158',
            color: '#8B6508',
            boxShadow: '0 8px 24px rgba(218, 165, 32, 0.2)',
            fontWeight: '600',
            borderRadius: '16px',
            padding: '16px'
          },
          className: 'gold-toast'
        }}
      />
      <BrowserRouter>
        <ServiceWorkerUpdater />
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/pageseller" element={<Index bypassHome={true} />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/:alias" element={<Index />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
