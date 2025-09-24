import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sidebar, SidebarContent, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { 
  Trophy, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Calendar,
  Eye,
  Download,
  Filter,
  BarChart3,
  Star,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  X
} from "lucide-react";

interface SubAttribute {
  name: string;
  weightage: number;
  expectedLevel: number;
  actualLevel: number;
  notes: string;
}

interface Category {
  name: string;
  weight: string;
  scored: number;
  attributeScore: string;
  percentScored: string;
  subAttributes: SubAttribute[];
}

interface Candidate {
  id: string;
  name: string;
  fileName: string;
  overallScore: number;
  fitCategory: 'perfect' | 'moderate' | 'low';
  technicalSkills: number;
  experience: number;
  communication: number;
  certifications: number;
  applicationDate: string;
  categories: Category[];
  detailedEvaluation: {
    categories: Category[];
    summary: Array<{
      attribute: string;
      weight: string;
      percentScored: string;
      attributeScore: string;
    }>;
  };
}

const Results = () => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [filterCategory, setFilterCategory] = useState<'all' | 'perfect' | 'moderate' | 'low'>('all');
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [selectedPersona, setSelectedPersona] = useState<string>('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('evaluatedCandidates');
    if (stored) {
      const data = JSON.parse(stored);
      
      // Generate detailed evaluation data if not present
      const candidatesWithDetailedData = data.candidates.map((candidate: any) => {
        if (!candidate.detailedEvaluation) {
          const categories = generateDetailedEvaluation(candidate);
          candidate.detailedEvaluation = {
            categories: categories,
            summary: [
              { attribute: "Technical Skills", weight: "54%", percentScored: `${candidate.technicalSkills}%`, attributeScore: `${(candidate.technicalSkills * 0.54).toFixed(2)}%` },
              { attribute: "Cognitive Demands", weight: "24%", percentScored: "93.8%", attributeScore: "22.50%" },
              { attribute: "Values", weight: "6%", percentScored: "92.5%", attributeScore: "5.55%" },
              { attribute: "Foundational Behaviors", weight: "10%", percentScored: `${candidate.communication}%`, attributeScore: `${(candidate.communication * 0.10).toFixed(2)}%` },
              { attribute: "Leadership Skills", weight: "4%", percentScored: "100.0%", attributeScore: "4.00%" },
              { attribute: "Education & Experience", weight: "2%", percentScored: `${candidate.experience}%`, attributeScore: `${(candidate.experience * 0.02).toFixed(2)}%` }
            ]
          };
          // Also keep the categories for backward compatibility
          candidate.categories = categories;
        }
        return candidate;
      });
      
      setCandidates(candidatesWithDetailedData);
    }

    // Load role and persona from localStorage
    const jdData = localStorage.getItem('jdData');
    if (jdData) {
      const parsedJD = JSON.parse(jdData);
      setSelectedRole(parsedJD.role || 'RPA Developer');
    } else {
      setSelectedRole('RPA Developer');
    }

    const personaData = localStorage.getItem('personaData');
    if (personaData) {
      const parsedPersona = JSON.parse(personaData);
      setSelectedPersona(parsedPersona.name || getDefaultPersonaForRole('RPA Developer'));
    } else {
      setSelectedPersona(getDefaultPersonaForRole('RPA Developer'));
    }
  }, []);

  // Update persona when role changes
  useEffect(() => {
    setSelectedPersona(getDefaultPersonaForRole(selectedRole));
  }, [selectedRole]);

  const getPersonasForRole = (role: string) => {
    const rolePersonas: { [key: string]: string[] } = {
      'RPA Developer': [
        'Persona-RPA Developer-Admin user-2025-09-24 - 13:37',
        'Senior RPA Developer Persona',
        'Mid Level RPA Developer Persona',
        'Junior RPA Developer Persona'
      ],
      'Software Engineer': [
        'Senior Software Engineer Persona',
        'Full Stack Developer Persona',
        'Backend Developer Persona',
        'Frontend Developer Persona'
      ],
      'QA Engineer': [
        'Senior QA Engineer Persona',
        'Automation QA Persona',
        'Manual Testing Persona',
        'Performance Testing Persona'
      ],
      'Data Analyst': [
        'Senior Data Analyst Persona',
        'Business Intelligence Persona',
        'Statistical Analysis Persona',
        'Data Visualization Persona'
      ],
      'Product Manager': [
        'Senior Product Manager Persona',
        'Technical Product Manager Persona',
        'Growth Product Manager Persona',
        'Strategy Product Manager Persona'
      ]
    };
    
    return rolePersonas[role] || ['Default Persona'];
  };

  const getDefaultPersonaForRole = (role: string) => {
    const personas = getPersonasForRole(role);
    return personas[0];
  };

  const generateDetailedEvaluation = (candidate: any): Category[] => {
    // Generate realistic evaluation data based on the candidate's scores
    return [
      {
        name: "Technical Skills",
        weight: "54%",
        scored: candidate.technicalSkills,
        attributeScore: `${(candidate.technicalSkills * 0.54).toFixed(2)}%`,
        percentScored: `${candidate.technicalSkills}%`,
        subAttributes: [
          {
            name: "Automation Frameworks (Selenium/Java, TestNG/Cucumber, POM/BDD)",
            weightage: 18,
            expectedLevel: 4,
            actualLevel: Math.max(1, Math.min(4, Math.floor(candidate.technicalSkills / 25) + 1)),
            notes: "Expected: stable suites POM BDD maintainable | Actual: stable suites POM BDD maintainable"
          },
          {
            name: "Functional & Regression Testing (Web/Mobile)",
            weightage: 15,
            expectedLevel: 4,
            actualLevel: Math.max(1, Math.min(4, Math.floor(candidate.technicalSkills / 25) + 1)),
            notes: "Expected: end‑to‑end coverage disciplined regression | Actual: end‑to‑end coverage disciplined regression"
          },
          {
            name: "API Testing (Postman/RestAssured)",
            weightage: 12,
            expectedLevel: 4,
            actualLevel: Math.max(1, Math.min(4, Math.floor(candidate.technicalSkills / 25))),
            notes: "Expected: schema contract auth negative cases | Actual: schema contract auth negative cases"
          },
          {
            name: "Performance/Load (JMeter)",
            weightage: 10,
            expectedLevel: 3,
            actualLevel: Math.max(1, Math.min(3, Math.floor(candidate.technicalSkills / 30))),
            notes: "Expected: basic plans KPIs trending | Actual: basic plans KPIs trending"
          },
          {
            name: "Database/SQL Testing",
            weightage: 10,
            expectedLevel: 3,
            actualLevel: Math.max(1, Math.min(3, Math.floor(candidate.technicalSkills / 30))),
            notes: "Expected: joins constraints CRUD integrity | Actual: joins constraints CRUD integrity"
          },
          {
            name: "Test Strategy & Planning (Plans/Cases/Traceability)",
            weightage: 12,
            expectedLevel: 4,
            actualLevel: Math.max(1, Math.min(4, Math.floor(candidate.technicalSkills / 25))),
            notes: "Expected: risk‑based plans RTM data | Actual: risk‑based plans RTM data"
          },
          {
            name: "Defect Management & Reporting (Jira/Xray)",
            weightage: 13,
            expectedLevel: 4,
            actualLevel: Math.max(1, Math.min(4, Math.floor(candidate.technicalSkills / 25))),
            notes: "Expected: triage RCA dashboards hygiene | Actual: triage RCA dashboards hygiene"
          },
          {
            name: "CI/CD & Version Control (Jenkins/Git)",
            weightage: 10,
            expectedLevel: 3,
            actualLevel: Math.max(1, Math.min(3, Math.floor(candidate.technicalSkills / 35))),
            notes: "Expected: trigger suites artifacts hygiene | Actual: trigger suites artifacts hygiene"
          }
        ]
      },
      {
        name: "Cognitive Demands",
        weight: "24%",
        scored: 93.8,
        attributeScore: "22.50%",
        percentScored: "93.8%",
        subAttributes: [
          {
            name: "Remember / Understand",
            weightage: 10,
            expectedLevel: 3,
            actualLevel: 3,
            notes: "Expected: SDLC STLC coverage types | Actual: SDLC STLC coverage types"
          },
          {
            name: "Apply",
            weightage: 25,
            expectedLevel: 4,
            actualLevel: 4,
            notes: "Expected: execute plans stable runs | Actual: execute plans stable runs"
          },
          {
            name: "Analyze",
            weightage: 25,
            expectedLevel: 4,
            actualLevel: 4,
            notes: "Expected: RCA logs data‑driven | Actual: RCA logs data‑driven"
          },
          {
            name: "Evaluate",
            weightage: 25,
            expectedLevel: 4,
            actualLevel: 3,
            notes: "Expected: risk trade‑offs approach | Actual: risk trade‑offs approach"
          },
          {
            name: "Create",
            weightage: 15,
            expectedLevel: 3,
            actualLevel: 3,
            notes: "Expected: utilities data improvements | Actual: utilities data improvements"
          }
        ]
      },
      {
        name: "Values",
        weight: "6%",
        scored: 92.5,
        attributeScore: "5.55%",
        percentScored: "92.5%",
        subAttributes: [
          {
            name: "Achievement / Power",
            weightage: 30,
            expectedLevel: 4,
            actualLevel: 4,
            notes: "Expected: release quality leakage down | Actual: release quality leakage down"
          },
          {
            name: "Security / Conformity",
            weightage: 30,
            expectedLevel: 4,
            actualLevel: 3,
            notes: "Expected: process audit trail standards | Actual: process audit trail standards"
          },
          {
            name: "Self-direction / Stimulation",
            weightage: 25,
            expectedLevel: 3,
            actualLevel: 3,
            notes: "Expected: learning tools experiments | Actual: learning tools experiments"
          },
          {
            name: "Benevolence / Universalism",
            weightage: 15,
            expectedLevel: 3,
            actualLevel: 3,
            notes: "Expected: user empathy team‑first | Actual: user empathy team‑first"
          }
        ]
      },
      {
        name: "Foundational Behaviors",
        weight: "10%",
        scored: candidate.communication,
        attributeScore: `${(candidate.communication * 0.10).toFixed(2)}%`,
        percentScored: `${candidate.communication}%`,
        subAttributes: [
          {
            name: "Communication",
            weightage: 35,
            expectedLevel: 4,
            actualLevel: Math.max(1, Math.min(4, Math.floor(candidate.communication / 25))),
            notes: "Expected: concise risks clear bugs | Actual: concise risks clear bugs"
          },
          {
            name: "Resilience / Stress Tolerance",
            weightage: 25,
            expectedLevel: 3,
            actualLevel: Math.max(1, Math.min(3, Math.floor(candidate.communication / 30))),
            notes: "Expected: calm hotfix incidents | Actual: calm hotfix incidents"
          },
          {
            name: "Decision‑Making under Uncertainty",
            weightage: 20,
            expectedLevel: 3,
            actualLevel: Math.max(1, Math.min(3, Math.floor(candidate.communication / 30))),
            notes: "Expected: time‑box escalate wisely | Actual: time‑box escalate wisely"
          },
          {
            name: "Attention to Detail & Documentation",
            weightage: 20,
            expectedLevel: 4,
            actualLevel: Math.max(1, Math.min(4, Math.floor(candidate.communication / 25))),
            notes: "Expected: traceability crisp documentation | Actual: traceability crisp documentation"
          }
        ]
      },
      {
        name: "Leadership Skills",
        weight: "4%",
        scored: 100.0,
        attributeScore: "4.00%",
        percentScored: "100.0%",
        subAttributes: [
          {
            name: "Peer Mentoring & Reviews",
            weightage: 50,
            expectedLevel: 3,
            actualLevel: 3,
            notes: "Expected: review cases scripts coach | Actual: review cases scripts coach"
          },
          {
            name: "Cross‑functional Influence",
            weightage: 30,
            expectedLevel: 3,
            actualLevel: 3,
            notes: "Expected: align Dev PO BA | Actual: align Dev PO BA"
          },
          {
            name: "Quality Advocacy / Process Improvement",
            weightage: 20,
            expectedLevel: 3,
            actualLevel: 3,
            notes: "Expected: workflow improvements templates | Actual: workflow improvements templates"
          }
        ]
      },
      {
        name: "Education & Experience",
        weight: "2%",
        scored: candidate.experience,
        attributeScore: `${(candidate.experience * 0.02).toFixed(2)}%`,
        percentScored: `${candidate.experience}%`,
        subAttributes: [
          {
            name: "Education (Bachelor's / Equivalent)",
            weightage: 30,
            expectedLevel: 3,
            actualLevel: Math.max(1, Math.min(3, Math.floor(candidate.experience / 30))),
            notes: "Expected: degree or equivalent proof | Actual: degree or equivalent proof"
          },
          {
            name: "Experience (3–6 yrs QA)",
            weightage: 70,
            expectedLevel: 4,
            actualLevel: Math.max(1, Math.min(4, Math.floor(candidate.experience / 25))),
            notes: "Expected: sustained Agile releases | Actual: sustained Agile releases"
          }
        ]
      }
    ];
  };

  const getFitIcon = (category: string) => {
    switch (category) {
      case 'perfect':
        return <Trophy className="w-4 h-4 text-success" />;
      case 'moderate':
        return <TrendingUp className="w-4 h-4 text-warning" />;
      case 'low':
        return <TrendingDown className="w-4 h-4 text-danger" />;
      default:
        return <Users className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getFitBadgeVariant = (category: string) => {
    switch (category) {
      case 'perfect':
        return 'default';
      case 'moderate':
        return 'secondary';
      case 'low':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const getFitColor = (category: string) => {
    switch (category) {
      case 'perfect':
        return 'text-success';
      case 'moderate':
        return 'text-warning';
      case 'low':
        return 'text-danger';
      default:
        return 'text-muted-foreground';
    }
  };

  const filteredCandidates = candidates
    .filter(candidate => filterCategory === 'all' || candidate.fitCategory === filterCategory)
    .sort((a, b) => b.overallScore - a.overallScore);

  const perfectFitCount = candidates.filter(c => c.fitCategory === 'perfect').length;
  const moderateFitCount = candidates.filter(c => c.fitCategory === 'moderate').length;
  const lowFitCount = candidates.filter(c => c.fitCategory === 'low').length;

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-success';
    if (score >= 70) return 'text-warning';
    return 'text-danger';
  };

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 90) return 'default';
    if (score >= 70) return 'secondary';
    return 'destructive';
  };

  const getLevelIcon = (expected: number, actual: number) => {
    if (actual >= expected) return <CheckCircle2 className="w-4 h-4 text-success" />;
    if (actual >= expected - 1) return <AlertTriangle className="w-4 h-4 text-warning" />;
    return <XCircle className="w-4 h-4 text-danger" />;
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const CandidateDetailSidebar = ({ candidate }: { candidate: Candidate }) => (
    <Sidebar className="w-96 border-l border-border bg-background">
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-lg font-semibold">{candidate.name}</h2>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setIsSidebarOpen(false)}
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
      
      <SidebarContent className="p-4">
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Star className="w-4 h-4 text-warning" />
                  <span className="text-sm font-medium">Overall Score</span>
                </div>
                <p className={`text-2xl font-bold ${getScoreColor(candidate.overallScore)}`}>
                  {candidate.overallScore}%
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Applied</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {formatDateTime(candidate.applicationDate)}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Skills Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Skills Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Technical Skills</span>
                  <span>{candidate.technicalSkills}%</span>
                </div>
                <Progress value={candidate.technicalSkills} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Experience</span>
                  <span>{candidate.experience}%</span>
                </div>
                <Progress value={candidate.experience} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Communication</span>
                  <span>{candidate.communication}%</span>
                </div>
                <Progress value={candidate.communication} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Certifications</span>
                  <span>{candidate.certifications}%</span>
                </div>
                <Progress value={candidate.certifications} className="h-2" />
              </div>
            </CardContent>
          </Card>

          {/* Detailed Evaluation */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Detailed Evaluation</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="summary" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="summary">Summary</TabsTrigger>
                  <TabsTrigger value="categories">Categories</TabsTrigger>
                </TabsList>
                
                <TabsContent value="summary" className="space-y-4">
                  <div className="space-y-3">
                    {candidate.detailedEvaluation?.summary.map((item, index) => (
                      <div key={index} className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">{item.attribute}</span>
                        <div className="text-right">
                          <div className="font-medium">{item.percentScored}</div>
                          <div className="text-xs text-muted-foreground">Weight: {item.weight}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="categories" className="space-y-4">
                  <Accordion type="single" collapsible className="space-y-2">
                    {candidate.detailedEvaluation?.categories.map((category, categoryIndex) => (
                      <AccordionItem key={categoryIndex} value={`category-${categoryIndex}`}>
                        <AccordionTrigger className="text-sm">
                          <div className="flex items-center justify-between w-full mr-2">
                            <span>{category.name}</span>
                            <Badge variant="outline" className="text-xs">
                              {category.percentScored}
                            </Badge>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-3 pt-2">
                            {category.subAttributes.map((sub, subIndex) => (
                              <div key={subIndex} className="p-3 bg-muted/50 rounded-lg">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-xs font-medium">{sub.name}</span>
                                  <div className="flex items-center space-x-2">
                                    {getLevelIcon(sub.expectedLevel, sub.actualLevel)}
                                    <span className="text-xs">
                                      {sub.actualLevel}/{sub.expectedLevel}
                                    </span>
                                  </div>
                                </div>
                                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                                  <span>Weight: {sub.weightage}%</span>
                                </div>
                                <Progress 
                                  value={(sub.actualLevel / sub.expectedLevel) * 100} 
                                  className="h-1 mb-2" 
                                />
                                <p className="text-xs text-muted-foreground">{sub.notes}</p>
                              </div>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </SidebarContent>
    </Sidebar>
  );

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <Layout>
          <div className="max-w-7xl mx-auto p-6">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold tracking-tight">Candidate Evaluation Results</h1>
              <p className="text-muted-foreground mt-2">
                Review and compare candidate assessments against job requirements
              </p>
            </div>

            {/* Role and Persona Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Selected Role</CardTitle>
                </CardHeader>
                <CardContent>
                  <Select value={selectedRole} onValueChange={setSelectedRole}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent className="bg-background border-border z-50">
                      <SelectItem value="RPA Developer">RPA Developer</SelectItem>
                      <SelectItem value="Software Engineer">Software Engineer</SelectItem>
                      <SelectItem value="QA Engineer">QA Engineer</SelectItem>
                      <SelectItem value="Data Analyst">Data Analyst</SelectItem>
                      <SelectItem value="Product Manager">Product Manager</SelectItem>
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Selected Persona</CardTitle>
                </CardHeader>
                <CardContent>
                  <Select value={selectedPersona} onValueChange={setSelectedPersona}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a persona" />
                    </SelectTrigger>
                    <SelectContent className="bg-background border-border z-50">
                      {getPersonasForRole(selectedRole).map((persona) => (
                        <SelectItem key={persona} value={persona}>
                          {persona}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Candidates</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{candidates.length}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Perfect Fit</CardTitle>
                  <Trophy className="h-4 w-4 text-success" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-success">{perfectFitCount}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Moderate Fit</CardTitle>
                  <TrendingUp className="h-4 w-4 text-warning" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-warning">{moderateFitCount}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Low Fit</CardTitle>
                  <TrendingDown className="h-4 w-4 text-danger" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-danger">{lowFitCount}</div>
                </CardContent>
              </Card>
            </div>

            {/* Filters and Actions */}
            <Card className="mb-6">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="w-5 h-5" />
                    <span>Candidate Results</span>
                  </CardTitle>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Filter className="w-4 h-4 text-muted-foreground" />
                      <Select value={filterCategory} onValueChange={(value: any) => setFilterCategory(value)}>
                        <SelectTrigger className="w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Candidates</SelectItem>
                          <SelectItem value="perfect">Perfect Fit</SelectItem>
                          <SelectItem value="moderate">Moderate Fit</SelectItem>
                          <SelectItem value="low">Low Fit</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Export Results
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Candidate Name</TableHead>
                      <TableHead>Overall Score</TableHead>
                      <TableHead>Technical Skills</TableHead>
                      <TableHead>Experience</TableHead>
                      <TableHead>Communication</TableHead>
                      <TableHead>Application Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCandidates.map((candidate) => (
                      <TableRow key={candidate.id}>
                        <TableCell>
                          <button
                            onClick={() => {
                              setSelectedCandidate(candidate);
                              setIsSidebarOpen(true);
                            }}
                            className="font-medium text-primary hover:underline cursor-pointer text-left"
                          >
                            {candidate.name}
                          </button>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getScoreBadgeVariant(candidate.overallScore)} className={getScoreColor(candidate.overallScore)}>
                            {candidate.overallScore}%
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Progress value={candidate.technicalSkills} className="w-16 h-2" />
                            <span className="text-sm text-muted-foreground">{candidate.technicalSkills}%</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Progress value={candidate.experience} className="w-16 h-2" />
                            <span className="text-sm text-muted-foreground">{candidate.experience}%</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Progress value={candidate.communication} className="w-16 h-2" />
                            <span className="text-sm text-muted-foreground">{candidate.communication}%</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDateTime(candidate.applicationDate)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => {
                              setSelectedCandidate(candidate);
                              setIsSidebarOpen(true);
                            }}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </Layout>

        {/* Sidebar for candidate details */}
        {isSidebarOpen && selectedCandidate && (
          <CandidateDetailSidebar candidate={selectedCandidate} />
        )}
      </div>
    </SidebarProvider>
  );
};

export default Results;