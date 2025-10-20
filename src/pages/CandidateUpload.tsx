import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Upload, FileText, X, CheckCircle, ArrowRight, Users } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  status: 'uploaded' | 'processing' | 'completed' |'duplicate'| 'error';
  file?:File;
}

const CandidateUpload = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  // Get role and persona from localStorage
  const selectedJD = localStorage.getItem('selectedJD');
  const role = localStorage.getItem('jdData');
  const personaData = localStorage.getItem('savedPersona');
  const roleName = role ? JSON.parse(role).role : 'N/A';
  const personaName = personaData ? JSON.parse(personaData).name : 'N/A';

  const handleFileUpload = async (uploadedFiles: FileList | null) => {
  if (!uploadedFiles) return;

  setIsProcessing(true); // optional: show loading spinner

  const filesArray: UploadedFile[] = Array.from(uploadedFiles).map(file => ({
    id: Math.random().toString(36).substr(2, 9),
    name: file.name,
    size: file.size,
    status: 'processing', // mark as processing while API call happens
    file
  }));

  // Update state immediately so user sees files
  setFiles(prev => [...prev, ...filesArray]);

  try {
    const formData = new FormData();
    Array.from(uploadedFiles).forEach(file => formData.append("files", file));

    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/candidate/upload`, {
      method: "POST",
      body: formData,
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    const result = await response.json();

    if (!response.ok) throw new Error(result.message || "Upload failed");

    // Update statuses based on API response
    const updatedFiles = filesArray.map(file => {
      const fileResult = result.find((r: any) => r.file_name === file.name);
      let newStatus: UploadedFile['status'];

      switch (fileResult?.status) {
        case 'success':
          newStatus = 'completed';
          break;
        case 'duplicate':
          newStatus = 'duplicate';
          break;
        default:
          newStatus = 'error';
      }

      return { ...file, status: newStatus };
    });

    // Merge updated files with previous state
    setFiles(prev => [
      ...prev.filter(f => !filesArray.some(nf => nf.id === f.id)),
      ...updatedFiles
    ]);

    // Optionally: toast for duplicates
    const hasDuplicates = updatedFiles.some(f => f.status === 'duplicate');
    if (hasDuplicates) {
      toast({
        title: "Duplicate CVs found",
        description: "Some CVs are duplicates and already exist in the system.",
        variant: "destructive",
      });
    }

  } catch (error: any) {
    console.error("Upload Error:", error);
    toast({
      title: "Upload failed",
      description: error.message || "Something went wrong.",
      variant: "destructive",
    });
  } finally {
    setIsProcessing(false);
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
    if (files.length === 0) {
      toast({
        title: "No files to evaluate",
        description: "Please upload candidate CVs before proceeding.",
        variant: "destructive",
      });
      return;
    }

    //setIsProcessing(true);
    
    //setIsProcessing(true);
    setTimeout(() => {
          navigate("/results");
        }, 1500);

      // try {
      //   const formData = new FormData();
      //   files.forEach((file) => formData.append("files", file.file));

      //   const response = await fetch("/api/v1/candidate/upload", {
      //     method: "POST",
      //     body: formData,
      //     headers: {
      //       Authorization: `Bearer ${localStorage.getItem("token")}`,
      //     },
      //   });

      //   const result = await response.json();

      //   if (!response.ok) {
      //     throw new Error(result.message || "Upload failed");
      //   }

      //   // Update file statuses based on API result
      //   const updatedFiles = files.map(file => {
      //     const fileResult = result.find((r: any) => r.file_name === file.name);
      //     if (!fileResult) return file;

      //     let newStatus: UploadedFile['status'];

      //   switch (fileResult.status) {
      //     case 'success':
      //       newStatus = 'completed';
      //       break;
      //     case 'duplicate':
      //       newStatus = 'duplicate';
      //       break;
      //     case 'error':
      //       newStatus = 'error';
      //       break;
      //     default:
      //       newStatus = 'error';
      //   }

      //   return { ...file, status: newStatus };
      // });

      //   setFiles(updatedFiles);

      //   const hasDuplicates = result.some((r: any) => r.status === "duplicate");
      //   if (hasDuplicates) {
      //     toast({
      //       title: "Duplicate CVs found",
      //       description: "Some CVs already exist in the system. Please remove duplicates and retry.",
      //       variant: "destructive",
      //     });
      //     setIsProcessing(false);
      //     return; // 🚫 stop navigation
      //   }

      //   // ✅ proceed only if all successful
      //   localStorage.setItem(
      //     "evaluatedCandidates",
      //     JSON.stringify({ candidates: result, timestamp: Date.now() })
      //   );

      //   toast({
      //     title: "Evaluation completed",
      //     description: `${result.length} candidates have been evaluated successfully.`,
      //   });

      //   setTimeout(() => {
      //     navigate("/results");
      //   }, 1500);

      // } catch (error: any) {
      //   console.error("Evaluation Error:", error);
      //   toast({
      //     title: "Evaluation failed",
      //     description: error.message || "Something went wrong.",
      //     variant: "destructive",
      //   });
      // } finally {
      //   setIsProcessing(false);
      // }



      // Store the evaluation results
      // localStorage.setItem('evaluatedCandidates', JSON.stringify({
      //   candidates: processedCandidates,
      //   timestamp: Date.now()

      
      

    // } catch (error) {
    //   console.error('Evaluation Error:', error);
    //   setIsProcessing(false);
      
    //   toast({
    //     title: "Evaluation failed",
    //     description: "There was an error evaluating the candidates. Please try again.",
    //     variant: "destructive",
    //   });
    // }
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
       // return <X className="w-4 h-4 text-warning" />;
      case 'error':
       // return <X className="w-4 h-4 text-danger" />;
       case 'error':
       // return <X className="w-4 h-4 text-danger" />;
      default:
        return <FileText className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const completedFiles = files.filter(file => file.status === 'completed').length;
  const processingProgress = files.length > 0 ? (completedFiles / files.length) * 100 : 0;

  return (
    <Layout currentStep={3}>
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
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
          {/* <p className="text-base text-muted-foreground">
            Upload candidate resumes to evaluate them against your configured persona
          </p> */}
        </div>
        </div>

        {/* Upload Area */}
        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-lg">
              <Upload className="w-4 h-4 text-primary" />
              <span>CV Upload</span>
            </CardTitle>
            <CardDescription className="text-sm">
              Upload PDF, DOC, DOCX files. Multiple files supported.
            </CardDescription>
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
              />
              <label htmlFor="cv-upload" className="cursor-pointer">
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
                    <span className="text-sm text-muted-foreground">Processing...</span>
                    <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </div>
              {isProcessing && (
                <div className="space-y-2">
                  <Progress value={processingProgress} className="h-2" />
                  <p className="text-xs text-muted-foreground">
                    {completedFiles} of {files.length} files processed
                  </p>
                </div>
              )}
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {files.map((file) => (
                  <div key={file.id} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(file.status)}
                      <div>
                        <p className="font-medium text-foreground">{file.name}</p>
                        <p className="text-sm text-muted-foreground">{formatFileSize(file.size)}</p>
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
                            ? 'bg-yellow-200 text-yellow-800'  // 🟡 duplicate style
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
                          ? 'Duplicate'
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
            disabled={files.length === 0 || isProcessing}
            className="bg-gradient-primary hover:opacity-90 transition-smooth flex items-center space-x-2"
          >
            <span>{isProcessing ? 'Evaluating...' : 'Evaluate Candidates'}</span>
            {!isProcessing && <ArrowRight className="w-4 h-4" />}
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default CandidateUpload;