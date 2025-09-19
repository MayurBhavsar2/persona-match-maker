import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Upload, FileText, X, CheckCircle, ArrowRight, Users } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { 
  parseResumeFile, 
  getStoredPersonaConfig, 
  evaluateCandidate, 
  extractCandidateName,
  type ResumeData,
  type CandidateEvaluation
} from "@/utils/resumeParser";

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  status: 'uploaded' | 'processing' | 'completed' | 'error';
  file?: File;
}

const CandidateUpload = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleFileUpload = (uploadedFiles: FileList | null) => {
    if (!uploadedFiles) return;

    const newFiles: UploadedFile[] = Array.from(uploadedFiles).map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      status: 'uploaded',
      file: file // Store the actual file for parsing
    }));

    setFiles(prev => [...prev, ...newFiles]);
    
    toast({
      title: "Files uploaded",
      description: `${newFiles.length} CV(s) uploaded successfully.`,
    });
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

    setIsProcessing(true);
    
    // Process files and update status
    for (let i = 0; i < files.length; i++) {
      setFiles(prev => prev.map((file, index) => 
        index === i ? { ...file, status: 'processing' } : file
      ));
      
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setFiles(prev => prev.map((file, index) => 
        index === i ? { ...file, status: 'completed' } : file
      ));
    }

    // Parse and evaluate actual resume files
    const evaluatedCandidates = await Promise.all(
      files.map(async (file, index) => {
        try {
          const resumeData = await parseResumeFile(file.file!);
          const personaConfig = getStoredPersonaConfig();
          const evaluation = evaluateCandidate(resumeData, personaConfig);
          
          return {
            id: file.id,
            name: extractCandidateName(resumeData) || `Candidate ${index + 1}`,
            fileName: file.name,
            overallScore: evaluation.overallScore,
            fitCategory: evaluation.fitCategory,
            technicalSkills: evaluation.technicalSkills,
            experience: evaluation.experience,
            communication: evaluation.communication,
            certifications: evaluation.certifications,
            applicationDate: new Date().toISOString().split('T')[0],
            resumeData: resumeData,
            evaluation: evaluation
          };
        } catch (error) {
          console.error(`Error processing ${file.name}:`, error);
          return {
            id: file.id,
            name: `Candidate ${index + 1}`,
            fileName: file.name,
            overallScore: 50,
            fitCategory: 'low' as const,
            technicalSkills: 50,
            experience: 50,
            communication: 50,
            certifications: 50,
            applicationDate: new Date().toISOString().split('T')[0],
            resumeData: null,
            evaluation: null
          };
        }
      })
    );

    localStorage.setItem('evaluatedCandidates', JSON.stringify({
      candidates: evaluatedCandidates,
      timestamp: Date.now()
    }));

    setIsProcessing(false);
    
    toast({
      title: "Evaluation completed",
      description: `${files.length} candidates have been evaluated successfully.`,
    });

    setTimeout(() => {
      navigate('/results');
    }, 1500);
  };

  const getStatusIcon = (status: UploadedFile['status']) => {
    switch (status) {
      case 'uploaded':
        return <FileText className="w-4 h-4 text-muted-foreground" />;
      case 'processing':
        return <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-success" />;
      case 'error':
        return <X className="w-4 h-4 text-danger" />;
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
          <h1 className="text-3xl font-bold text-foreground">Upload Candidate CVs</h1>
          <p className="text-lg text-muted-foreground">
            Upload candidate resumes to evaluate them against your configured persona
          </p>
        </div>

        {/* Upload Area */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Upload className="w-5 h-5 text-primary" />
              <span>CV Upload</span>
            </CardTitle>
            <CardDescription>
              Upload PDF, DOC, DOCX files. Multiple files supported.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div
              className={`border-2 border-dashed rounded-lg p-12 text-center transition-all ${
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
                <div className="flex flex-col items-center space-y-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                    <Upload className="w-8 h-8 text-primary" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium text-foreground">
                      Drop files here or click to upload
                    </h3>
                    <p className="text-sm text-muted-foreground">
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
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        file.status === 'completed' ? 'bg-success/20 text-success' :
                        file.status === 'processing' ? 'bg-primary/20 text-primary' :
                        file.status === 'error' ? 'bg-danger/20 text-danger' :
                        'bg-muted-foreground/20 text-muted-foreground'
                      }`}>
                        {file.status === 'uploaded' ? 'Ready' :
                         file.status === 'processing' ? 'Processing' :
                         file.status === 'completed' ? 'Completed' : 'Error'}
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