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
import { UserCheck, Plus, Edit, Trash2, Search, FileText, Star, Upload, Eye } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface CandidateListItem {
  id: string;
  name: string;
  file_name: string;
  uploaded_at: string;
  evaluation_count: number;
  latest_score?: number;
  highest_score?: number;
  status: 'uploaded' | 'processed' | 'evaluated';
  evaluations?: {
    id: string;
    jd_title: string;
    persona_name: string;
    score: number;
    match_status: string;
    created_at: string;
  }[];
}

interface CandidateListProps {
  onView: (candidateId: string) => void;
  onUpload: () => void;
  onDelete: (candidateId: string) => void;
}

const CandidateList = ({ onView, onUpload, onDelete }: CandidateListProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [candidates, setCandidates] = useState<CandidateListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string; hasEvaluations: boolean } | null>(null);
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateListItem | null>(null);

  // Fetch candidates from API
  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        setLoading(true);
        
        // Fetch candidates and their evaluations
        const candidatesResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/candidate/`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (!candidatesResponse.ok) throw new Error(`Failed to fetch candidates: ${candidatesResponse.status}`);

        const candidatesData = await candidatesResponse.json();
        
        // Transform candidates data to match our interface
        const transformedCandidates: CandidateListItem[] = await Promise.all(
          (candidatesData.candidates || candidatesData || []).map(async (candidate: any) => {
            // Fetch evaluations for this candidate
            let evaluations = [];
            let evaluationCount = 0;
            let latestScore = undefined;
            let highestScore = undefined;

            try {
              const evaluationsResponse = await fetch(
                `${import.meta.env.VITE_API_URL}/api/v1/evaluation/candidate/${candidate.id}`,
                {
                  method: "GET",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                  },
                }
              );

              if (evaluationsResponse.ok) {
                const evaluationsData = await evaluationsResponse.json();
                evaluations = (evaluationsData.evaluations || evaluationsData || []).map((eval: any) => ({
                  id: eval.id,
                  jd_title: eval.jd_title || 'Unknown JD',
                  persona_name: eval.persona_name || 'Unknown Persona',
                  score: eval.final_score || eval.score || 0,
                  match_status: eval.match_status || 'pending',
                  created_at: eval.created_at || new Date().toISOString(),
                }));

                evaluationCount = evaluations.length;
                if (evaluations.length > 0) {
                  const scores = evaluations.map((e: any) => e.score);
                  latestScore = evaluations[0]?.score;
                  highestScore = Math.max(...scores);
                }
              }
            } catch (error) {
              console.warn(`Failed to fetch evaluations for candidate ${candidate.id}:`, error);
            }

            return {
              id: candidate.id,
              name: candidate.name || candidate.file_name?.replace(/\.[^/.]+$/, "") || 'Unknown Candidate',
              file_name: candidate.file_name || 'unknown.pdf',
              uploaded_at: candidate.uploaded_at || candidate.created_at || new Date().toISOString(),
              evaluation_count: evaluationCount,
              latest_score: latestScore,
              highest_score: highestScore,
              status: evaluationCount > 0 ? 'evaluated' : (candidate.status || 'processed'),
              evaluations,
            };
          })
        );

        setCandidates(transformedCandidates);
      } catch (error) {
        console.error("Error fetching candidates:", error);
        toast({
          title: "Error fetching candidates",
          description: "Could not load candidates. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    const token = localStorage.getItem("token");
    if (token) {
      fetchCandidates();
    } else {
      toast({
        title: "You're not logged in.",
        description: "Please login to continue.",
      });
      navigate("/login");
    }
  }, [navigate, toast]);

  // Filter candidates based on search and status
  const filteredCandidates = candidates.filter(candidate => {
    const matchesSearch = candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         candidate.file_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || candidate.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleDelete = async (candidateId: string) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/candidate/${candidateId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) throw new Error("Failed to delete candidate");

      // Remove from local state
      setCandidates(prev => prev.filter(candidate => candidate.id !== candidateId));
      
      toast({
        title: "Candidate Deleted",
        description: "Candidate has been deleted successfully.",
      });
      
      onDelete(candidateId);
    } catch (error) {
      console.error("Error deleting candidate:", error);
      toast({
        title: "Delete failed",
        description: "Could not delete the candidate. Please try again.",
        variant: "destructive",
      });
    }
    setDeleteConfirm(null);
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      uploaded: "secondary",
      processed: "outline",
      evaluated: "default"
    } as const;
    
    const labels = {
      uploaded: "Uploaded",
      processed: "Processed",
      evaluated: "Evaluated"
    };
    
    return (
      <Badge variant={variants[status as keyof typeof variants] || "secondary"}>
        {labels[status as keyof typeof labels] || status}
      </Badge>
    );
  };

  const getScoreBadge = (score: number) => {
    let variant: "default" | "secondary" | "destructive" | "outline" = "secondary";
    let color = "text-muted-foreground";
    
    if (score >= 80) {
      variant = "default";
      color = "text-green-600";
    } else if (score >= 60) {
      color = "text-yellow-600";
    } else if (score >= 40) {
      color = "text-orange-600";
    } else {
      variant = "destructive";
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
            <span className="text-muted-foreground">Loading candidates...</span>
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
          <h2 className="text-2xl font-bold text-foreground">Candidate Processing</h2>
          <p className="text-muted-foreground">Manage uploaded candidates and their evaluations</p>
        </div>
        <Button onClick={onUpload} className="flex items-center space-x-2">
          <Upload className="w-4 h-4" />
          <span>Upload Resumes</span>
        </Button>
      </div>

      {/* Filters */}
      <Card className="shadow-card">
        <CardContent className="pt-6">
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search candidates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="uploaded">Uploaded</SelectItem>
                <SelectItem value="processed">Processed</SelectItem>
                <SelectItem value="evaluated">Evaluated</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Candidate List */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <UserCheck className="w-5 h-5 text-primary" />
            <span>Candidates ({filteredCandidates.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredCandidates.length === 0 ? (
            <div className="text-center py-12">
              <UserCheck className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                {candidates.length === 0 ? "No candidates yet" : "No matching candidates"}
              </h3>
              <p className="text-muted-foreground mb-4">
                {candidates.length === 0 
                  ? "Upload candidate resumes to start building your talent pool."
                  : "Try adjusting your search or filter criteria."
                }
              </p>
              {candidates.length === 0 && (
                <Button onClick={onUpload} className="flex items-center space-x-2">
                  <Upload className="w-4 h-4" />
                  <span>Upload First Resume</span>
                </Button>
              )}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Candidate Name</TableHead>
                    <TableHead>File Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-center">Evaluations</TableHead>
                    <TableHead className="text-center">Latest Score</TableHead>
                    <TableHead className="text-center">Best Score</TableHead>
                    <TableHead>Uploaded</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCandidates.map((candidate) => (
                    <TableRow key={candidate.id} className="hover:bg-muted/50">
                      <TableCell>
                        <div className="font-medium text-foreground">{candidate.name}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <FileText className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">{candidate.file_name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(candidate.status)}
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="font-medium">{candidate.evaluation_count}</span>
                      </TableCell>
                      <TableCell className="text-center">
                        {candidate.latest_score !== undefined ? (
                          getScoreBadge(candidate.latest_score)
                        ) : (
                          <span className="text-sm text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {candidate.highest_score !== undefined ? (
                          getScoreBadge(candidate.highest_score)
                        ) : (
                          <span className="text-sm text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(candidate.uploaded_at)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedCandidate(candidate)}
                            className="h-8 w-8 p-0"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onView(candidate.id)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteConfirm({ 
                              id: candidate.id, 
                              name: candidate.name,
                              hasEvaluations: candidate.evaluation_count > 0
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

      {/* Candidate Details Dialog */}
      <Dialog open={!!selectedCandidate} onOpenChange={() => setSelectedCandidate(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Candidate Details: {selectedCandidate?.name}</DialogTitle>
          </DialogHeader>
          {selectedCandidate && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">File Name</label>
                  <p className="text-sm">{selectedCandidate.file_name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Status</label>
                  <div className="mt-1">{getStatusBadge(selectedCandidate.status)}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Uploaded</label>
                  <p className="text-sm">{formatDate(selectedCandidate.uploaded_at)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Evaluations</label>
                  <p className="text-sm">{selectedCandidate.evaluation_count}</p>
                </div>
              </div>
              
              {selectedCandidate.evaluations && selectedCandidate.evaluations.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-foreground mb-2">Evaluation History</h4>
                  <div className="space-y-2">
                    {selectedCandidate.evaluations.map((evaluation) => (
                      <div key={evaluation.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <div>
                          <p className="text-sm font-medium">{evaluation.jd_title}</p>
                          <p className="text-xs text-muted-foreground">{evaluation.persona_name}</p>
                          <p className="text-xs text-muted-foreground">{formatDate(evaluation.created_at)}</p>
                        </div>
                        <div className="text-right">
                          {getScoreBadge(evaluation.score)}
                          <p className="text-xs text-muted-foreground mt-1">{evaluation.match_status}</p>
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
            <AlertDialogTitle>Delete Candidate</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteConfirm?.name}"? 
              {deleteConfirm?.hasEvaluations && (
                <span className="block mt-2 text-destructive font-medium">
                  Warning: This candidate has existing evaluations that will be affected.
                </span>
              )}
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

export default CandidateList;