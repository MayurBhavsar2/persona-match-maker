import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Upload, FileText, X, CheckCircle, ArrowRight, Users, Edit, Eye, Trash2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useUploadCandidates, useScoreCandidates } from "@/lib/helper";
import type { UploadedCandidate } from "@/lib/helper";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  status: 'uploaded' | 'processing' | 'completed' | 'duplicate' | 'error';
  file?: File;
  candidateData?: UploadedCandidate;
}

interface CandidateFormProps {
  mode: 'upload' | 'manage';
  onSave?: (data: any) => void;
  onCancel?: () => void;
  showLayout?: boolean;
}

interface CandidateInfo {
  id: string;
  name?: string;
  file_name: string;
  uploaded_at: string;
  evaluation_count: number;
  latest_score?: number;
  status: 'uploaded' | 'processed' | 'evaluated';
  cv_text?: string;
  s3_url?: string;
}

const CandidateForm = ({ mode, onSave, onCancel, showLayout = true }: CandidateFormProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [existingCandidates, setExistingCandidates] = useState<CandidateInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingCandidate, setEditingCandidate] = useState<CandidateInfo | null>(null);
  const [viewingCandidate, setViewingCandidate] = useState<CandidateInfo | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(mode === 'upload' ? 'upload' : 'manage');

  const uploadMutation = useUploadCandidates();
  const scoreMutation = useScoreCandidates();

  // Get role and persona from localStorage
  const role = localStorage.getItem('jdData');
  const personaData = localStorage.getItem('savedPersona');
  const roleName = role ? JSON.parse(role).role : 'N/A';
  const personaName = personaData ? JSON.parse(personaData).name : 'N/A';
  const persona_id = personaData ? JSON.parse(personaData).id : null;

  const isProcessing = uploadMutation.isPending || scoreMutation.isPending;

  // Load existing candidates when in manage mode
  useEffect(() => {
    if (mode === 'manage' || activeTab === 'manage') {
      loadExistingCandidates();
    }
  }, [mode, activeTab]);

  const loadExistingCandidates = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/candidate/`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch candidates");

      const data = await response.json();
      const candidates = data.candidates || data;
      
      setExistingCandidates(candidates.map((candidate: any) => ({
        id: candidate.id,
        name: candidate.name || extractNameFromFilename(candidate.file_name),
        file_name: candidate.file_name,
        uploaded_at: candidate.uploaded_at || candidate.created_at,
        evaluation_count: candidate.evaluation_count || 0,
        latest_score: candidate.latest_score,
        status: candidate.status || 'uploaded',
        cv_text: candidate.cv_text,
        s3_url: candidate.s3_url
      })));

    } catch (error) {
      console.error("Error loading candidates:", error);
      toast({
        title: "Error loading candidates",
        description: "Could not load existing candidates.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const extractNameFromFilename = (filename: string) => {
    return filename.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
  };

  const handleFileUpload = async (uploadedFiles: FileList | null) => {
    if (!uploadedFiles) return;

    const filesArray: UploadedFile[] = Array.from(uploadedFiles).map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      status: 'processing',
      file
    }));

    setFiles(prev => [...prev, ...filesArray]);

    try {
      const result = await uploadMutation.mutateAsync(Array.from(uploadedFiles));

      // Update file statuses based on API response
      const updatedFiles = filesArray.map(file => {
        const candidateData = result.find((r: UploadedCandidate) => r.file_name === file.name);
        
        let newStatus: UploadedFile['status'];
        switch (candidateData?.status) {
          case 'success':
            newStatus = 'completed';
            break;
          case 'duplicate':
            newStatus = 'duplicate';
            break;
          default:
            newStatus = 'error';
        }

        return { 
          ...file, 
          status: newStatus,
          candidateData 
        };
      });

      setFiles(prev => [
        ...prev.filter(f => !filesArray.some(nf => nf.id === f.id)),
        ...updatedFiles
      ]);

      // Refresh existing candidates list
      if (activeTab === 'manage') {
        loadExistingCandidates();
      }

    } catch (error) {
      console.error("Upload Error:", error);
      // Mark files as error
      setFiles(prev => prev.map(f => 
        filesArray.some(nf => nf.id === f.id) 
          ? { ...f, status: 'error' as const }
          : f
      ));
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files);
    }
  };

  const removeFile = (fileId: string) => {
    setFiles(prev => prev.filter(file => file.id !== fileId));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleEvaluate = async () => {
    if (!persona_id) {
      toast({
        title: "Evaluation failed",
        description: "Missing persona information.",
        variant: "destructive",
      });
      return;
    }

    // Get all uploaded candidate data from files (including duplicates)
    const candidates = files
      .filter(f => f.candidateData && (f.status === 'completed' || f.status === 'duplicate'))
      .map(f => f.candidateData!);

    if (candidates.length === 0) {
      toast({
        title: "No candidates to evaluate",
        description: "Please upload candidate CVs before proceeding.",
        variant: "destructive",
      });
      return;
    }

    // Score all candidates - the hook handles navigation
    await scoreMutation.mutateAsync({ candidates, persona_id });
  };

  const handleEditCandidate = (candidate: CandidateInfo) => {
    setEditingCandidate({ ...candidate });
  };

  const handleViewCandidate = (candidate: CandidateInfo) => {
    setViewingCandidate(candidate);
  };

  const handleUpdateCandidate = async () => {
    if (!editingCandidate) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/candidate/${editingCandidate.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          name: editingCandidate.name,
          // Add other updatable fields as needed
        }),
      });

      if (!response.ok) throw new Error("Failed to update candidate");

      toast({
        title: "Candidate Updated",
        description: "Candidate information has been updated successfully.",
      });

      setEditingCandidate(null);
      loadExistingCandidates(); // Refresh the list

    } catch (error) {
      console.error("Error updating candidate:", error);
      toast({
        title: "Update Failed",
        description: "Could not update candidate information.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteCandidate = async (candidateId: string) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/candidate/${candidateId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) throw new Error("Failed to delete candidate");

      toast({
        title: "Candidate Deleted",
        description: "Candidate has been removed successfully.",
      });

      setDeleteConfirm(null);
      loadExistingCandidates(); // Refresh the list

    } catch (error) {
      console.error("Error deleting candidate:", error);
      toast({
        title: "Delete Failed",
        description: "Could not delete candidate.",
        variant: "destructive",
      });
    }
  };

  const getStatusIcon = (status: UploadedFile['status']) => {
    switch (status) {
      case 'uploaded':
        return <FileText className="w-4 h-4 text-muted-foreground" />;
      case 'processing':
        return <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-success" />;
      case 'duplicate':
        return <CheckCircle className="w-4 h-4 text-yellow-600" />;
      case 'error':
        return <X className="w-4 h-4 text-danger" />;
      default:
        return <FileText className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const completedFiles = files.filter(file => file.status === 'completed' || file.status === 'duplicate').length;
  const processingProgress = files.length > 0 ? (completedFiles / files.length) * 100 : 0;

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      navigate(-1);
    }
  };

  const formContent = (
    <div className="max-w-6xl mx-auto space-y-4">
      <div className="text-center space-y-2">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-foreground">
              {mode === 'upload' ? 'Upload Candidate CVs' : 'Manage Candidates'}
            </h1>
            {(roleName !== 'N/A' || personaName !== 'N/A') && (
              <div className="flex items-center gap-3 text-sm">
                {roleName !== 'N/A' && (
                  <span className="px-3 py-1 bg-muted text-foreground rounded-md font-medium">
                    Role: {roleName}
                  </span>
                )}
                {personaName !== 'N/A' && (
                  <span className="px-3 py-1 bg-muted text-foreground rounded-md font-medium">
                    Persona: {personaName}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs for Upload and Manage */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upload">Upload Resumes</TabsTrigger>
          <TabsTrigger value="manage">View Candidates</TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-4">
          {/* Upload Area */}
          <Card className="shadow-card">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center space-x-2 text-lg">
                <Upload className="w-4 h-4 text-primary" />
                <span>CV Upload</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-all ${
                  dragActive 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border hover:border-primary hover:bg-muted/50'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  id="cv-upload"
                  className="hidden"
                  multiple
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => handleFileUpload(e.target.files)}
                  disabled={isProcessing}
                />
                <label htmlFor="cv-upload" className={isProcessing ? 'cursor-not-allowed' : 'cursor-pointer'}>
                  <div className="flex flex-col items-center space-y-3">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <Upload className="w-6 h-6 text-primary" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-base font-medium text-foreground">
                        Drop files here or click to upload
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        Supports PDF, DOC, DOCX files up to 10MB each
                      </p>
                    </div>
                  </div>
                </label>
              </div>
            </CardContent>
          </Card>

          {/* File List */}
          {files.length > 0 && (
            <Card className="shadow-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="w-5 h-5 text-primary" />
                    <span>Uploaded CVs ({files.length})</span>
                  </CardTitle>
                  {isProcessing && (
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-muted-foreground">
                        {uploadMutation.isPending ? 'Uploading...' : 'Evaluating...'}
                      </span>
                      <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                </div>
                {uploadMutation.isPending && (
                  <div className="space-y-2">
                    <Progress value={processingProgress} className="h-2" />
                    <p className="text-xs text-muted-foreground">
                      {completedFiles} of {files.length} files processed
                    </p>
                  </div>
                )}
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  {files.map((file) => (
                    <div key={file.id} className="flex items-center justify-between px-4 py-2 bg-muted rounded-lg">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(file.status)}
                        <div>
                          <p className="font-medium text-foreground truncate">{file.name} - <span className="text-sm text-muted-foreground">{formatFileSize(file.size)}</span></p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            file.status === 'completed'
                              ? 'bg-success/20 text-success'
                              : file.status === 'processing'
                              ? 'bg-primary/20 text-primary'
                              : file.status === 'duplicate'
                              ? 'bg-yellow-100 text-yellow-700'
                              : file.status === 'error'
                              ? 'bg-danger/20 text-danger'
                              : 'bg-muted-foreground/20 text-muted-foreground'
                          }`}
                        >
                          {file.status === 'uploaded'
                            ? 'Ready'
                            : file.status === 'processing'
                            ? 'Processing'
                            : file.status === 'completed'
                            ? 'Completed'
                            : file.status === 'duplicate'
                            ? 'Already Uploaded'
                            : 'Error'}
                        </span>

                        {!isProcessing && file.status !== 'processing' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile(file.id)}
                            className="h-8 w-8 p-0"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons for Upload Tab */}
          <div className="flex justify-between pt-6">
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            
            <Button
              onClick={handleEvaluate}
              disabled={files.length === 0 || isProcessing || completedFiles === 0}
              className="bg-gradient-primary hover:opacity-90 transition-smooth flex items-center space-x-2"
            >
              <span>{scoreMutation.isPending ? 'Evaluating...' : 'Evaluate Candidates'}</span>
              {!isProcessing && <ArrowRight className="w-4 h-4" />}
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="manage" className="space-y-4">
          {/* Existing Candidates List */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-primary" />
                <span>All Candidates ({existingCandidates.length})</span>
              </CardTitle>
              <CardDescription>
                Manage your uploaded candidates and update their information
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              ) : existingCandidates.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No candidates uploaded yet</p>
                  <p className="text-sm">Switch to the Upload tab to add candidates</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {existingCandidates.map((candidate) => (
                    <div key={candidate.id} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                      <div className="flex items-center space-x-3">
                        <FileText className="w-5 h-5 text-primary" />
                        <div>
                          <p className="font-medium text-foreground">{candidate.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {candidate.file_name} • Uploaded {new Date(candidate.uploaded_at).toLocaleDateString()}
                          </p>
                          {candidate.evaluation_count > 0 && (
                            <p className="text-xs text-primary">
                              {candidate.evaluation_count} evaluation{candidate.evaluation_count > 1 ? 's' : ''}
                              {candidate.latest_score && ` • Latest score: ${candidate.latest_score}%`}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            candidate.status === 'evaluated'
                              ? 'bg-success/20 text-success'
                              : candidate.status === 'processed'
                              ? 'bg-primary/20 text-primary'
                              : 'bg-muted-foreground/20 text-muted-foreground'
                          }`}
                        >
                          {candidate.status === 'uploaded'
                            ? 'Uploaded'
                            : candidate.status === 'processed'
                            ? 'Processed'
                            : 'Evaluated'}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewCandidate(candidate)}
                          className="h-8 w-8 p-0"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditCandidate(candidate)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteConfirm(candidate.id)}
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Action Buttons for Manage Tab */}
          <div className="flex justify-between pt-6">
            <Button
              variant="outline"
              onClick={handleCancel}
            >
              Back
            </Button>
            <Button
              onClick={() => setActiveTab('upload')}
              className="bg-gradient-primary hover:opacity-90 transition-smooth flex items-center space-x-2"
            >
              <Upload className="w-4 h-4" />
              <span>Upload More Candidates</span>
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      {/* Edit Candidate Dialog */}
      <Dialog open={!!editingCandidate} onOpenChange={() => setEditingCandidate(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Candidate Information</DialogTitle>
          </DialogHeader>
          {editingCandidate && (
            <div className="space-y-4 py-2">
              <div>
                <Label htmlFor="candidateName">Name</Label>
                <Input
                  id="candidateName"
                  value={editingCandidate.name || ""}
                  onChange={(e) => setEditingCandidate({ ...editingCandidate, name: e.target.value })}
                  placeholder="Enter candidate name"
                />
              </div>
              <div>
                <Label>File Name</Label>
                <Input value={editingCandidate.file_name} disabled />
              </div>
              <div>
                <Label>Upload Date</Label>
                <Input value={new Date(editingCandidate.uploaded_at).toLocaleDateString()} disabled />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingCandidate(null)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateCandidate}>
              Update
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Candidate Dialog */}
      <Dialog open={!!viewingCandidate} onOpenChange={() => setViewingCandidate(null)}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Candidate Details</DialogTitle>
          </DialogHeader>
          {viewingCandidate && (
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Name</Label>
                  <p className="text-sm font-medium">{viewingCandidate.name}</p>
                </div>
                <div>
                  <Label>File Name</Label>
                  <p className="text-sm font-medium">{viewingCandidate.file_name}</p>
                </div>
                <div>
                  <Label>Upload Date</Label>
                  <p className="text-sm font-medium">{new Date(viewingCandidate.uploaded_at).toLocaleDateString()}</p>
                </div>
                <div>
                  <Label>Status</Label>
                  <p className="text-sm font-medium capitalize">{viewingCandidate.status}</p>
                </div>
              </div>
              {viewingCandidate.cv_text && (
                <div>
                  <Label>CV Content</Label>
                  <Textarea
                    value={viewingCandidate.cv_text}
                    readOnly
                    rows={10}
                    className="mt-1 text-xs"
                  />
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setViewingCandidate(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Candidate?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove this candidate and all associated evaluations. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteConfirm && handleDeleteCandidate(deleteConfirm)}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );

  return showLayout ? (
    <Layout currentStep={3}>
      {formContent}
    </Layout>
  ) : (
    formContent
  );
};

export default CandidateForm;