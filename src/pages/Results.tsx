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
}

const Results = () => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [filterCategory, setFilterCategory] = useState<'all' | 'perfect' | 'moderate' | 'low'>('all');

  useEffect(() => {
    const stored = localStorage.getItem('evaluatedCandidates');
    if (stored) {
      const data = JSON.parse(stored);
      setCandidates(data.candidates);
    }
  }, []);

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

  const CandidateDetailSheet = ({ candidate }: { candidate: Candidate }) => (
    <SheetContent className="w-[600px] sm:w-[700px]">
      <SheetHeader>
        <SheetTitle className="flex items-center space-x-2">
          {getFitIcon(candidate.fitCategory)}
          <span>{candidate.name}</span>
        </SheetTitle>
        <SheetDescription>
          Detailed evaluation results and skill breakdown
        </SheetDescription>
      </SheetHeader>
      
      <div className="mt-6 space-y-6">
        {/* Overall Score */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Overall Match Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <div className="text-3xl font-bold text-primary">{candidate.overallScore}%</div>
              <div className="flex-1">
                <Progress value={candidate.overallScore} className="h-3" />
              </div>
              <Badge className={getFitColor(candidate.fitCategory)}>
                {candidate.fitCategory.charAt(0).toUpperCase() + candidate.fitCategory.slice(1)} Fit
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Skill Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Skill Assessment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Technical Skills</span>
                <div className="flex items-center space-x-2">
                  <Progress value={candidate.technicalSkills} className="w-24 h-2" />
                  <span className="text-sm text-muted-foreground w-10">{candidate.technicalSkills}%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Experience Level</span>
                <div className="flex items-center space-x-2">
                  <Progress value={candidate.experience} className="w-24 h-2" />
                  <span className="text-sm text-muted-foreground w-10">{candidate.experience}%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Communication</span>
                <div className="flex items-center space-x-2">
                  <Progress value={candidate.communication} className="w-24 h-2" />
                  <span className="text-sm text-muted-foreground w-10">{candidate.communication}%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Certifications</span>
                <div className="flex items-center space-x-2">
                  <Progress value={candidate.certifications} className="w-24 h-2" />
                  <span className="text-sm text-muted-foreground w-10">{candidate.certifications}%</span>
                </div>
              </div>
            </div>
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