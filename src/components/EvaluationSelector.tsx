import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Search, Target, Users, FileText, Play, AlertCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface JDOption {
  id: string;
  title: string;
  role_name: string;
  persona_count: number;
}

interface PersonaOption {
  id: string;
  name: string;
  jd_id: string;
  role_name: string;
}

interface CandidateOption {
  id: string;
  name: string;
  file_name: string;
  uploaded_at: string;
  status: string;
}

interface EvaluationParams {
  jdId: string;
  personaId: string;
  candidateIds: string[];
}

interface EvaluationSelectorProps {
  onEvaluate: (params: EvaluationParams) => void;
  onCancel?: () => void;
}

const EvaluationSelector = ({ onEvaluate, onCancel }: EvaluationSelectorProps) => {
  const { toast } = useToast();
  
  // State for dropdowns
  const [jds, setJds] = useState<JDOption[]>([]);
  const [personas, setPersonas] = useState<PersonaOption[]>([]);
  const [candidates, setCandidates] = useState<CandidateOption[]>([]);
  
  // State for selections
  const [selectedJD, setSelectedJD] = useState<string>("");
  const [selectedPersona, setSelectedPersona] = useState<string>("");
  const [selectedCandidates, setSelectedCandidates] = useState<string[]>([]);
  
  // State for UI
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Fetch JDs on component mount
  useEffect(() => {
    const fetchJDs = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/jd/`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (!response.ok) throw new Error(`Failed to fetch JDs: ${response.status}`);

        const data = await response.json();
        const transformedJDs: JDOption[] = (data.job_descriptions || data || []).map((jd: any) => ({
          id: jd.id,
          title: jd.title || jd.role || 'Untitled JD',
          role_name: jd.role || jd.role_name || 'Unknown Role',
          persona_count: jd.persona_count || 0,
        }));

        setJds(transformedJDs);
      } catch (error) {
        console.error("Error fetching JDs:", error);
        toast({
          title: "Error fetching Job Descriptions",
          description: "Could not load JDs. Please try again later.",
          variant: "destructive",
        });
      }
    };

    fetchJDs();
  }, [toast]);

  // Fetch personas when JD is selected
  useEffect(() => {
    const fetchPersonas = async () => {
      if (!selectedJD) {
        setPersonas([]);
        setSelectedPersona("");
        return;
      }

      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/persona/`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (!response.ok) throw new Error(`Failed to fetch personas: ${response.status}`);

        const data = await response.json();
        const allPersonas = data.personas || data || [];
        
        // Filter personas by selected JD
        const filteredPersonas: PersonaOption[] = allPersonas
          .filter((persona: any) => persona.job_description_id === selectedJD)
          .map((persona: any) => ({
            id: persona.id,
            name: persona.name || 'Unnamed Persona',
            jd_id: persona.job_description_id,
            role_name: persona.role_name || 'Unknown Role',
          }));

        setPersonas(filteredPersonas);
        setSelectedPersona(""); // Reset persona selection when JD changes
      } catch (error) {
        console.error("Error fetching personas:", error);
        toast({
          title: "Error fetching personas",
          description: "Could not load personas for selected JD.",
          variant: "destructive",
        });
      }
    };

    fetchPersonas();
  }, [selectedJD, toast]);

  // Fetch candidates on component mount
  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/candidate/`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (!response.ok) throw new Error(`Failed to fetch candidates: ${response.status}`);

        const data = await response.json();
        const transformedCandidates: CandidateOption[] = (data.candidates || data || []).map((candidate: any) => ({
          id: candidate.id,
          name: candidate.name || candidate.file_name?.replace(/\.[^/.]+$/, "") || 'Unknown Candidate',
          file_name: candidate.file_name || 'unknown.pdf',
          uploaded_at: candidate.uploaded_at || candidate.created_at || new Date().toISOString(),
          status: candidate.status || 'processed',
        }));

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

    fetchCandidates();
  }, [toast]);

  // Filter candidates based on search term
  const filteredCandidates = candidates.filter(candidate =>
    candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    candidate.file_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle candidate selection
  const handleCandidateToggle = (candidateId: string) => {
    setSelectedCandidates(prev => 
      prev.includes(candidateId)
        ? prev.filter(id => id !== candidateId)
        : [...prev, candidateId]
    );
  };

  // Select all candidates
  const handleSelectAll = () => {
    if (selectedCandidates.length === filteredCandidates.length) {
      setSelectedCandidates([]);
    } else {
      setSelectedCandidates(filteredCandidates.map(c => c.id));
    }
  };

  // Validate selections before starting evaluation
  const validateSelections = (): string[] => {
    const errors: string[] = [];
    
    if (!selectedJD) {
      errors.push("Please select a Job Description");
    }
    
    if (!selectedPersona) {
      errors.push("Please select a Persona");
    }
    
    if (selectedCandidates.length === 0) {
      errors.push("Please select at least one candidate");
    }
    
    return errors;
  };

  // Handle start evaluation
  const handleStartEvaluation = () => {
    const errors = validateSelections();
    setValidationErrors(errors);
    
    if (errors.length === 0) {
      setShowConfirmDialog(true);
    } else {
      toast({
        title: "Validation Error",
        description: "Please fix the validation errors before proceeding.",
        variant: "destructive",
      });
    }
  };

  // Confirm and start evaluation
  const confirmEvaluation = () => {
    const params: EvaluationParams = {
      jdId: selectedJD,
      personaId: selectedPersona,
      candidateIds: selectedCandidates,
    };
    
    onEvaluate(params);
    setShowConfirmDialog(false);
  };

  // Get selected JD and persona details for display
  const selectedJDDetails = jds.find(jd => jd.id === selectedJD);
  const selectedPersonaDetails = personas.find(p => p.id === selectedPersona);

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
            <span className="text-muted-foreground">Loading evaluation options...</span>
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
          <h2 className="text-2xl font-bold text-foreground">Start New Evaluation</h2>
          <p className="text-muted-foreground">Select job description, persona, and candidates to evaluate</p>
        </div>
        {onCancel && (
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>

      {/* Selection Form */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* JD and Persona Selection */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="w-5 h-5 text-primary" />
              <span>Job Description & Persona</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* JD Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Job Description <span className="text-destructive">*</span>
              </label>
              <Select value={selectedJD} onValueChange={setSelectedJD}>
                <SelectTrigger className={validationErrors.includes("Please select a Job Description") ? "border-destructive" : ""}>
                  <SelectValue placeholder="Select a job description" />
                </SelectTrigger>
                <SelectContent>
                  {jds.map((jd) => (
                    <SelectItem key={jd.id} value={jd.id}>
                      <div className="flex items-center justify-between w-full">
                        <div>
                          <div className="font-medium">{jd.title}</div>
                          <div className="text-sm text-muted-foreground">{jd.role_name}</div>
                        </div>
                        <Badge variant="secondary" className="ml-2">
                          {jd.persona_count} personas
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Persona Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Persona <span className="text-destructive">*</span>
              </label>
              <Select 
                value={selectedPersona} 
                onValueChange={setSelectedPersona}
                disabled={!selectedJD || personas.length === 0}
              >
                <SelectTrigger className={validationErrors.includes("Please select a Persona") ? "border-destructive" : ""}>
                  <SelectValue placeholder={
                    !selectedJD ? "Select a JD first" : 
                    personas.length === 0 ? "No personas available" : 
                    "Select a persona"
                  } />
                </SelectTrigger>
                <SelectContent>
                  {personas.map((persona) => (
                    <SelectItem key={persona.id} value={persona.id}>
                      <div>
                        <div className="font-medium">{persona.name}</div>
                        <div className="text-sm text-muted-foreground">{persona.role_name}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Selection Summary */}
            {selectedJDDetails && selectedPersonaDetails && (
              <div className="mt-4 p-3 bg-muted rounded-lg">
                <h4 className="text-sm font-medium text-foreground mb-2">Selection Summary</h4>
                <div className="space-y-1 text-sm">
                  <div><span className="font-medium">JD:</span> {selectedJDDetails.title}</div>
                  <div><span className="font-medium">Role:</span> {selectedJDDetails.role_name}</div>
                  <div><span className="font-medium">Persona:</span> {selectedPersonaDetails.name}</div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Candidate Selection */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-primary" />
                <span>Candidates ({selectedCandidates.length} selected)</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectAll}
                disabled={filteredCandidates.length === 0}
              >
                {selectedCandidates.length === filteredCandidates.length ? "Deselect All" : "Select All"}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search candidates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Candidate List */}
            <div className="max-h-96 overflow-y-auto">
              {filteredCandidates.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    {candidates.length === 0 ? "No candidates available" : "No matching candidates"}
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredCandidates.map((candidate) => (
                    <div
                      key={candidate.id}
                      className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
                      onClick={() => handleCandidateToggle(candidate.id)}
                    >
                      <Checkbox
                        checked={selectedCandidates.includes(candidate.id)}
                        onChange={() => handleCandidateToggle(candidate.id)}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-foreground truncate">{candidate.name}</div>
                        <div className="text-sm text-muted-foreground truncate">{candidate.file_name}</div>
                        <div className="text-xs text-muted-foreground">
                          Uploaded: {formatDate(candidate.uploaded_at)}
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {candidate.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Validation Error */}
            {validationErrors.includes("Please select at least one candidate") && (
              <div className="flex items-center space-x-2 text-destructive text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>Please select at least one candidate</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-start space-x-2">
              <AlertCircle className="w-5 h-5 text-destructive mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-destructive">Please fix the following errors:</h4>
                <ul className="mt-1 text-sm text-destructive list-disc list-inside">
                  {validationErrors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-end space-x-4">
        <Button
          onClick={handleStartEvaluation}
          disabled={validationErrors.length > 0}
          className="flex items-center space-x-2"
        >
          <Target className="w-4 h-4" />
          <span>Start Evaluation ({selectedCandidates.length} candidates)</span>
        </Button>
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Evaluation</AlertDialogTitle>
            <AlertDialogDescription>
              You are about to start an evaluation with the following parameters:
              <div className="mt-3 space-y-2 text-sm">
                <div><strong>Job Description:</strong> {selectedJDDetails?.title}</div>
                <div><strong>Role:</strong> {selectedJDDetails?.role_name}</div>
                <div><strong>Persona:</strong> {selectedPersonaDetails?.name}</div>
                <div><strong>Candidates:</strong> {selectedCandidates.length} selected</div>
              </div>
              <p className="mt-3">This process may take a few minutes to complete. Do you want to proceed?</p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmEvaluation} className="flex items-center space-x-2">
              <Play className="w-4 h-4" />
              <span>Start Evaluation</span>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default EvaluationSelector;