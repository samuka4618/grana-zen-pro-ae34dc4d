import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { OfflineIndicator } from "@/components/OfflineIndicator";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Analytics from "./pages/Analytics";
import CreditCards from "./pages/CreditCards";
import BankAccounts from "./pages/BankAccounts";
import SharedAccess from "./pages/SharedAccess";
import Investments from "./pages/Investments";
import InstallPWA from "./pages/InstallPWA";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <OfflineIndicator />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Index />
                </ProtectedRoute>
              }
            />
            <Route
              path="/analytics"
              element={
                <ProtectedRoute>
                  <Analytics />
                </ProtectedRoute>
              }
            />
            <Route
              path="/credit-cards"
              element={
                <ProtectedRoute>
                  <CreditCards />
                </ProtectedRoute>
              }
            />
          <Route
            path="/bank-accounts"
            element={
              <ProtectedRoute>
                <BankAccounts />
              </ProtectedRoute>
            }
          />
          <Route
            path="/shared-access"
            element={
              <ProtectedRoute>
                <SharedAccess />
              </ProtectedRoute>
            }
          />
          <Route
            path="/investments"
            element={
              <ProtectedRoute>
                <Investments />
              </ProtectedRoute>
            }
          />
          <Route path="/install" element={<InstallPWA />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
