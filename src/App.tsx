import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import PublicLayout from "@/components/layout/PublicLayout";
import AdminLayout from "@/components/layout/AdminLayout";
import HomePage from "@/pages/HomePage";
import ProjectsPage from "@/pages/ProjectsPage";
import ProjectDetailPage from "@/pages/ProjectDetailPage";
import AboutPage from "@/pages/AboutPage";
import ResumePage from "@/pages/ResumePage";
import ContactPage from "@/pages/ContactPage";
import CertificatesPage from "@/pages/CertificatesPage";
import AdminLoginPage from "@/pages/admin/AdminLoginPage";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminProjectsPage from "@/pages/admin/AdminProjectsPage";
import AdminProjectFormPage from "@/pages/admin/AdminProjectFormPage";
import AdminExperiencePage from "@/pages/admin/AdminExperiencePage";
import AdminSkillsPage from "@/pages/admin/AdminSkillsPage";
import AdminTestimonialsPage from "@/pages/admin/AdminTestimonialsPage";
import AdminSettingsPage from "@/pages/admin/AdminSettingsPage";
import AdminMessagesPage from "@/pages/admin/AdminMessagesPage";
import AdminCertificatesPage from "@/pages/admin/AdminCertificatesPage";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/projects" element={<ProjectsPage />} />
              <Route path="/projects/:slug" element={<ProjectDetailPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/resume" element={<ResumePage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/certificates" element={<CertificatesPage />} />
            </Route>

            {/* Admin */}
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
              <Route index element={<AdminDashboard />} />
              <Route path="projects" element={<AdminProjectsPage />} />
              <Route path="projects/new" element={<AdminProjectFormPage />} />
              <Route path="projects/:id/edit" element={<AdminProjectFormPage />} />
              <Route path="experience" element={<AdminExperiencePage />} />
              <Route path="skills" element={<AdminSkillsPage />} />
              <Route path="testimonials" element={<AdminTestimonialsPage />} />
              <Route path="settings" element={<AdminSettingsPage />} />
              <Route path="messages" element={<AdminMessagesPage />} />
              <Route path="certificates" element={<AdminCertificatesPage />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
