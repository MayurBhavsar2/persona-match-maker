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
import Evaluation from "./pages/Evaluation";
import Configuration from "./pages/Configuration";
import NotFound from "./pages/NotFound";
import EnhancedNavbar from "./components/EnhancedNavbar";
import PlaceholderPage from "./components/PlaceholderPage";
import Dashboard from "./pages/DashBoard";
import UserList from "./pages/UserListPage";
import AddUser from "./pages/AddUser";
import JDListPage from "./pages/JDListPage";
import UserListPage from "./pages/UserListPage";
import PersonaListPage from "./pages/PersonaListPage";

const queryClient = new QueryClient();

const Layout: React.FC = () => {
  return (
    <div className="min-h-screen relative w-full">
      <EnhancedNavbar />
      <Outlet />
    </div>
  );
};

const App = () => (
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

            {/* Legacy routes for backward compatibility */}
            <Route path="/user-list" element={<UserList />} />
            <Route path="/add-user" element={<AddUser />} />
            <Route path="/jd-upload" element={<JDUpload />} />
            <Route path="/jd-comparison" element={<JDComparison />} />
            <Route path="/jd-comparison/:jdId" element={<JDComparison />} />
            <Route path="/persona-config" element={<PersonaConfig />} />
            <Route path="/persona-config/:jdId" element={<PersonaConfig />} />
            <Route path="/candidate-upload" element={<CandidateUpload />} />
            <Route path="/results" element={<Results />} />
            <Route path="/configuration" element={<Configuration />} />

            {/* New enhanced navigation routes */}
            {/* Job Description routes */}
            <Route path="/jd/create" element={<JDUpload />} />
            <Route path="/jd/edit/:jdId" element={<JDUpload />} />
            <Route path="/jd/list" element={
             <JDListPage />
            } />
            <Route path="/users/list" element={
             <UserListPage />
            } />

            {/* Persona Management routes */}
            <Route path="/persona/create" element={<PersonaConfig />} />
            <Route path="/persona/create/:jdId" element={<PersonaConfig />} />
            <Route path="/persona/edit/:personaId" element={<PersonaConfig />} />
            <Route path="/persona/list" element={<PersonaListPage />} />

            {/* Candidate Processing routes */}
            <Route path="/candidate/upload" element={<CandidateUpload />} />
            <Route path="/candidate/list" element={
              <PlaceholderPage
                title="Candidate List"
                description="Manage and view all your candidates"
                backPath="/dashboard"
                backLabel="Back to Dashboard"
              />
            } />

            {/* Evaluation routes */}
            <Route path="/evaluation" element={<Evaluation />} />
            <Route path="/evaluation/start" element={<Evaluation />} />
            <Route path="/evaluation/results" element={<Results />} />
            <Route path="/evaluation/results/:evaluationId" element={<Results />} />
          </Route>

          {/* Catch-all route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
