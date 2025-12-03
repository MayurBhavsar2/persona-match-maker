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
import CandidateListPage from "./pages/CandidateListPage";
import UpdatedJDUpload from "./pages/UpdatedJDUpload";
import ReusableJDUpload from "./pages/ReusableJDUpload";
import ReusablePersonaConfig from "./pages/ReusablePersonaConfig2";
import UpdatedResults from "./pages/UpdatedResults";
import PersistentNavbar, { SidebarContent, SidebarProvider } from "./components/PersistentNavbar";

const queryClient = new QueryClient();

const Layout: React.FC = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen relative w-full">
        <PersistentNavbar />
        <SidebarContent>
          <Outlet />
        </SidebarContent>
      </div>
    </SidebarProvider>
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

              {/* Legacy routes for backward compatibility */}
              <Route path="/user-list" element={<UserList />} />
              <Route path="/add-user" element={<AddUser />} />
              {/* <Route path="/jd-upload" element={<UpdatedJDUpload />} /> */}
              <Route path="/jd-comparison" element={<JDComparison />} />
              <Route path="/jd-comparison/:jdId" element={<JDComparison />} />
              {/* <Route path="/persona-config" element={<PersonaConfig />} /> */}
              {/* <Route path="/persona-config/:jdId" element={<PersonaConfig />} /> */}
              <Route path="/candidate-upload" element={<CandidateUpload />} />
              <Route path="/results" element={<Results />} />
              <Route path="/configuration" element={<Configuration />} />

              {/* New enhanced navigation routes */}
              {/* Job Description routes */}
              <Route path="/jd/create" element={<ReusableJDUpload />} />
              <Route path="/jd/edit/:jdId" element={<ReusableJDUpload />} />
              <Route path="/jd/list" element={
                <JDListPage />
              } />
              <Route path="/users/list" element={
                <UserListPage />
              } />

              {/* Persona Management routes */}
              <Route path="/persona/create" element={<ReusablePersonaConfig />} />
              <Route path="/persona/create/:jdId" element={<ReusablePersonaConfig />} />
              <Route path="/persona/edit/:personaId" element={<ReusablePersonaConfig />} />
              <Route path="/persona/list" element={<PersonaListPage />} />

              {/* Candidate Processing routes */}
              <Route path="/candidate/upload" element={<CandidateUpload />} />
              <Route path="/candidate/list" element={<CandidateListPage />} />
              {/* Evaluation routes */}
              <Route path="/evaluation" element={<Evaluation />} />
              <Route path="/evaluation/start" element={<Evaluation />} />
              <Route path="/evaluation/flow" element={<Evaluation />} />
              <Route path="/results/:personaId" element={<UpdatedResults />} />
              <Route path="/evaluation/results/:evaluationId" element={<Results />} />
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
