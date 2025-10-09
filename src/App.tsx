import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import JDComparison from "./pages/JDComparison";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import JDUpload from "./pages/JDUpload";
import PersonaConfig from "./pages/PersonaConfig";
import CandidateUpload from "./pages/CandidateUpload";
import Results from "./pages/Results";
import Configuration from "./pages/Configuration";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/jd-upload" element={<JDUpload />} />
          <Route path="/jd-comparison" element={<JDComparison />} />
          <Route path="/jd-comparison/:jdId" element={<JDComparison />}/>
          <Route path="/persona-config" element={<PersonaConfig />} />
          <Route path="/candidate-upload" element={<CandidateUpload />} />
          <Route path="/results" element={<Results />} />
          <Route path="/configuration" element={<Configuration />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
