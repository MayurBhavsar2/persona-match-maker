import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
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
import NavbarWithSidebar from "./components/Navbar";
import Dashboard from "./pages/DashBoard";
import UserList from "./pages/UserList";
import AddUser from "./pages/AddUser";

const queryClient = new QueryClient();

const Layout: React.FC = () => {
  return (
    <div className="min-h-screen relative w-full">
      <NavbarWithSidebar />
      <Outlet />
    </div>
  );
};

const App = () => {
  console.log("updated build: 29/10/2025 - contains persona input, role+persona value in results")
  return (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Routes WITHOUT Navbar */}
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          
          {/* Routes WITH Navbar - wrapped in Layout */}
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/user-list" element={<UserList />} />
            <Route path="/add-user" element={<AddUser />} />
            <Route path="/jd-upload" element={<JDUpload />} />
            <Route path="/jd-comparison" element={<JDComparison />} />
            <Route path="/jd-comparison/:jdId" element={<JDComparison />}/>
            <Route path="/persona-config" element={<PersonaConfig />} />
            <Route path="/persona-config/:jdId" element={<PersonaConfig />} />
            <Route path="/candidate-upload" element={<CandidateUpload />} />
            <Route path="/results" element={<Results />} />
            <Route path="/configuration" element={<Configuration />} />
          </Route>

          {/* Catch-all route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
  )
}

export default App;
