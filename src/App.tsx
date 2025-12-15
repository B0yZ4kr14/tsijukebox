import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Install from "./pages/Install";
import Admin from "./pages/Admin";
import AdminLibrary from "./pages/AdminLibrary";
import AdminLogs from "./pages/AdminLogs";
import AdminFeedback from "./pages/AdminFeedback";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/install" element={<Install />} />
            
            {/* Protected Admin Routes */}
            <Route path="/admin" element={
              <ProtectedRoute><Admin /></ProtectedRoute>
            } />
            <Route path="/admin/library" element={
              <ProtectedRoute><AdminLibrary /></ProtectedRoute>
            } />
            <Route path="/admin/logs" element={
              <ProtectedRoute><AdminLogs /></ProtectedRoute>
            } />
            <Route path="/admin/feedback" element={
              <ProtectedRoute><AdminFeedback /></ProtectedRoute>
            } />
            
            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
