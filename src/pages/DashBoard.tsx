import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlayCircle, FileText, UserCheck, Users, BarChart3 } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";


const Dashboard: React.FC = () => {
    const navigate = useNavigate();
    const token = localStorage.getItem("token")
    const { toast } = useToast();

    const sampleArray = [
        {val:12, text:"Number of Personas"},
        {val:28, text:"Number of Candidates"},
        {val:7, text:"Number of Matches"}
    ];

    const handleStartNewRole = () => {
        // Start the sequential workflow
        navigate('/jd/create');
    };

    const quickActions = [
        {
            title: "Job Descriptions",
            description: "Create and manage job descriptions",
            icon: FileText,
            path: "/jd/list",
            color: "bg-blue-500"
        },
        {
            title: "Persona Management",
            description: "Configure evaluation personas",
            icon: UserCheck,
            path: "/persona/list",
            color: "bg-green-500"
        },
        {
            title: "Candidate Processing",
            description: "Upload and manage candidates",
            icon: Users,
            path: "/candidate/list",
            color: "bg-purple-500"
        },
        {
            title: "Evaluation Results",
            description: "View and analyze evaluations",
            icon: BarChart3,
            path: "/evaluation/results",
            color: "bg-orange-500"
        }
    ];

    useEffect(()=>{
        if(!token) {
            toast({
                title: "Authentication Error",
                description: "You've not logged in. Please login to continue.",
                variant: "destructive",
              })
              navigate("/login")
        }
    },[])

    return(
        <div className="w-full p-8 font-sans space-y-8">
            {/* Start New Role Section */}
            <div className="w-full max-w-4xl mx-auto">
                <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0">
                    <CardHeader className="text-center">
                        <CardTitle className="text-2xl font-bold flex items-center justify-center gap-2">
                            <PlayCircle className="w-8 h-8" />
                            Start New Role
                        </CardTitle>
                        <CardDescription className="text-blue-100 text-lg">
                            Begin the guided workflow to create a complete recruitment pipeline
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="text-center">
                        <p className="mb-6 text-blue-100">
                            Follow the sequential process: Job Description → Persona → Candidate Upload → Evaluation
                        </p>
                        <Button 
                            onClick={handleStartNewRole}
                            size="lg"
                            className="bg-white text-blue-600 hover:bg-blue-50 font-semibold px-8 py-3"
                        >
                            Start Sequential Workflow
                        </Button>
                    </CardContent>
                </Card>
            </div>

            {/* Statistics Cards */}
            {/* <div className="grid md:grid-cols-3 grid-cols-1 w-full place-items-center gap-6">
                {sampleArray?.map((item, index) => (
                    <div className="md:w-[350px] w-full p-6 border rounded-lg hover:shadow-xl hover:scale-105 transition-all duration-300 ease-in-out shadow-sm bg-gray-800 border-gray-700" key={item?.text}>
                        <div className="flex justify-start items-center gap-2">
                            <svg className="w-7 h-7 text-gray-400 mb-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M18 5h-.7c.229-.467.349-.98.351-1.5a3.5 3.5 0 0 0-3.5-3.5c-1.717 0-3.215 1.2-4.331 2.481C8.4.842 6.949 0 5.5 0A3.5 3.5 0 0 0 2 3.5c.003.52.123 1.033.351 1.5H2a2 2 0 0 0-2 2v3a1 1 0 0 0 1 1h18a1 1 0 0 0 1-1V7a2 2 0 0 0-2-2ZM8.058 5H5.5a1.5 1.5 0 0 1 0-3c.9 0 2 .754 3.092 2.122-.219.337-.392.635-.534.878Zm6.1 0h-3.742c.933-1.368 2.371-3 3.739-3a1.5 1.5 0 0 1 0 3h.003ZM11 13H9v7h2v-7Zm-4 0H2v5a2 2 0 0 0 2 2h3v-7Zm6 0v7h3a2 2 0 0 0 2-2v-5h-5Z"/>
                            </svg>
                            <p className="text-gray-400">{item?.text}</p>
                        </div>
                        <p className="text-3xl font-semibold text-gray-200">
                            {item?.val}
                        </p>
                    </div>
                ))}
            </div> */}

            {/* Quick Actions */}
            <div className="w-full max-w-6xl mx-auto">
                <h2 className="text-2xl font-bold text-center mb-6 text-foreground">Quick Actions</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 grid-cols-1 gap-6">
                    {quickActions.map((action, index) => {
                        const IconComponent = action.icon;
                        return (
                            <Card 
                                key={action.title}
                                className="hover:shadow-lg transition-all duration-300 cursor-pointer hover:scale-105"
                                onClick={() => navigate(action.path)}
                            >
                                <CardHeader className="text-center pb-2">
                                    <div className={`w-12 h-12 ${action.color} rounded-full flex items-center justify-center mx-auto mb-2`}>
                                        <IconComponent className="w-6 h-6 text-white" />
                                    </div>
                                    <CardTitle className="text-lg">{action.title}</CardTitle>
                                </CardHeader>
                                <CardContent className="text-center pt-0">
                                    <CardDescription>{action.description}</CardDescription>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            </div>
        </div>
    )
}

export default Dashboard