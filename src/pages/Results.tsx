import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  XCircle
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
  weight: number;
  scored: number;
  attributeScore: number;
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
}

const Results = () => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [filterCategory, setFilterCategory] = useState<'all' | 'perfect' | 'moderate' | 'low'>('all');

  useEffect(() => {
    const stored = localStorage.getItem('evaluatedCandidates');
    if (stored) {
      const data = JSON.parse(stored);
      
      // Generate detailed evaluation data if not present
      const candidatesWithDetailedData = data.candidates.map((candidate: any) => {
        if (!candidate.categories) {
          candidate.categories = generateDetailedEvaluation(candidate);
        }
        return candidate;
      });
      
      setCandidates(candidatesWithDetailedData);
    }
  }, []);

  const generateDetailedEvaluation = (candidate: any): Category[] => {
    // Generate realistic evaluation data based on the candidate's scores
    return [
      {
        name: "Technical Skills",
        weight: 54,
        scored: candidate.technicalSkills,
        attributeScore: (candidate.technicalSkills * 0.54),
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
        weight: 24,
        scored: 93.8,
        attributeScore: 22.50,
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
        weight: 6,
        scored: 92.5,
        attributeScore: 5.55,
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
        weight: 10,
        scored: candidate.communication,
        attributeScore: (candidate.communication * 0.10),
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
        weight: 4,
        scored: 100.0,
        attributeScore: 4.00,
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
        weight: 2,
        scored: candidate.experience,
        attributeScore: (candidate.experience * 0.02),
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

  const CandidateDetailSheet = ({ candidate }: { candidate: Candidate }) => (
    <SheetContent className="w-[800px] sm:w-[900px] max-w-[95vw]">
      <SheetHeader>
        <SheetTitle className="flex items-center space-x-2">
          {getFitIcon(candidate.fitCategory)}
          <span>{candidate.name}</span>
        </SheetTitle>
        <SheetDescription>
          Detailed evaluation results and comprehensive skill breakdown
        </SheetDescription>
      </SheetHeader>
      
      <div className="mt-6 space-y-6 max-h-[80vh] overflow-y-auto">
        {/* Overall Score */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center justify-between">
              <span>Overall Match Score</span>
              <Badge className={`${getScoreColor(candidate.overallScore)} text-lg px-3 py-1`}>
                {candidate.overallScore.toFixed(2)}%
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <div className="text-3xl font-bold text-primary">{candidate.overallScore.toFixed(2)}%</div>
              <div className="flex-1">
                <Progress value={candidate.overallScore} className="h-3" />
              </div>
              <Badge className={getFitColor(candidate.fitCategory)}>
                {candidate.fitCategory.charAt(0).toUpperCase() + candidate.fitCategory.slice(1)} Fit
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Category Breakdown */}
        {candidate.categories && candidate.categories.map((category, categoryIndex) => (
          <Card key={categoryIndex} className="border-l-4 border-l-primary">
            <CardHeader>
              <CardTitle className="text-lg flex items-center justify-between">
                <span>{category.name} — Weight {category.weight}%</span>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground">% scored: {category.scored.toFixed(1)}%</span>
                  <Badge variant={getScoreBadgeVariant(category.scored)}>
                    Attribute score: {category.attributeScore.toFixed(2)}%
                  </Badge>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Sub-Attributes Table */}
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[30%]">Sub-Attribute</TableHead>
                      <TableHead className="w-[12%]">Weightage %</TableHead>
                      <TableHead className="w-[12%]">Expected Level</TableHead>
                      <TableHead className="w-[12%]">Actual Level</TableHead>
                      <TableHead className="w-[8%]">Status</TableHead>
                      <TableHead className="w-[26%]">Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {category.subAttributes.map((subAttr, subIndex) => (
                      <TableRow key={subIndex}>
                        <TableCell className="font-medium">{subAttr.name}</TableCell>
                        <TableCell className="text-center">{subAttr.weightage}</TableCell>
                        <TableCell className="text-center">{subAttr.expectedLevel}</TableCell>
                        <TableCell className="text-center font-bold">{subAttr.actualLevel}</TableCell>
                        <TableCell className="text-center">
                          {getLevelIcon(subAttr.expectedLevel, subAttr.actualLevel)}
                        </TableCell>
                        <TableCell className="text-sm">
                          <div className="space-y-1">
                            <div><span className="font-medium">Expected:</span> {subAttr.notes.split(' | ')[0]?.replace('Expected: ', '')}</div>
                            <div><span className="font-medium">Actual:</span> {subAttr.notes.split(' | ')[1]?.replace('Actual: ', '')}</div>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Summary Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Summary (by Attribute)</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Attribute</TableHead>
                  <TableHead>Weight</TableHead>
                  <TableHead>% Scored</TableHead>
                  <TableHead>Attribute Score</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {candidate.categories && candidate.categories.map((category, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{category.name}</TableCell>
                    <TableCell>{category.weight}%</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <span className={getScoreColor(category.scored)}>{category.scored.toFixed(1)}%</span>
                        <Progress value={category.scored} className="w-16 h-2" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-bold text-primary">{category.attributeScore.toFixed(2)}%</span>
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow className="border-t-2 border-primary font-bold">
                  <TableCell>Final Score</TableCell>
                  <TableCell>100%</TableCell>
                  <TableCell></TableCell>
                  <TableCell className="text-xl text-primary">{candidate.overallScore.toFixed(2)}%</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* CV Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">CV Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">File Name:</span>
              <span className="text-sm font-medium">{candidate.fileName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Application Date:</span>
              <span className="text-sm font-medium">{candidate.applicationDate}</span>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex space-x-2">
          <Button variant="outline" className="flex-1">
            <Download className="w-4 h-4 mr-2" />
            Download CV
          </Button>
          <Button variant="outline" className="flex-1">
            <Star className="w-4 h-4 mr-2" />
            Shortlist
          </Button>
        </div>
      </div>
    </SheetContent>
  );

  return (
    <Layout currentStep={4}>
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold text-foreground">Candidate Evaluation Results</h1>
          <p className="text-lg text-muted-foreground">
            Review and analyze candidate matches based on your configured persona
          </p>
        </div>

        {/* Analytics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-success/10 rounded-full flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{perfectFitCount}</p>
                  <p className="text-sm text-muted-foreground">Perfect Fit</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-warning/10 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-warning" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{moderateFitCount}</p>
                  <p className="text-sm text-muted-foreground">Moderate Fit</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-danger/10 rounded-full flex items-center justify-center">
                  <TrendingDown className="w-6 h-6 text-danger" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{lowFitCount}</p>
                  <p className="text-sm text-muted-foreground">Low Fit</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{candidates.length}</p>
                  <p className="text-sm text-muted-foreground">Total Candidates</p>
                </div>
              </div>
            </CardContent>
          </Card>
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
                      <TableHead>Fit Category</TableHead>
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
                            <p className="font-medium text-foreground">{candidate.name}</p>
                            <p className="text-sm text-muted-foreground">{candidate.fileName}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {getFitIcon(candidate.fitCategory)}
                            <Badge variant={getFitBadgeVariant(candidate.fitCategory)}>
                              {candidate.fitCategory.charAt(0).toUpperCase() + candidate.fitCategory.slice(1)} Fit
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">{candidate.overallScore}%</span>
                            <Progress value={candidate.overallScore} className="w-16 h-2" />
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm">{candidate.applicationDate}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Sheet>
                            <SheetTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => setSelectedCandidate(candidate)}
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                View Details
                              </Button>
                            </SheetTrigger>
                            {selectedCandidate && (
                              <CandidateDetailSheet candidate={selectedCandidate} />
                            )}
                          </Sheet>
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
    </Layout>
  );
};

export default Results;