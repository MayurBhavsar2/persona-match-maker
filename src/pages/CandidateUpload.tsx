import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Upload, FileText, X, CheckCircle, ArrowRight, Users } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useUploadCandidates, useScoreCandidates } from "@/lib/helper";
import type { UploadedCandidate } from "@/lib/helper";

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  status: 'uploaded' | 'processing' | 'Ready' |'duplicate'| 'error';
  file?: File;
  candidateData?: UploadedCandidate;
}

const CandidateUpload = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [dragActive, setDragActive] = useState(false);

  const uploadMutation = useUploadCandidates();
  const scoreMutation = useScoreCandidates();

  // Get role and persona from localStorage
  const role = localStorage.getItem('jdData');
  const personaData = localStorage.getItem('savedPersona');
  const roleName = role ? JSON.parse(role).role : 'N/A';
  const personaName = personaData ? JSON.parse(personaData).name : 'N/A';
  const persona_id = personaData ? JSON.parse(personaData).id : null;

  const isProcessing = uploadMutation.isPending || scoreMutation.isPending;
  const useMockData = import.meta.env.VITE_USE_MOCK_DATA === 'true';

  // const handleFileUpload = async (uploadedFiles: FileList | null) => {
  //   if (!uploadedFiles) return;

  //   const filesArray: UploadedFile[] = Array.from(uploadedFiles).map(file => ({
  //     id: Math.random().toString(36).substr(2, 9),
  //     name: file.name,
  //     size: file.size,
  //     status: 'processing',
  //     file
  //   }));

  //   setFiles(prev => [...prev, ...filesArray]);

  //   try {
  //     const result = await uploadMutation.mutateAsync(Array.from(uploadedFiles));

  //     // Update file statuses based on API response
  //     // const updatedFiles = filesArray.map(file => {
  //     //   const candidateData = result.find((r: UploadedCandidate) => r.file_name === file.name);
        
  //     //   let newStatus: UploadedFile['status'];
  //     //   switch (candidateData?.status) {
  //     //     case 'success':
  //     //       newStatus = 'completed';
  //     //       break;
  //     //     case 'duplicate':
  //     //       newStatus = 'duplicate';
  //     //       break;
  //     //     default:
  //     //       newStatus = 'error';
  //     //   }

  //     //   return { 
  //     //     ...file, 
  //     //     status: newStatus,
  //     //     candidateData 
  //     //   };
  //     // });

  //     //Mayur version

  //     const updatedFiles = filesArray.map(file => {
  //       const fileResult = result.find((r: any) => r.file_name === file.name);

  //       let newStatus: UploadedFile["status"] = "error"; // default to error

  //       if (fileResult?.status === "success" || fileResult?.status === "duplicate") {
  //         newStatus = "Ready";
  //       }

  //       return { ...file, status: newStatus };
  //     });

  //     setFiles(prev => [
  //       ...prev.filter(f => !filesArray.some(nf => nf.id === f.id)),
  //       ...updatedFiles
  //     ]);

  //   } catch (error) {
  //     console.error("Upload Error:", error);
  //     // Mark files as error
  //     setFiles(prev => prev.map(f => 
  //       filesArray.some(nf => nf.id === f.id) 
  //         ? { ...f, status: 'error' as const }
  //         : f
  //     ));
  //   }
  // };


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

    // Update file statuses based on API response AND store candidateData
    const updatedFiles = filesArray.map(file => {
      const candidateData = result.find((r: UploadedCandidate) => r.file_name === file.name);
      
      // Determine status based on API response
      let newStatus: UploadedFile['status'] = 'error';
      
      if (candidateData) {
        if (candidateData.status === 'success') {
          newStatus = 'Ready';
        } else if (candidateData.status === 'duplicate') {
          newStatus = 'duplicate';  // Keep duplicate status separate
        }
      }

      return { 
        ...file, 
        status: newStatus,
        candidateData  // CRITICAL: Store the candidate data for evaluation
      };
    });

    // Replace the processing files with updated ones
    setFiles(prev => [
      ...prev.filter(f => !filesArray.some(nf => nf.id === f.id)),
      ...updatedFiles
    ]);

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

  const candidates = files
    .filter(f => f.candidateData && (f.status === 'Ready' || f.status === 'duplicate'))
    .map(f => f.candidateData!);

  if (candidates.length === 0) {
    toast({
      title: "No candidates to evaluate",
      description: "Please upload candidate CVs before proceeding.",
      variant: "destructive",
    });
    return;
  }

  try {
    await scoreMutation.mutateAsync({ candidates, persona_id });
  } catch (error) {
    console.error('Evaluation error:', error);
  }
};

  const getStatusIcon = (status: UploadedFile['status']) => {
    switch (status) {
      case 'uploaded':
        return <FileText className="w-4 h-4 text-muted-foreground" />;
      case 'processing':
        return <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />;
      case 'Ready':
        return <CheckCircle className="w-4 h-4 text-success" />;
      case 'duplicate':
        return <CheckCircle className="w-4 h-4 text-success" />;
      case 'error':
        return <X className="w-4 h-4 text-danger" />;
      default:
        return <FileText className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const completedFiles = files.filter(file => file.status === 'Ready' || file.status === 'duplicate').length;
  const processingProgress = files.length > 0 ? (completedFiles / files.length) * 100 : 0;

  return (
    <Layout currentStep={3}>
      <div className="max-w-4xl mx-auto space-y-4">
        <div className="text-center space-y-2">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-foreground">Upload Candidate CVs</h1>
              <div className="flex items-center gap-3 text-sm">
                <span className="px-3 py-1 bg-muted text-foreground rounded-md font-medium">
                  Role: {roleName}
                </span>
                <span className="px-3 py-1 bg-muted text-foreground rounded-md font-medium">
                  Persona: {personaName}
                </span>
              </div>
            </div>
          </div>
        </div>

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
                        {/* <p className="text-sm text-muted-foreground">{formatFileSize(file.size)}</p> */}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          file.status === 'Ready'
                            ? 'bg-success/20 text-success'
                            : file.status === 'processing'
                            ? 'bg-primary/20 text-primary'
                            : file.status === 'duplicate'
                            ? 'bg-success/20 text-success'
                            : file.status === 'error'
                            ? 'bg-danger/20 text-danger'
                            : 'bg-muted-foreground/20 text-muted-foreground'
                        }`}
                      >
                        {file.status === 'uploaded'
                          ? 'Ready'
                          : file.status === 'processing'
                          ? 'Processing'
                          : file.status === 'Ready'
                          ? 'Ready'
                          : file.status === 'duplicate'
                          ? 'Ready'
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

        {/* Action Buttons */}
        <div className="flex justify-between pt-6">
          <Button
            variant="outline"
            onClick={() => navigate('/persona-config')}
            disabled={isProcessing}
          >
            Back to Persona Config
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
      </div>
    </Layout>
  );
};

export default CandidateUpload;