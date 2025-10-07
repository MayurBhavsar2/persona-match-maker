import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Briefcase, Users, BarChart3, Settings, ArrowLeft } from "lucide-react";

interface LayoutProps {
  children: ReactNode;
  currentStep?: number;
}

const Layout = ({ children, currentStep }: LayoutProps) => {
  const navigate = useNavigate();
  
  const steps = [
    { id: 1, title: "Job Description", icon: Briefcase },
    { id: 2, title: "Persona Configuration", icon: Users },
    { id: 3, title: "Candidate Evaluation", icon: BarChart3 },
    { id: 4, title: "Results & Analytics", icon: Settings },
  ];

  const handleBackClick = () => {
    switch (currentStep) {
      case 2:
        navigate('/jd-upload');
        break;
      case 3:
        navigate('/persona-config');
        break;
      case 4:
        navigate('/candidate-upload');
        break;
      default:
        navigate('/');
        break;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <header className="bg-background border-b border-border shadow-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Altumind</h1>
                <p className="text-sm text-muted-foreground">Intelligent Recruitment Platform</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-foreground">Admin User</p>
                <p className="text-xs text-muted-foreground">admin@company.com</p>
              </div>
              <div className="w-8 h-8 bg-gradient-secondary rounded-full flex items-center justify-center">
                <span className="text-xs font-bold text-secondary-foreground">AU</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      {currentStep && (
        <div className="bg-background border-b border-border sticky top-0 z-40">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              {/* Back Button */}
              {currentStep && currentStep > 1 && (
                <Button 
                  variant="ghost" 
                  onClick={handleBackClick}
                  className="mr-4 text-muted-foreground hover:text-foreground"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              )}
              
              <div className={`flex items-center justify-between ${currentStep && currentStep > 1 ? 'flex-1' : 'w-full'}`}>
                {steps.map((step, index) => {
                  const IconComponent = step.icon;
                  const isActive = step.id === currentStep;
                  const isCompleted = step.id < currentStep;
                  
                  return (
                    <div key={step.id} className="flex items-center">
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-smooth ${
                          isActive 
                            ? 'bg-gradient-primary text-primary-foreground shadow-lg' 
                            : isCompleted 
                              ? 'bg-success text-success-foreground' 
                              : 'bg-muted text-muted-foreground'
                        }`}>
                          <IconComponent className="w-5 h-5" />
                        </div>
                        <div>
                          <p className={`text-sm font-medium ${
                            isActive ? 'text-primary' : isCompleted ? 'text-success' : 'text-muted-foreground'
                          }`}>
                            Step {step.id}
                          </p>
                          <p className={`text-xs ${
                            isActive ? 'text-foreground' : 'text-muted-foreground'
                          }`}>
                            {step.title}
                          </p>
                        </div>
                      </div>
                      
                      {index < steps.length - 1 && (
                        <div className={`h-0.5 w-16 mx-4 transition-smooth ${
                          isCompleted ? 'bg-success' : 'bg-border'
                        }`} />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {children}
      </main>
    </div>
  );
};

export default Layout;