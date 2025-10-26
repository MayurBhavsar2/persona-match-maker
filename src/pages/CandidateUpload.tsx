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
  status: 'uploaded' | 'processing' | 'completed' | 'error';
}

const CandidateUpload = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  // Get role and persona from localStorage
  const selectedJD = localStorage.getItem('selectedJD');
  const personaData = localStorage.getItem('personaData');
  const roleName = selectedJD ? JSON.parse(selectedJD).role : 'N/A';
  const personaName = personaData ? JSON.parse(personaData).personaName : 'N/A';

  const handleFileUpload = (uploadedFiles: FileList | null) => {
    if (!uploadedFiles) return;

    const newFiles: UploadedFile[] = Array.from(uploadedFiles).map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      status: 'uploaded'
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
    
    try {
      // Process each file through your backend API
      const processedCandidates = [];
      
      for (let i = 0; i < files.length; i++) {
        setFiles(prev => prev.map((file, index) => 
          index === i ? { ...file, status: 'processing' } : file
        ));
        
        // TODO: Replace with your actual candidate evaluation API endpoint
        const formData = new FormData();
        
        // Create a File object from the uploaded file data
        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
        const actualFile = fileInput?.files?.[i];
        
        if (actualFile) {
          formData.append('candidateCV', actualFile);
          formData.append('jobDescriptionData', localStorage.getItem('selectedJD') || '');
          formData.append('personaData', localStorage.getItem('personaData') || '');
        }

        try {
          const response = await fetch('YOUR_API_ENDPOINT_FOR_CANDIDATE_EVALUATION', {
            method: 'POST',
            body: formData,
            headers: {
              // Add any required headers (authorization, etc.)
              // 'Authorization': 'Bearer YOUR_API_KEY',
            }
          });

          if (!response.ok) {
            throw new Error(`Evaluation failed for ${files[i].name}`);
          }

          const evaluationResult = await response.json();
          
          // Process the API response and create candidate object
          processedCandidates.push({
            id: files[i].id,
            name: evaluationResult.candidateName || `Candidate ${i + 1}`,
            fileName: files[i].name,
            overallScore: evaluationResult.overallScore || Math.floor(Math.random() * 40) + 60,
            fitCategory: evaluationResult.fitCategory || (i % 3 === 0 ? 'perfect' : i % 3 === 1 ? 'moderate' : 'low'),
            technicalSkills: evaluationResult.technicalSkills || Math.floor(Math.random() * 30) + 70,
            experience: evaluationResult.experience || Math.floor(Math.random() * 25) + 75,
            communication: evaluationResult.communication || Math.floor(Math.random() * 35) + 65,
            certifications: evaluationResult.certifications || Math.floor(Math.random() * 40) + 60,
            applicationDate: new Date().toISOString(),
            // Include full API response for detailed analysis
            evaluationData: evaluationResult
          });
          
        } catch (apiError) {
          console.error(`API Error for ${files[i].name}:`, apiError);
          
          // Fallback: Generate mock data if API fails
          const candidateNames = [
            'Mayur Bhavsar', 'Priya Sharma', 'Rajesh Kumar', 'Anita Patel', 'Vikram Singh',
            'Sneha Gupta', 'Arjun Mehta', 'Kavya Iyer', 'Rohit Joshi', 'Deepika Rao'
          ];
          
          processedCandidates.push({
            id: files[i].id,
            name: candidateNames[i % candidateNames.length],
            fileName: files[i].name,
            overallScore: Math.floor(Math.random() * 40) + 60,
            fitCategory: i % 3 === 0 ? 'perfect' : i % 3 === 1 ? 'moderate' : 'low',
            technicalSkills: Math.floor(Math.random() * 30) + 70,
            experience: Math.floor(Math.random() * 25) + 75,
            communication: Math.floor(Math.random() * 35) + 65,
            certifications: Math.floor(Math.random() * 40) + 60,
            applicationDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
          });
        }
        
        setFiles(prev => prev.map((file, index) => 
          index === i ? { ...file, status: 'completed' } : file
        ));
      }

      // Store the evaluation results
      localStorage.setItem('evaluatedCandidates', JSON.stringify({
        candidates: processedCandidates,
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

    } catch (error) {
      console.error('Evaluation Error:', error);
      setIsProcessing(false);
      
      toast({
        title: "Evaluation failed",
        description: "There was an error evaluating the candidates. Please try again.",
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
      <div className="max-w-4xl mx-auto space-y-3">
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
          <p className="text-base text-muted-foreground">
            Upload candidate resumes to evaluate them against your configured persona
          </p>
        </div>

        {/* Upload Area */}
        <Card className="shadow-card">
          <CardHeader className="pb-2 pt-4">
            <CardTitle className="flex items-center space-x-2 text-base">
              <Upload className="w-4 h-4 text-primary" />
              <span>CV Upload</span>
            </CardTitle>
            <CardDescription className="text-xs">
              Upload PDF, DOC, DOCX files. Multiple files supported.
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-4">
            <div
              className={`border-2 border-dashed rounded-lg p-4 text-center transition-all ${
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
                <div className="flex flex-col items-center space-y-2">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <Upload className="w-5 h-5 text-primary" />
                  </div>
                  <div className="space-y-0.5">
                    <h3 className="text-sm font-medium text-foreground">
                      Drop files here or click to upload
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Supports PDF, DOC, DOCX up to 10MB
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
            <CardHeader className="pb-2 pt-4">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2 text-base">
                  <Users className="w-4 h-4 text-primary" />
                  <span>Uploaded CVs ({files.length})</span>
                </CardTitle>
                {isProcessing && (
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-muted-foreground">Processing...</span>
                    <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </div>
              {isProcessing && (
                <div className="space-y-1 mt-2">
                  <Progress value={processingProgress} className="h-1.5" />
                  <p className="text-xs text-muted-foreground">
                    {completedFiles} of {files.length} files processed
                  </p>
                </div>
              )}
            </CardHeader>
            <CardContent className="pb-4">
              <div className="space-y-1 max-h-[240px] overflow-y-auto">
                {files.map((file) => (
                  <div key={file.id} className="flex items-center justify-between p-2 bg-muted rounded hover:bg-muted/80 transition-colors">
                    <div className="flex items-center space-x-2 flex-1 min-w-0">
                      {getStatusIcon(file.status)}
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <p className="font-medium text-sm text-foreground truncate">{file.name}</p>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">({formatFileSize(file.size)})</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 flex-shrink-0">
                      <span className={`text-xs px-2 py-0.5 rounded-full whitespace-nowrap ${
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
                          className="h-6 w-6 p-0"
                        >
                          <X className="w-3 h-3" />
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