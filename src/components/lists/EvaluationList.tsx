import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Target, Plus, Eye, Trash2, Search, FileText, Users, UserCheck, Star, Calendar } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface EvaluationListItem {
  id: string;
  jd_title: string;
  jd_id: string;
  persona_name: string;
  persona_id: string;
  candidate_count: number;
  created_at: string;
  average_score: number;
  highest_score: number;
  lowest_score: number;
  status: 'completed' | 'in_progress';
  candidates?: {
    id: string;
    name: string;
    score: number;
    match_status: string;
  }[];
}

interface EvaluationListProps {
  onView: (evaluationId: string) => void;
  onCreate: () => void;
  onDelete: (evaluationId: string) => void;
}

const EvaluationList = ({ onView, onCreate, onDelete }: EvaluationListProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [evaluations, setEvaluations] = useState<EvaluationListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [jdFilter, setJdFilter] = useState<string>("all");
  const [personaFilter, setPersonaFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; title: string } | null>(null);
  const [selectedEvaluation, setSelectedEvaluation] = useState<EvaluationListItem | null>(null);
  const [availableJDs, setAvailableJDs] = useState<{ id: string; title: string }[]>([]);
  const [availablePersonas, setAvailablePersonas] = useState<{ id: string; name: string }[]>([]);

  // Fetch evaluations and related data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch evaluations, JDs, and personas in parallel
        const [evaluationsResponse, jdsResponse, personasResponse] = await Promise.all([
          fetch(`${import.meta.env.VITE_API_URL}/api/v1/evaluation/`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }),
          fetch(`${import.meta.env.VITE_API_URL}/api/v1/jd/`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }),
          fetch(`${import.meta.env.VITE_API_URL}/api/v1/persona/`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          })
        ]);

        if (!evaluationsResponse.ok) throw new Error(`Failed to fetch evaluations: ${evaluationsResponse.status}`);
        if (!jdsResponse.ok) throw new Error(`Failed to fetch JDs: ${jdsResponse.status}`);
        if (!personasResponse.ok) throw new Error(`Failed to fetch personas: ${personasResponse.status}`);

        const evaluationsData = await evaluationsResponse.json();
        const jdsData = await jdsResponse.json();
        const personasData = await personasResponse.json();
        
        // Transform JDs and personas data for filter dropdowns
        const jdsList = (jdsData.job_descriptions || jdsData || []).map((jd: any) => ({
          id: jd.id,
          title: jd.title || jd.role || 'Untitled JD'
        }));
        setAvailableJDs(jdsList);

        const personasList = (personasData.personas || personasData || []).map((persona: any) => ({
          id: persona.id,
          name: persona.name || 'Unnamed Persona'
        }));
        setAvailablePersonas(personasList);

        // Group evaluations by JD-Persona combination
        const evaluationGroups = new Map<string, any>();
        
        (evaluationsData.evaluations || evaluationsData || []).forEach((evaluation: any) => {
          const key = `${evaluation.jd_id}-${evaluation.persona_id}`;
          
          if (!evaluationGroups.has(key)) {
            const matchingJD = jdsList.find((jd: any) => jd.id === evaluation.jd_id);
            const matchingPersona = personasList.find((persona: any) => persona.id === evaluation.persona_id);
            
            evaluationGroups.set(key, {
              id: key,
              jd_id: evaluation.jd_id,
              jd_title: matchingJD?.title || 'Unknown JD',
              persona_id: evaluation.persona_id,
              persona_name: matchingPersona?.name || 'Unknown Persona',
              candidates: [],
              scores: [],
              created_at: evaluation.created_at || new Date().toISOString(),
              status: 'completed'
            });
          }
          
          const group = evaluationGroups.get(key);
          group.candidates.push({
            id: evaluation.candidate_id,
            name: evaluation.candidate_name || 'Unknown Candidate',
            score: evaluation.final_score || evaluation.score || 0,
            match_status: evaluation.match_status || 'pending'
          });
          group.scores.push(evaluation.final_score || evaluation.score || 0);
          
          // Update created_at to the earliest evaluation
          if (new Date(evaluation.created_at) < new Date(group.created_at)) {
            group.created_at = evaluation.created_at;
          }
        });

        // Transform grouped evaluations to match our interface
        const transformedEvaluations: EvaluationListItem[] = Array.from(evaluationGroups.values()).map((group) => {
          const scores = group.scores;
          const averageScore = scores.length > 0 ? scores.reduce((a: number, b: number) => a + b, 0) / scores.length : 0;
          const highestScore = scores.length > 0 ? Math.max(...scores) : 0;
          const lowestScore = scores.length > 0 ? Math.min(...scores) : 0;

          return {
            id: group.id,
            jd_id: group.jd_id,
            jd_title: group.jd_title,
            persona_id: group.persona_id,
            persona_name: group.persona_name,
            candidate_count: group.candidates.length,
            created_at: group.created_at,
            average_score: averageScore,
            highest_score: highestScore,
            lowest_score: lowestScore,
            status: group.status,
            candidates: group.candidates,
          };
        });

        setEvaluations(transformedEvaluations);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          title: "Error fetching evaluations",
          description: "Could not load evaluations. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    const token = localStorage.getItem("token");
    if (token) {
      fetchData();
    } else {
      toast({
        title: "You're not logged in.",
        description: "Please login to continue.",
      });
      navigate("/login");
    }
  }, [navigate, toast]);

  // Filter evaluations based on search and filters
  const filteredEvaluations = evaluations.filter(evaluation => {
    const matchesSearch = evaluation.jd_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         evaluation.persona_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesJD = jdFilter === "all" || evaluation.jd_id === jdFilter;
    const matchesPersona = personaFilter === "all" || evaluation.persona_id === personaFilter;
    const matchesStatus = statusFilter === "all" || evaluation.status === statusFilter;
    
    let matchesDate = true;
    if (dateFilter !== "all") {
      const evaluationDate = new Date(evaluation.created_at);
      const now = new Date();
      
      switch (dateFilter) {
        case "today":
          matchesDate = evaluationDate.toDateString() === now.toDateString();
          break;
        case "week":
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          matchesDate = evaluationDate >= weekAgo;
          break;
        case "month":
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          matchesDate = evaluationDate >= monthAgo;
          break;
      }
    }
    
    return matchesSearch && matchesJD && matchesPersona && matchesStatus && matchesDate;
  });

  const handleDelete = async (evaluationId: string) => {
    try {
      // Since we're dealing with grouped evaluations, we need to delete all individual evaluations in this group
      const evaluation = evaluations.find(e => e.id === evaluationId);
      if (!evaluation) return;

      // Delete all evaluations for this JD-Persona combination
      const deletePromises = evaluation.candidates?.map(candidate => 
        fetch(`${import.meta.env.VITE_API_URL}/api/v1/evaluation/${evaluation.jd_id}/${evaluation.persona_id}/${candidate.id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        })
      ) || [];

      await Promise.all(deletePromises);

      // Remove from local state
      setEvaluations(prev => prev.filter(eval => eval.id !== evaluationId));
      
      toast({
        title: "Evaluation Deleted",
        description: "Evaluation has been deleted successfully.",
      });
      
      onDelete(evaluationId);
    } catch (error) {
      console.error("Error deleting evaluation:", error);
      toast({
        title: "Delete failed",
        description: "Could not delete the evaluation. Please try again.",
        variant: "destructive",
      });
    }
    setDeleteConfirm(null);
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      completed: "default",
      in_progress: "secondary"
    } as const;
    
    return (
      <Badge variant={variants[status as keyof typeof variants] || "secondary"}>
        {status === 'in_progress' ? 'In Progress' : 'Completed'}
      </Badge>
    );
  };

  const getScoreBadge = (score: number) => {
    let color = "text-muted-foreground";
    
    if (score >= 80) {
      color = "text-green-600";
    } else if (score >= 60) {
      color = "text-yellow-600";
    } else if (score >= 40) {
      color = "text-orange-600";
    } else {
      color = "text-red-600";
    }
    
    return (
      <div className="flex items-center space-x-1">
        <Star className={`w-3 h-3 ${color}`} />
        <span className={`text-sm font-medium ${color}`}>{score.toFixed(1)}</span>
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <Card className="shadow-card">
        <CardContent className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <span className="text-muted-foreground">Loading evaluations...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Evaluation Management</h2>
          <p className="text-muted-foreground">Review and manage candidate evaluations</p>
        </div>
        <Button onClick={onCreate} className="flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>New Evaluation</span>
        </Button>
      </div>

      {/* Filters */}
      <Card className="shadow-card">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search evaluations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={jdFilter} onValueChange={setJdFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by JD" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All JDs</SelectItem>
                {availableJDs.map((jd) => (
                  <SelectItem key={jd.id} value={jd.id}>
                    {jd.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={personaFilter} onValueChange={setPersonaFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by Persona" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Personas</SelectItem>
                {availablePersonas.map((persona) => (
                  <SelectItem key={persona.id} value={persona.id}>
                    {persona.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
              </SelectContent>
            </Select>
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Date Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">Last Week</SelectItem>
                <SelectItem value="month">Last Month</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Evaluation List */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="w-5 h-5 text-primary" />
            <span>Evaluations ({filteredEvaluations.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredEvaluations.length === 0 ? (
            <div className="text-center py-12">
              <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                {evaluations.length === 0 ? "No evaluations yet" : "No matching evaluations"}
              </h3>
              <p className="text-muted-foreground mb-4">
                {evaluations.length === 0 
                  ? "Start evaluating candidates to see results here."
                  : "Try adjusting your search or filter criteria."
                }
              </p>
              {evaluations.length === 0 && (
                <Button onClick={onCreate} className="flex items-center space-x-2">
                  <Plus className="w-4 h-4" />
                  <span>Start First Evaluation</span>
                </Button>
              )}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Job Description</TableHead>
                    <TableHead>Persona</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-center">Candidates</TableHead>
                    <TableHead className="text-center">Avg Score</TableHead>
                    <TableHead className="text-center">Best Score</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEvaluations.map((evaluation) => (
                    <TableRow key={evaluation.id} className="hover:bg-muted/50">
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <FileText className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">{evaluation.jd_title}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Users className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">{evaluation.persona_name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(evaluation.status)}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center space-x-1">
                          <UserCheck className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">{evaluation.candidate_count}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        {getScoreBadge(evaluation.average_score)}
                      </TableCell>
                      <TableCell className="text-center">
                        {getScoreBadge(evaluation.highest_score)}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(evaluation.created_at)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedEvaluation(evaluation)}
                            className="h-8 w-8 p-0"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onView(evaluation.id)}
                            className="h-8 w-8 p-0"
                          >
                            <Target className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteConfirm({ 
                              id: evaluation.id, 
                              title: `${evaluation.jd_title} - ${evaluation.persona_name}`
                            })}
                            className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Evaluation Details Dialog */}
      <Dialog open={!!selectedEvaluation} onOpenChange={() => setSelectedEvaluation(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Evaluation Details</DialogTitle>
          </DialogHeader>
          {selectedEvaluation && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Job Description</label>
                  <p className="text-sm">{selectedEvaluation.jd_title}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Persona</label>
                  <p className="text-sm">{selectedEvaluation.persona_name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Status</label>
                  <div className="mt-1">{getStatusBadge(selectedEvaluation.status)}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Created</label>
                  <p className="text-sm">{formatDate(selectedEvaluation.created_at)}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Average Score</p>
                  <div className="mt-1">{getScoreBadge(selectedEvaluation.average_score)}</div>
                </div>
                <div className="text-center p-3 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Highest Score</p>
                  <div className="mt-1">{getScoreBadge(selectedEvaluation.highest_score)}</div>
                </div>
                <div className="text-center p-3 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Lowest Score</p>
                  <div className="mt-1">{getScoreBadge(selectedEvaluation.lowest_score)}</div>
                </div>
              </div>
              
              {selectedEvaluation.candidates && selectedEvaluation.candidates.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-foreground mb-2">
                    Candidate Results ({selectedEvaluation.candidates.length})
                  </h4>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {selectedEvaluation.candidates
                      .sort((a, b) => b.score - a.score)
                      .map((candidate) => (
                        <div key={candidate.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                          <div>
                            <p className="text-sm font-medium">{candidate.name}</p>
                            <p className="text-xs text-muted-foreground">{candidate.match_status}</p>
                          </div>
                          <div className="text-right">
                            {getScoreBadge(candidate.score)}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Evaluation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the evaluation for "{deleteConfirm?.title}"? 
              This will remove all candidate scores and results for this evaluation.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteConfirm && handleDelete(deleteConfirm.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default EvaluationList;