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
import { 
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription
} from "@/components/ui/sheet";
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
  X,
  Mail,
  Phone,
  MapPin
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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCandidate, setSidebarCandidate] = useState<Candidate | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('evaluatedCandidates');
    if (stored) {
      const data = JSON.parse(stored);
      
      // Realistic candidate names to replace "Candidate X" format
      const candidateNames = [
        'Mayur Bhavsar', 'Priya Sharma', 'Rajesh Kumar', 'Anita Patel', 'Vikram Singh',
        'Sneha Gupta', 'Arjun Mehta', 'Kavya Iyer', 'Rohit Joshi', 'Deepika Rao'
      ];
      
      // Generate detailed evaluation data if not present and fix candidate names
      const candidatesWithDetailedData = data.candidates.map((candidate: any, index: number) => {
        // Fix candidate name if it's in "Candidate X" format
        if (candidate.name.startsWith('Candidate ')) {
          candidate.name = candidateNames[index % candidateNames.length];
        }
        
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
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-orange-500';
    return 'text-red-600';
  };

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 80) return 'default';
    if (score >= 60) return 'secondary';
    return 'destructive';
  };

  const getProgressBarColor = (score: number) => {
    if (score >= 80) return 'bg-green-600';
    if (score >= 60) return 'bg-orange-600';
    return 'bg-red-600';
  };

  const getLevelIcon = (expected: number, actual: number) => {
    if (actual >= expected) return <CheckCircle2 className="w-4 h-4 text-success" />;
    if (actual >= expected - 1) return <AlertTriangle className="w-4 h-4 text-warning" />;
    return <XCircle className="w-4 h-4 text-danger" />;
  };

  const CandidateDetailDialog = ({ candidate }: { candidate: Candidate }) => (
    <DialogContent className="w-screen h-screen max-w-none max-h-none p-0 m-0 overflow-hidden">
      <div className="fixed inset-0 bg-background z-50 flex flex-col">
        {/* Close button */}
        <div className="absolute top-4 right-4 z-10">
          <DialogClose asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <X className="h-4 w-4" />
            </Button>
          </DialogClose>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Header integrated into content */}
          <div className="space-y-2 pt-8">
            <div className="flex items-center space-x-2">
              {getFitIcon(candidate.fitCategory)}
              <h1 className="text-2xl font-semibold text-foreground">{candidate.name}</h1>
            </div>
            <p className="text-sm text-muted-foreground">
              Detailed evaluation results and comprehensive skill breakdown
            </p>
          </div>

          {/* Contact Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="w-5 h-5" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {/* Contact details in compact grid */}
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span>+1 (555) 123-4567</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span>candidate@example.com</span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Role: </span>
                  <span className="font-medium">{selectedRole}</span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Persona: </span>
                  <span className="font-medium">{selectedPersona}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Summary by Attribute with Accordion */}
          <Card>
            <CardHeader>
              <CardTitle>Attribute Evaluation Table</CardTitle>
              <CardDescription>
                Detailed assessment breakdown showing expected vs actual performance for each attribute
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="multiple" className="w-full space-y-2">
                {candidate.detailedEvaluation.categories.map((category, index) => (
                  <AccordionItem key={index} value={`summary-${index}`} className="border rounded-lg px-4">
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center justify-between w-full mr-4">
                        <span className="font-semibold text-left">{category.name}</span>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline">Weight: {category.weight}</Badge>
                           <Badge variant="outline" className="bg-transparent">
                             <span className={getScoreColor(parseFloat(category.percentScored.replace('%', '')))}>
                               {category.percentScored}
                             </span>
                           </Badge>
                           <Badge variant="outline" className="bg-transparent">
                             <span className={getScoreColor(parseFloat(category.attributeScore.replace('%', '')))}>
                               Score: {category.attributeScore}
                             </span>
                           </Badge>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="pt-4">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Sub-Attribute</TableHead>
                              <TableHead>Weight (%)</TableHead>
                              <TableHead>Expected Level</TableHead>
                              <TableHead>Actual Level</TableHead>
                              <TableHead>Scored</TableHead>
                              <TableHead>Attribute Score</TableHead>
                              <TableHead>Notes</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {category.subAttributes.map((subAttr, subIndex) => {
                              const subScore = (subAttr.actualLevel / subAttr.expectedLevel) * 100;
                              const subAttributeScore = (subScore * subAttr.weightage / 100).toFixed(1);
                              return (
                                <TableRow key={subIndex}>
                                  <TableCell className="font-medium">{subAttr.name}</TableCell>
                                  <TableCell>{subAttr.weightage}%</TableCell>
                                  <TableCell>Level {subAttr.expectedLevel}</TableCell>
                                  <TableCell>Level {subAttr.actualLevel}</TableCell>
                                  <TableCell className={getScoreColor(subScore)}>
                                    {subScore.toFixed(1)}%
                                  </TableCell>
                                  <TableCell>{subAttributeScore}%</TableCell>
                                  <TableCell className="text-sm text-muted-foreground max-w-xs">
                                    {subAttr.notes}
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
              
              {/* Final Score Summary */}
              <div className="mt-4 p-4 rounded-lg border-2 bg-transparent">
                <div className="flex items-center justify-between">
                  <span className="font-semibold">Final Overall Score</span>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">Weight: 100%</Badge>
                    <Badge variant="outline" className="text-lg px-3 py-1">
                      <span className={getScoreColor(candidate.overallScore)}>
                        {candidate.overallScore}%
                      </span>
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex space-x-4 pt-4 pb-8">
            <Button className="flex-1">
              <Download className="w-4 h-4 mr-2" />
              Download CV
            </Button>
            <Button variant="outline" className="flex-1">
              <Star className="w-4 h-4 mr-2" />
              Shortlist
            </Button>
        </div>

        </div>
      </div>
    </DialogContent>
  );

  return (
    <Layout currentStep={4}>
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-3xl font-bold text-foreground">Candidate Evaluation Results</h1>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-foreground">Role:</label>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger className="w-[250px] bg-background border-border">
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
            </div>

            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-foreground">Persona:</label>
              <Select value={selectedPersona} onValueChange={setSelectedPersona}>
                <SelectTrigger className="w-[350px] bg-background border-border">
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
            </div>
          </div>
        </div>


        {/* Filter Tabs */}
        <Card className="shadow-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                <span>Candidate Results</span>
              </CardTitle>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4 mr-2" />
                  Filters
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={filterCategory} onValueChange={(value) => setFilterCategory(value as any)}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="all">All ({candidates.length})</TabsTrigger>
                <TabsTrigger value="perfect">Perfect Fit ({perfectFitCount})</TabsTrigger>
                <TabsTrigger value="moderate">Moderate Fit ({moderateFitCount})</TabsTrigger>
                <TabsTrigger value="low">Low Fit ({lowFitCount})</TabsTrigger>
              </TabsList>
              
              <TabsContent value={filterCategory} className="mt-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Candidate</TableHead>
                      <TableHead>Overall Score</TableHead>
                      <TableHead>Application Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCandidates.map((candidate) => (
                      <TableRow key={candidate.id}>
                        <TableCell>
                          <div>
                            <button 
                              className="font-medium text-foreground hover:text-primary underline-offset-4 hover:underline cursor-pointer text-left"
                              onClick={() => {
                                setSidebarCandidate(candidate);
                                setSidebarOpen(true);
                              }}
                            >
                              {candidate.name}
                            </button>
                            <p className="text-sm text-muted-foreground">{candidate.fileName}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <span className={`font-medium ${getScoreColor(candidate.overallScore)}`}>{candidate.overallScore}%</span>
                            <Progress value={candidate.overallScore} className={`w-16 h-2 [&>div]:${getProgressBarColor(candidate.overallScore)}`} />
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm">
                              {new Date(candidate.applicationDate).toLocaleDateString()} {new Date(candidate.applicationDate).toLocaleTimeString()}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => setSelectedCandidate(candidate)}
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                View Details
                              </Button>
                            </DialogTrigger>
                            {selectedCandidate && (
                              <CandidateDetailDialog candidate={selectedCandidate} />
                            )}
                          </Dialog>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                
                {filteredCandidates.length === 0 && (
                  <div className="text-center py-12">
                    <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-foreground">No candidates found</h3>
                    <p className="text-sm text-muted-foreground">
                      No candidates match the selected filter criteria.
                    </p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Candidate Details Sheet */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="right" className="w-[90vw] max-w-[1400px] overflow-y-auto p-0">
          {sidebarCandidate && (
            <div className="flex flex-col h-full">
              {/* Candidate Header Info */}
              <div className="border-b bg-muted/30 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-lg font-semibold text-primary">
                        {sidebarCandidate.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold">{sidebarCandidate.name}</h2>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          candidate@example.com
                        </span>
                        <span>|</span>
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          +1 (555) 123-4567
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => setSidebarOpen(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Tabs */}
              <Tabs defaultValue="evaluation" className="flex-1 flex flex-col">
                <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0 h-auto">
                  <TabsTrigger 
                    value="evaluation" 
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3"
                  >
                    Attribution Evaluation
                  </TabsTrigger>
                  <TabsTrigger 
                    value="overview" 
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3"
                  >
                    Overview
                  </TabsTrigger>
                  <TabsTrigger 
                    value="documents" 
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3"
                  >
                    Documents
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="evaluation" className="flex-1 p-6 mt-0 overflow-y-auto">
                  <div className="space-y-4">
                    <Accordion type="multiple" className="w-full space-y-3">
                      {sidebarCandidate.detailedEvaluation.categories.map((category, index) => (
                        <AccordionItem key={index} value={`category-${index}`} className="border rounded-lg px-4">
                          <AccordionTrigger className="hover:no-underline">
                            <div className="flex items-center justify-between w-full mr-4">
                              <span className="font-semibold text-left">{category.name}</span>
                              <div className="flex items-center gap-3">
                                <Badge variant="outline">Weight: {category.weight}</Badge>
                                <Badge variant="outline" className="bg-transparent">
                                  <span className={getScoreColor(parseFloat(category.percentScored.replace('%', '')))}>
                                    {category.percentScored}
                                  </span>
                                </Badge>
                                <Badge variant="outline" className="bg-transparent">
                                  <span className={getScoreColor(parseFloat(category.attributeScore.replace('%', '')))}>
                                    Score: {category.attributeScore}
                                  </span>
                                </Badge>
                              </div>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="pt-4">
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Sub-Attribute</TableHead>
                                    <TableHead>Weight (%)</TableHead>
                                    <TableHead>Expected</TableHead>
                                    <TableHead>Actual</TableHead>
                                    <TableHead>Scored</TableHead>
                                    <TableHead>Score</TableHead>
                                    <TableHead>Notes</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {category.subAttributes.map((subAttr, subIndex) => {
                                    const subScore = (subAttr.actualLevel / subAttr.expectedLevel) * 100;
                                    const subAttributeScore = (subScore * subAttr.weightage / 100).toFixed(1);
                                    return (
                                      <TableRow key={subIndex}>
                                        <TableCell className="font-medium text-sm">{subAttr.name}</TableCell>
                                        <TableCell>{subAttr.weightage}%</TableCell>
                                        <TableCell>Lvl {subAttr.expectedLevel}</TableCell>
                                        <TableCell>Lvl {subAttr.actualLevel}</TableCell>
                                        <TableCell className={getScoreColor(subScore)}>
                                          {subScore.toFixed(1)}%
                                        </TableCell>
                                        <TableCell>{subAttributeScore}%</TableCell>
                                        <TableCell className="text-xs text-muted-foreground max-w-xs">
                                          {subAttr.notes}
                                        </TableCell>
                                      </TableRow>
                                    );
                                  })}
                                </TableBody>
                              </Table>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>

                    {/* Final Score Summary */}
                    <div className="mt-6 p-4 rounded-lg border-2 bg-muted/20">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-lg">Final Overall Score</span>
                        <div className="flex items-center gap-3">
                          <Badge variant="outline">Weight: 100%</Badge>
                          <Badge variant="outline" className="text-lg px-4 py-1">
                            <span className={getScoreColor(sidebarCandidate.overallScore)}>
                              {sidebarCandidate.overallScore}%
                            </span>
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="overview" className="flex-1 p-6 mt-0 overflow-y-auto">
                  <div className="space-y-4">
                    {/* Role Information */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Role</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm font-medium">{selectedRole}</p>
                        <p className="text-xs text-muted-foreground mt-1">Applied for this position</p>
                      </CardContent>
                    </Card>

                    {/* Persona Information */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Persona</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm font-medium">{selectedPersona}</p>
                        <p className="text-xs text-muted-foreground mt-1">Evaluation based on this persona</p>
                      </CardContent>
                    </Card>

                    {/* Overall Fit */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Overall Fit</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center space-x-2">
                          {getFitIcon(sidebarCandidate.fitCategory)}
                          <Badge variant={getFitBadgeVariant(sidebarCandidate.fitCategory)}>
                            {sidebarCandidate.fitCategory.charAt(0).toUpperCase() + sidebarCandidate.fitCategory.slice(1)} Fit
                          </Badge>
                        </div>
                        <div className="mt-3">
                          <p className="text-sm text-muted-foreground mb-2">Overall Score</p>
                          <div className="flex items-center space-x-2">
                            <span className={`text-2xl font-bold ${getScoreColor(sidebarCandidate.overallScore)}`}>
                              {sidebarCandidate.overallScore}%
                            </span>
                          </div>
                          <Progress value={sidebarCandidate.overallScore} className="mt-2" />
                        </div>
                      </CardContent>
                    </Card>

                    {/* Skills Breakdown */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Skills Breakdown</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Technical Skills</p>
                          <div className="flex items-center space-x-2">
                            <Progress value={sidebarCandidate.technicalSkills} className="flex-1 h-2" />
                            <span className="text-sm font-medium">{sidebarCandidate.technicalSkills}%</span>
                          </div>
                        </div>
                        
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Experience</p>
                          <div className="flex items-center space-x-2">
                            <Progress value={sidebarCandidate.experience} className="flex-1 h-2" />
                            <span className="text-sm font-medium">{sidebarCandidate.experience}%</span>
                          </div>
                        </div>
                        
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Communication</p>
                          <div className="flex items-center space-x-2">
                            <Progress value={sidebarCandidate.communication} className="flex-1 h-2" />
                            <span className="text-sm font-medium">{sidebarCandidate.communication}%</span>
                          </div>
                        </div>
                        
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Certifications</p>
                          <div className="flex items-center space-x-2">
                            <Progress value={sidebarCandidate.certifications} className="flex-1 h-2" />
                            <span className="text-sm font-medium">{sidebarCandidate.certifications}%</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Application Details</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span>Applied on {new Date(sidebarCandidate.applicationDate).toLocaleDateString()}</span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="documents" className="flex-1 p-6 mt-0 overflow-y-auto">
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">No documents uploaded yet</p>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </Layout>
  );
};

export default Results;