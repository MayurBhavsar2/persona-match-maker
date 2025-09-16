import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase, Users, BarChart3, ArrowRight, Sparkles, Shield, Clock } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Briefcase,
      title: "Smart JD Analysis",
      description: "AI-powered job description optimization and enhancement"
    },
    {
      icon: Users,
      title: "Persona Configuration",
      description: "Customizable candidate scoring and weightage system"
    },
    {
      icon: BarChart3,
      title: "Intelligent Matching",
      description: "Advanced CV evaluation with detailed analytics"
    },
    {
      icon: Shield,
      title: "Secure & Reliable",
      description: "Enterprise-grade security for your recruitment data"
    },
    {
      icon: Clock,
      title: "Time Efficient",
      description: "Reduce hiring time by up to 75% with automation"
    },
    {
      icon: Sparkles,
      title: "AI-Powered",
      description: "Latest machine learning for accurate candidate assessment"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Hero Section */}
      <div className="container mx-auto px-6 py-16">
        <div className="text-center space-y-8 max-w-4xl mx-auto">
          <div className="space-y-4">
            <h1 className="text-5xl font-bold text-foreground leading-tight">
              Intelligent Recruitment
              <span className="block bg-gradient-primary bg-clip-text text-transparent">
                Made Simple
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Transform your hiring process with AI-powered job description analysis, 
              smart candidate matching, and comprehensive evaluation tools.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={() => navigate('/jd-upload')}
              className="bg-gradient-primary hover:opacity-90 transition-smooth px-8 py-6 text-lg"
            >
              Start Recruiting
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button 
              variant="outline" 
              className="px-8 py-6 text-lg"
            >
              Watch Demo
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <Card key={index} className="shadow-card hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mb-4">
                    <IconComponent className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Process Overview */}
        <div className="mt-24">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">How It Works</h2>
            <p className="text-lg text-muted-foreground">
              Simple 4-step process to find your perfect candidates
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              {
                step: "1",
                title: "Upload JD",
                description: "Upload your job description and let AI enhance it"
              },
              {
                step: "2", 
                title: "Configure Persona",
                description: "Set skill weightage and create ideal candidate profile"
              },
              {
                step: "3",
                title: "Upload CVs",
                description: "Bulk upload candidate resumes for evaluation"
              },
              {
                step: "4",
                title: "Get Results",
                description: "Review ranked candidates with detailed analytics"
              }
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-gradient-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-xl font-bold text-secondary-foreground">{item.step}</span>
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">{item.title}</h3>
                <p className="text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-24">
          <Card className="shadow-xl bg-gradient-primary text-primary-foreground">
            <CardContent className="text-center py-16">
              <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Hiring?</h2>
              <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
                Join hundreds of companies using AI-powered recruitment to find the best talent faster.
              </p>
              <Button 
                variant="secondary"
                onClick={() => navigate('/jd-upload')}
                className="px-8 py-6 text-lg"
              >
                Get Started Now
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
