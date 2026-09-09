import { Suspense, lazy, useEffect } from "react";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ErrorBoundary from "@/components/layout/ErrorBoundary";
import { LoaderCircle } from "lucide-react";

import Index from "@/pages/Index";
const About = lazy(() => import("@/pages/About"));
const Events = lazy(() => import("@/pages/Events"));
const Gallery = lazy(() => import("@/pages/Gallery"));
const Team = lazy(() => import("@/pages/Team"));
const JoinTeam = lazy(() => import("@/pages/JoinTeam"));
const Scanner = lazy(() => import("@/pages/Scanner"));
const Admin = lazy(() => import("@/pages/Admin"));
const Register = lazy(() => import("@/pages/Register"));
const NotFound = lazy(() => import("@/pages/NotFound"));

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 60_000, refetchOnWindowFocus: false } },
});

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [pathname]);
  return null;
}

function RouteFallback() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-3">
      <LoaderCircle className="h-6 w-6 animate-spin text-brand" />
      <p className="text-sm text-muted">Loading…</p>
    </div>
  );
}

function Shell() {
  const { pathname } = useLocation();
  const operational = pathname.startsWith("/admin") || pathname.startsWith("/scan");

  return (
    <div className="relative flex min-h-screen flex-col bg-canvas">
      <Header />
      <main id="main" className="flex-1 pt-20 sm:pt-24">
        <ErrorBoundary>
          <Suspense fallback={<RouteFallback />}>
            <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/about" element={<About />} />
            <Route path="/events" element={<Events />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/team" element={<Team />} />
            <Route path="/join" element={<JoinTeam />} />
            <Route path="/scan" element={<Scanner />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/register/:eventId" element={<Register />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </main>
      {operational ? null : <Footer />}
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ScrollToTop />
        <Shell />
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              borderRadius: "14px",
              border: "1px solid var(--color-line)",
              color: "var(--color-ink)",
              boxShadow: "var(--shadow-md)",
            },
          }}
        />
      </BrowserRouter>
    </QueryClientProvider>
  );
}
