import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { I18nProvider } from "@/i18n/I18nContext";
import { AuthProvider } from "@/auth/AuthContext";
import Index from "./pages/Index.tsx";
import BlogPost from "./pages/BlogPost.tsx";
import Auth from "./pages/Auth.tsx";
import Enroll from "./pages/Enroll.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import TeacherProfile from "./pages/TeacherProfile.tsx";
import Teacher from "./pages/Teacher.tsx";
import Admin from "./pages/Admin.tsx";
import Schedule from "./pages/Schedule.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <I18nProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/blog/:slug" element={<BlogPost />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/enroll" element={<Enroll />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/teacher/:teacherId" element={<TeacherProfile />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/schedule" element={<Schedule />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </I18nProvider>
  </QueryClientProvider>
);

export default App;
