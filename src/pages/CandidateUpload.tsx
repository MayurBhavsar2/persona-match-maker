import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Upload, FileText, X, CheckCircle, ArrowRight, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useUploadCandidates } from "@/lib/helper";
import { useScoreCandidates } from "@/lib/hooks";

const MAX_FILES = 10;

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  status: 'pending' | 'uploaded' | 'processing' | 'ready' | 'duplicate' | 'error';
  file?: File;
  candidateData?: any;
}

interface CandidateUploadProps {
  onSuccess?: (uploaded: any[]) => void;
  onCancel?: () => void;
  isModal?: boolean;
  onCandidatesUploaded?: (candidates: any[]) => void;
}

const CandidateUpload: React.FC<CandidateUploadProps> = ({ 
  onSuccess, 
  onCancel, 
  isModal, 
  onCandidatesUploaded
}) => {
  // Import these at the top of your file:
  // import { useToast } from "@/components/ui/use-toast";
  // import { useUploadCandidates } from "@/lib/helper";
  // import { useScoreCandidates } from "@/lib/hooks";
  
  const { toast } = useToast();
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [dragActive, setDragActive] = useState(false);
  
  const uploadMutation = useUploadCandidates();
  const scoreMutation = useScoreCandidates();

  const isProcessing = uploadMutation.isPending || scoreMutation.isPending;

  const handleFileSelection = (selectedFiles: FileList | null, e?: React.ChangeEvent<HTMLInputElement>) => {
    if (e) {
      e.preventDefault();
    }
    if (!selectedFiles) return;

    const newFilesArray = Array.from(selectedFiles);
    const totalFiles = files.length + newFilesArray.length;

    // Check if adding these files would exceed the limit
    if (totalFiles > MAX_FILES) {
      const remainingSlots = MAX_FILES - files.length;
      toast({
        title: "Too many files",
        description: remainingSlots > 0 
          ? `You can only upload ${MAX_FILES} files at once. You can add ${remainingSlots} more file${remainingSlots !== 1 ? 's' : ''}.`
          : `You've already selected ${MAX_FILES} files. Please remove some files before adding more.`,
        variant: "destructive",
        duration: 5000,
      });
      return;
    }

    const filesArray: UploadedFile[] = newFilesArray.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      status: 'pending',
      file,
    }));

    setFiles(prev => [...prev, ...filesArray]);
  };

  const handleUploadClick = async () => {
    if (files.length === 0) {
      toast({
        title: "No files selected",
        description: "Please select at least one file to upload.",
        variant: "destructive",
      });
      return;
    }

    if (files.length > MAX_FILES) {
      toast({
        title: "Too many files",
        description: `You can only upload ${MAX_FILES} files at once. Please remove ${files.length - MAX_FILES} file${files.length - MAX_FILES !== 1 ? 's' : ''}.`,
        variant: "destructive",
        duration: 5000,
      });
      return;
    }

    // Update all files to processing status
    setFiles(prev => prev.map(f => ({ ...f, status: 'processing' as const })));

    try {
      const filesToUpload = files.map(f => f.file).filter(Boolean) as File[];
      const result = await uploadMutation.mutateAsync(filesToUpload);

      const updatedFiles = files.map(file => {
        const candidateData = result.find((r: any) => r.file_name === file.name);
        let newStatus: UploadedFile['status'] = 'error';
        
        if (candidateData) {
          if (candidateData.status === 'success') {
            newStatus = 'ready';
          } else if (candidateData.status === 'duplicate') {
            newStatus = 'duplicate';
          }
        }
        
        return {
          ...file,
          status: newStatus,
          candidateData,
        };
      });

      setFiles(updatedFiles);

      const allUploadedCandidates = result.filter((r: any) => 
        r.status === 'success' || r.status === 'duplicate'
      );

      const newCount = result.filter((r: any) => r.status === 'success').length;
      const duplicateCount = result.filter((r: any) => r.status === 'duplicate').length;

      if (allUploadedCandidates.length > 0) {
        let toastMessage = '';
        if (newCount > 0 && duplicateCount > 0) {
          toastMessage = `${newCount} new and ${duplicateCount} existing candidate${duplicateCount > 1 ? 's' : ''} uploaded and selected.`;
        } else if (newCount > 0) {
          toastMessage = `${newCount} new candidate${newCount > 1 ? 's' : ''} uploaded and selected.`;
        } else if (duplicateCount > 0) {
          toastMessage = `${duplicateCount} existing candidate${duplicateCount > 1 ? 's' : ''} found and selected.`;
        }

        toast({
          title: "Candidates selected",
          description: toastMessage,
          duration: 4000,
        });

        onCandidatesUploaded?.(allUploadedCandidates);
      }

      onSuccess?.(result);
    } catch (error) {
      console.error('Upload Error:', error);
      setFiles(prev => prev.map(f => ({ ...f, status: 'error' as const })));
      
      toast({
        title: "Upload failed",
        description: "There was an error uploading your files. Please try again.",
        variant: "destructive",
      });
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
      handleFileSelection(e.dataTransfer.files);
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

  const getStatusIcon = (status: UploadedFile['status']) => {
    switch (status) {
      case 'pending':
        return <FileText className="h-5 w-5 text-gray-400" />;
      case 'uploaded':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'processing':
        return <div className="h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />;
      case 'ready':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'duplicate':
        return <CheckCircle className="h-5 w-5 text-amber-500" />;
      case 'error':
        return <X className="h-5 w-5 text-red-500" />;
      default:
        return <FileText className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusText = (status: UploadedFile['status']) => {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'uploaded':
        return 'Ready';
      case 'processing':
        return 'Processing';
      case 'ready':
        return 'Ready';
      case 'duplicate':
        return 'Ready';
      case 'error':
        return 'Error';
      default:
        return 'Unknown';
    }
  };

  const completedFiles = files.filter(file => 
    file.status === 'ready' || file.status === 'duplicate'
  ).length;
  const processingProgress = files.length > 0 ? (completedFiles / files.length) * 100 : 0;
  const hasPendingFiles = files.some(f => f.status === 'pending');

  return (
    <div className="space-y-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            CV Upload
          </CardTitle>
          <CardDescription>
            Upload candidate CVs to evaluate against the role (Maximum {MAX_FILES} files)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Upload Area */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive
                ? "border-blue-500 bg-blue-50"
                : "border-gray-300 hover:border-gray-400"
            } ${isProcessing ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={(e) => {
              if (isProcessing) {
                e.preventDefault();
              }
            }}
          >
            <input
              type="file"
              multiple
              accept=".pdf,.doc,.docx"
              className="hidden"
              id="file-upload"
              onChange={(e) => {
                handleFileSelection(e.target.files, e);
                e.target.value = '';
              }}
              disabled={isProcessing}
            />
            <label
              htmlFor="file-upload"
              className="cursor-pointer flex flex-col items-center gap-2"
            >
              <Upload className="h-12 w-12 text-gray-400" />
              <div>
                <p className="text-lg font-medium text-gray-700">
                  Drop files here or click to upload
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Supports PDF, DOC, DOCX files up to 10MB each
                </p>
                <p className="text-sm font-semibold text-gray-600 mt-2">
                  Maximum {MAX_FILES} files per upload
                </p>
              </div>
            </label>
          </div>

          {/* File Count Warning */}
          {files.length > 0 && (
            <div className={`flex items-center gap-2 p-3 rounded-lg ${
              files.length === MAX_FILES 
                ? "bg-amber-50 text-amber-800 border border-amber-200"
                : files.length > MAX_FILES
                ? "bg-red-50 text-red-800 border border-red-200"
                : "bg-blue-50 text-blue-800 border border-blue-200"
            }`}>
              {files.length > MAX_FILES ? (
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
              ) : files.length === MAX_FILES ? (
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
              ) : (
                <FileText className="h-5 w-5 flex-shrink-0" />
              )}
              <p className="text-sm font-medium">
                {files.length > MAX_FILES
                  ? `Too many files selected (${files.length}/${MAX_FILES}). Please remove ${files.length - MAX_FILES} file${files.length - MAX_FILES !== 1 ? 's' : ''}.`
                  : files.length === MAX_FILES
                  ? `Maximum limit reached (${files.length}/${MAX_FILES} files)`
                  : `${files.length}/${MAX_FILES} files selected`
                }
              </p>
            </div>
          )}

          {/* File List */}
          {files.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">
                  Uploaded CVs ({files.length})
                </h3>
                {isProcessing && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <div className="h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    {uploadMutation.isPending ? 'Uploading...' : 'Evaluating...'}
                  </div>
                )}
              </div>

              {uploadMutation.isPending && (
                <div className="space-y-2">
                  <Progress value={processingProgress} className="h-2" />
                  <p className="text-xs text-gray-500 text-center">
                    {completedFiles} of {files.length} files processed
                  </p>
                </div>
              )}

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {files.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {getStatusIcon(file.status)}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {file.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatFileSize(file.size)} - {getStatusText(file.status)}
                        </p>
                      </div>
                    </div>
                    {!isProcessing && file.status !== 'processing' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(file.id)}
                        className="h-8 w-8 p-0 hover:bg-red-100"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => onCancel?.()}
              disabled={isProcessing}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUploadClick}
              disabled={isProcessing || files.length === 0 || files.length > MAX_FILES || !hasPendingFiles}
              className="flex-1"
            >
              {isProcessing ? (
                <>
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Processing...
                </>
              ) : (
                <>
                  Upload & Process
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CandidateUpload;

/*Working version without file count limit */

// import { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import Layout from "@/components/Layout";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import { Progress } from "@/components/ui/progress";
// import { Upload, FileText, X, CheckCircle, ArrowRight, Users } from "lucide-react";
// import { useToast } from "@/components/ui/use-toast";
// import { useUploadCandidates } from "@/lib/helper";
// import { useScoreCandidates } from "@/lib/hooks";
// import type { UploadedCandidate } from "@/lib/helper";

// interface UploadedFile {
//   id: string;
//   name: string;
//   size: number;
//   status: 'uploaded' | 'processing' | 'ready' |'duplicate'| 'error';
//   file?: File;
//   candidateData?: UploadedCandidate;
// }

// interface CandidateUploadProps {
//   onSuccess?: (uploaded: UploadedCandidate[]) => void;
//   onCancel?: () => void;
//   isModal?: boolean;
//   onCandidatesUploaded?: (candidates: Candidate[]) => void;
// }

// const CandidateUpload: React.FC<CandidateUploadProps> = ({
//   onSuccess, 
//   onCancel, 
//   isModal,
//   onCandidatesUploaded
// }) => {
//   const navigate = useNavigate();
//   const { toast } = useToast();
//   const [files, setFiles] = useState<UploadedFile[]>([]);
//   const [dragActive, setDragActive] = useState(false);

//   const uploadMutation = useUploadCandidates();
//   const scoreMutation = useScoreCandidates();

//   // Get role and persona from localStorage
//   const role = localStorage.getItem('jdData');
//   const personaData = localStorage.getItem('savedPersona');
//   const roleName = role ? JSON.parse(role).role : 'N/A';
//   const personaName = personaData ? JSON.parse(personaData).name : 'N/A';
//   const persona_id = personaData ? JSON.parse(personaData).id : null;

//   const isProcessing = uploadMutation.isPending || scoreMutation.isPending;
//   const useMockData = import.meta.env.VITE_USE_MOCK_DATA === 'true';

//   const handleFileUpload = async (uploadedFiles: FileList | null, e?: React.ChangeEvent<HTMLInputElement>) => {
//     // Prevent any default form behavior
//     if (e) {
//       e.preventDefault();
//     }
    
//     if (!uploadedFiles) return;

//     const filesArray: UploadedFile[] = Array.from(uploadedFiles).map(file => ({
//       id: Math.random().toString(36).substr(2, 9),
//       name: file.name,
//       size: file.size,
//       status: 'processing',
//       file,
//     }));

//     setFiles(prev => [...prev, ...filesArray]);

//     try {
//       const result = await uploadMutation.mutateAsync(Array.from(uploadedFiles));
//       // result: UploadedCandidate[]

//       const updatedFiles = filesArray.map(file => {
//         const candidateData = result.find((r: UploadedCandidate) => r.file_name === file.name);

//         let newStatus: UploadedFile['status'] = 'error';

//         if (candidateData) {
//           if (candidateData.status === 'success') {
//             newStatus = 'ready';
//           } else if (candidateData.status === 'duplicate') {
//             newStatus = 'duplicate';
//           }
//         }

//         return {
//           ...file,
//           status: newStatus,
//           candidateData,
//         };
//       });

//       setFiles(prev => [
//         ...prev.filter(f => !filesArray.some(nf => nf.id === f.id)),
//         ...updatedFiles,
//       ]);

//       // 🔹 Extract ALL successfully uploaded candidates (both new and duplicate)
//       const allUploadedCandidates = result.filter((r: UploadedCandidate) => 
//         r.status === 'success' || r.status === 'duplicate'
//       );

//       // 🔹 Count new vs duplicate
//       const newCount = result.filter((r: UploadedCandidate) => r.status === 'success').length;
//       const duplicateCount = result.filter((r: UploadedCandidate) => r.status === 'duplicate').length;

//       // 🔹 Show appropriate toast message
//       if (allUploadedCandidates.length > 0) {
//         let toastMessage = '';
        
//         if (newCount > 0 && duplicateCount > 0) {
//           toastMessage = `${newCount} new and ${duplicateCount} existing candidate${duplicateCount > 1 ? 's' : ''} uploaded and selected.`;
//         } else if (newCount > 0) {
//           toastMessage = `${newCount} new candidate${newCount > 1 ? 's' : ''} uploaded and selected.`;
//         } else if (duplicateCount > 0) {
//           toastMessage = `${duplicateCount} existing candidate${duplicateCount > 1 ? 's' : ''} found and selected.`;
//         }

//         toast({
//           title: "Candidates selected",
//           description: toastMessage,
//           duration: 4000,
//         });

//         // 🔹 Notify parent with the full uploaded candidate objects
//         onCandidatesUploaded?.(allUploadedCandidates);
//       }

//       // 🔹 Notify parent that upload is done
//       onSuccess?.(result);

//     } catch (error) {
//       console.error('Upload Error:', error);
//       setFiles(prev =>
//         prev.map(f =>
//           filesArray.some(nf => nf.id === f.id)
//             ? { ...f, status: 'error' as const }
//             : f,
//         ),
//       );
//     }
//   };


//   const handleDrag = (e: React.DragEvent) => {
//     e.preventDefault();
//     e.stopPropagation();
//     if (e.type === "dragenter" || e.type === "dragover") {
//       setDragActive(true);
//     } else if (e.type === "dragleave") {
//       setDragActive(false);
//     }
//   };

//   const handleDrop = (e: React.DragEvent) => {
//     e.preventDefault();
//     e.stopPropagation();
//     setDragActive(false);
    
//     if (e.dataTransfer.files && e.dataTransfer.files[0]) {
//       handleFileUpload(e.dataTransfer.files);
//     }
//   };

//   const removeFile = (fileId: string) => {
//     setFiles(prev => prev.filter(file => file.id !== fileId));
//   };

//   const formatFileSize = (bytes: number) => {
//     if (bytes === 0) return '0 Bytes';
//     const k = 1024;
//     const sizes = ['Bytes', 'KB', 'MB', 'GB'];
//     const i = Math.floor(Math.log(bytes) / Math.log(k));
//     return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
//   };

//   const getStatusIcon = (status: UploadedFile['status']) => {
//     switch (status) {
//       case 'uploaded':
//         return <FileText className="w-4 h-4 text-muted-foreground" />;
//       case 'processing':
//         return <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />;
//       case 'ready':
//         return <CheckCircle className="w-4 h-4 text-success" />;
//       case 'duplicate':
//         return <CheckCircle className="w-4 h-4 text-success" />;
//       case 'error':
//         return <X className="w-4 h-4 text-danger" />;
//       default:
//         return <FileText className="w-4 h-4 text-muted-foreground" />;
//     }
//   };

//   const completedFiles = files.filter(file => file.status === 'ready' || file.status === 'duplicate').length;
//   const processingProgress = files.length > 0 ? (completedFiles / files.length) * 100 : 0;

//   return (
//     <div className="max-w-7xl min-w-4xl w-full mx-auto space-y-4">
//       {/* Upload Area */}
//       <Card className="shadow-card">
//         <CardHeader className="pb-2">
//           <CardTitle className="flex items-center space-x-2 text-lg">
//             <Upload className="w-4 h-4 text-primary" />
//             <span>CV Upload</span>
//           </CardTitle>
//         </CardHeader>
//         <CardContent>
//           <div
//             className={`border-2 border-dashed rounded-lg p-8 text-center transition-all ${
//               dragActive 
//                 ? 'border-primary bg-primary/5' 
//                 : 'border-border hover:border-primary hover:bg-muted/50'
//             }`}
//             onDragEnter={handleDrag}
//             onDragLeave={handleDrag}
//             onDragOver={handleDrag}
//             onDrop={handleDrop}
//           >
//             <input
//               type="file"
//               id="cv-upload"
//               className="hidden"
//               multiple
//               accept=".pdf,.doc,.docx"
//               onChange={(e) => {
//                 e.preventDefault();
//                 handleFileUpload(e.target.files, e);
//                 // Reset input so same file can be uploaded again
//                 e.target.value = '';
//               }}
//               disabled={isProcessing}
//             />
//             <label 
//               htmlFor="cv-upload" 
//               className={isProcessing ? 'cursor-not-allowed' : 'cursor-pointer'}
//               onClick={(e) => {
//                 if (isProcessing) {
//                   e.preventDefault();
//                 }
//               }}
//             >
//               <div className="flex flex-col items-center space-y-3">
//                 <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
//                   <Upload className="w-6 h-6 text-primary" />
//                 </div>
//                 <div className="space-y-1">
//                   <h3 className="text-base font-medium text-foreground">
//                     Drop files here or click to upload
//                   </h3>
//                   <p className="text-xs text-muted-foreground">
//                     Supports PDF, DOC, DOCX files up to 10MB each
//                   </p>
//                 </div>
//               </div>
//             </label>
//           </div>
//         </CardContent>
//       </Card>

//       {/* File List */}
//       {files.length > 0 && (
//         <Card className="shadow-card">
//           <CardHeader>
//             <div className="flex items-center justify-between">
//               <CardTitle className="flex items-center space-x-2">
//                 <Users className="w-5 h-5 text-primary" />
//                 <span>Uploaded CVs ({files.length})</span>
//               </CardTitle>
//               {isProcessing && (
//                 <div className="flex items-center space-x-2">
//                   <span className="text-sm text-muted-foreground">
//                     {uploadMutation.isPending ? 'Uploading...' : 'Evaluating...'}
//                   </span>
//                   <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
//                 </div>
//               )}
//             </div>
//             {uploadMutation.isPending && (
//               <div className="space-y-2">
//                 <Progress value={processingProgress} className="h-2" />
//                 <p className="text-xs text-muted-foreground">
//                   {completedFiles} of {files.length} files processed
//                 </p>
//               </div>
//             )}
//           </CardHeader>
//           <CardContent>
//             <div className="space-y-1">
//               {files.map((file) => (
//                 <div key={file.id} className="flex items-center justify-between px-4 py-2 bg-muted rounded-lg">
//                   <div className="flex items-center space-x-3">
//                     {getStatusIcon(file.status)}
//                     <div>
//                       <p className="font-medium text-foreground truncate">{file.name} - <span className="text-sm text-muted-foreground">{formatFileSize(file.size)}</span></p>
//                     </div>
//                   </div>
//                   <div className="flex items-center space-x-2">
//                     <span
//                       className={`text-xs px-2 py-1 rounded-full ${
//                         file.status === 'ready'
//                           ? 'bg-success/20 text-success'
//                           : file.status === 'processing'
//                           ? 'bg-primary/20 text-primary'
//                           : file.status === 'duplicate'
//                           ? 'bg-success/20 text-success'
//                           : file.status === 'error'
//                           ? 'bg-danger/20 text-danger'
//                           : 'bg-muted-foreground/20 text-muted-foreground'
//                       }`}
//                     >
//                       {file.status === 'uploaded'
//                         ? 'ready'
//                         : file.status === 'processing'
//                         ? 'Processing'
//                         : file.status === 'ready'
//                         ? 'ready'
//                         : file.status === 'duplicate'
//                         ? 'ready'
//                         : 'Error'}
//                     </span>

//                     {!isProcessing && file.status !== 'processing' && (
//                       <Button
//                         variant="ghost"
//                         size="sm"
//                         onClick={() => removeFile(file.id)}
//                         className="h-8 w-8 p-0"
//                       >
//                         <X className="w-4 h-4" />
//                       </Button>
//                     )}
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </CardContent>
//         </Card>
//       )}

//       {/* Action Buttons */}
//       <div className="flex justify-between pt-6">
//         <Button
//           variant="outline"
//           onClick={() => onCancel?.()}
//           disabled={isProcessing}
//         >
//           Cancel
//         </Button>
//       </div>
//     </div>
//   );
// };

// export default CandidateUpload;


/*** Updated Candidte Upload with Refresh issue***/
// import { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import Layout from "@/components/Layout";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import { Progress } from "@/components/ui/progress";
// import { Upload, FileText, X, CheckCircle, ArrowRight, Users } from "lucide-react";
// import { useToast } from "@/components/ui/use-toast";
// import { useUploadCandidates, useScoreCandidates } from "@/lib/helper";
// import type { UploadedCandidate } from "@/lib/helper";

// interface UploadedFile {
//   id: string;
//   name: string;
//   size: number;
//   status: 'uploaded' | 'processing' | 'ready' |'duplicate'| 'error';
//   file?: File;
//   candidateData?: UploadedCandidate;
// }

// interface CandidateUploadProps {
//   onSuccess?: (uploaded: UploadedCandidate[]) => void;
//   onCancel?: () => void;
//   isModal?: boolean;
//   // 🔹 NEW: Pass callback to handle all uploaded candidates (new + duplicate)
//   onCandidatesUploaded?: (candidateIds: string[]) => void;
// }

// const CandidateUpload: React.FC<CandidateUploadProps> = ({
//   onSuccess, 
//   onCancel, 
//   isModal,
//   onCandidatesUploaded
// }) => {
//   const navigate = useNavigate();
//   const { toast } = useToast();
//   const [files, setFiles] = useState<UploadedFile[]>([]);
//   const [dragActive, setDragActive] = useState(false);

//   const uploadMutation = useUploadCandidates();
//   const scoreMutation = useScoreCandidates();

//   // Get role and persona from localStorage
//   const role = localStorage.getItem('jdData');
//   const personaData = localStorage.getItem('savedPersona');
//   const roleName = role ? JSON.parse(role).role : 'N/A';
//   const personaName = personaData ? JSON.parse(personaData).name : 'N/A';
//   const persona_id = personaData ? JSON.parse(personaData).id : null;

//   const isProcessing = uploadMutation.isPending || scoreMutation.isPending;
//   const useMockData = import.meta.env.VITE_USE_MOCK_DATA === 'true';

//   const handleFileUpload = async (uploadedFiles: FileList | null) => {
//     if (!uploadedFiles) return;

//     const filesArray: UploadedFile[] = Array.from(uploadedFiles).map(file => ({
//       id: Math.random().toString(36).substr(2, 9),
//       name: file.name,
//       size: file.size,
//       status: 'processing',
//       file,
//     }));

//     setFiles(prev => [...prev, ...filesArray]);

//     try {
//       const result = await uploadMutation.mutateAsync(Array.from(uploadedFiles));
//       // result: UploadedCandidate[]

//       const updatedFiles = filesArray.map(file => {
//         const candidateData = result.find((r: UploadedCandidate) => r.file_name === file.name);

//         let newStatus: UploadedFile['status'] = 'error';

//         if (candidateData) {
//           if (candidateData.status === 'success') {
//             newStatus = 'ready';
//           } else if (candidateData.status === 'duplicate') {
//             newStatus = 'duplicate';
//           }
//         }

//         return {
//           ...file,
//           status: newStatus,
//           candidateData,
//         };
//       });

//       setFiles(prev => [
//         ...prev.filter(f => !filesArray.some(nf => nf.id === f.id)),
//         ...updatedFiles,
//       ]);

//       // 🔹 Extract ALL successfully uploaded candidate IDs (both new and duplicate)
//       const allCandidateIds = result
//         .filter((r: UploadedCandidate) => 
//           r.status === 'success' || r.status === 'duplicate'
//         )
//         .map((r: UploadedCandidate) => r.candidate_id);

//       // 🔹 Count new vs duplicate
//       const newCount = result.filter((r: UploadedCandidate) => r.status === 'success').length;
//       const duplicateCount = result.filter((r: UploadedCandidate) => r.status === 'duplicate').length;

//       // 🔹 Show appropriate toast message
//       if (allCandidateIds.length > 0) {
//         let toastMessage = '';
        
//         if (newCount > 0 && duplicateCount > 0) {
//           toastMessage = `${newCount} new and ${duplicateCount} existing candidate${duplicateCount > 1 ? 's' : ''} uploaded and selected.`;
//         } else if (newCount > 0) {
//           toastMessage = `${newCount} new candidate${newCount > 1 ? 's' : ''} uploaded and selected.`;
//         } else if (duplicateCount > 0) {
//           toastMessage = `${duplicateCount} existing candidate${duplicateCount > 1 ? 's' : ''} found and selected.`;
//         }

//         toast({
//           title: "Candidates selected",
//           description: toastMessage,
//           duration: 4000,
//         });

//         // 🔹 Notify parent to auto-select ALL uploaded candidates
//         onCandidatesUploaded?.(allCandidateIds);
//       }

//       // 🔹 Notify parent that upload is done
//       onSuccess?.(result);

//     } catch (error) {
//       console.error('Upload Error:', error);
//       setFiles(prev =>
//         prev.map(f =>
//           filesArray.some(nf => nf.id === f.id)
//             ? { ...f, status: 'error' as const }
//             : f,
//         ),
//       );
//     }
//   };

//   const handleDrag = (e: React.DragEvent) => {
//     e.preventDefault();
//     e.stopPropagation();
//     if (e.type === "dragenter" || e.type === "dragover") {
//       setDragActive(true);
//     } else if (e.type === "dragleave") {
//       setDragActive(false);
//     }
//   };

//   const handleDrop = (e: React.DragEvent) => {
//     e.preventDefault();
//     e.stopPropagation();
//     setDragActive(false);
    
//     if (e.dataTransfer.files && e.dataTransfer.files[0]) {
//       handleFileUpload(e.dataTransfer.files);
//     }
//   };

//   const removeFile = (fileId: string) => {
//     setFiles(prev => prev.filter(file => file.id !== fileId));
//   };

//   const formatFileSize = (bytes: number) => {
//     if (bytes === 0) return '0 Bytes';
//     const k = 1024;
//     const sizes = ['Bytes', 'KB', 'MB', 'GB'];
//     const i = Math.floor(Math.log(bytes) / Math.log(k));
//     return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
//   };

//   const getStatusIcon = (status: UploadedFile['status']) => {
//     switch (status) {
//       case 'uploaded':
//         return <FileText className="w-4 h-4 text-muted-foreground" />;
//       case 'processing':
//         return <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />;
//       case 'ready':
//         return <CheckCircle className="w-4 h-4 text-success" />;
//       case 'duplicate':
//         return <CheckCircle className="w-4 h-4 text-success" />;
//       case 'error':
//         return <X className="w-4 h-4 text-danger" />;
//       default:
//         return <FileText className="w-4 h-4 text-muted-foreground" />;
//     }
//   };

//   const completedFiles = files.filter(file => file.status === 'ready' || file.status === 'duplicate').length;
//   const processingProgress = files.length > 0 ? (completedFiles / files.length) * 100 : 0;

//   return (
//     <div className="max-w-7xl min-w-4xl w-full mx-auto space-y-4">
//       {/* Upload Area */}
//       <Card className="shadow-card">
//         <CardHeader className="pb-2">
//           <CardTitle className="flex items-center space-x-2 text-lg">
//             <Upload className="w-4 h-4 text-primary" />
//             <span>CV Upload</span>
//           </CardTitle>
//         </CardHeader>
//         <CardContent>
//           <div
//             className={`border-2 border-dashed rounded-lg p-8 text-center transition-all ${
//               dragActive 
//                 ? 'border-primary bg-primary/5' 
//                 : 'border-border hover:border-primary hover:bg-muted/50'
//             }`}
//             onDragEnter={handleDrag}
//             onDragLeave={handleDrag}
//             onDragOver={handleDrag}
//             onDrop={handleDrop}
//           >
//             <input
//               type="file"
//               id="cv-upload"
//               className="hidden"
//               multiple
//               accept=".pdf,.doc,.docx"
//               onChange={(e) => handleFileUpload(e.target.files)}
//               disabled={isProcessing}
//             />
//             <label htmlFor="cv-upload" className={isProcessing ? 'cursor-not-allowed' : 'cursor-pointer'}>
//               <div className="flex flex-col items-center space-y-3">
//                 <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
//                   <Upload className="w-6 h-6 text-primary" />
//                 </div>
//                 <div className="space-y-1">
//                   <h3 className="text-base font-medium text-foreground">
//                     Drop files here or click to upload
//                   </h3>
//                   <p className="text-xs text-muted-foreground">
//                     Supports PDF, DOC, DOCX files up to 10MB each
//                   </p>
//                 </div>
//               </div>
//             </label>
//           </div>
//         </CardContent>
//       </Card>

//       {/* File List */}
//       {files.length > 0 && (
//         <Card className="shadow-card">
//           <CardHeader>
//             <div className="flex items-center justify-between">
//               <CardTitle className="flex items-center space-x-2">
//                 <Users className="w-5 h-5 text-primary" />
//                 <span>Uploaded CVs ({files.length})</span>
//               </CardTitle>
//               {isProcessing && (
//                 <div className="flex items-center space-x-2">
//                   <span className="text-sm text-muted-foreground">
//                     {uploadMutation.isPending ? 'Uploading...' : 'Evaluating...'}
//                   </span>
//                   <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
//                 </div>
//               )}
//             </div>
//             {uploadMutation.isPending && (
//               <div className="space-y-2">
//                 <Progress value={processingProgress} className="h-2" />
//                 <p className="text-xs text-muted-foreground">
//                   {completedFiles} of {files.length} files processed
//                 </p>
//               </div>
//             )}
//           </CardHeader>
//           <CardContent>
//             <div className="space-y-1">
//               {files.map((file) => (
//                 <div key={file.id} className="flex items-center justify-between px-4 py-2 bg-muted rounded-lg">
//                   <div className="flex items-center space-x-3">
//                     {getStatusIcon(file.status)}
//                     <div>
//                       <p className="font-medium text-foreground truncate">{file.name} - <span className="text-sm text-muted-foreground">{formatFileSize(file.size)}</span></p>
//                     </div>
//                   </div>
//                   <div className="flex items-center space-x-2">
//                     <span
//                       className={`text-xs px-2 py-1 rounded-full ${
//                         file.status === 'ready'
//                           ? 'bg-success/20 text-success'
//                           : file.status === 'processing'
//                           ? 'bg-primary/20 text-primary'
//                           : file.status === 'duplicate'
//                           ? 'bg-success/20 text-success'
//                           : file.status === 'error'
//                           ? 'bg-danger/20 text-danger'
//                           : 'bg-muted-foreground/20 text-muted-foreground'
//                       }`}
//                     >
//                       {file.status === 'uploaded'
//                         ? 'ready'
//                         : file.status === 'processing'
//                         ? 'Processing'
//                         : file.status === 'ready'
//                         ? 'ready'
//                         : file.status === 'duplicate'
//                         ? 'ready'
//                         : 'Error'}
//                     </span>

//                     {!isProcessing && file.status !== 'processing' && (
//                       <Button
//                         variant="ghost"
//                         size="sm"
//                         onClick={() => removeFile(file.id)}
//                         className="h-8 w-8 p-0"
//                       >
//                         <X className="w-4 h-4" />
//                       </Button>
//                     )}
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </CardContent>
//         </Card>
//       )}

//       {/* Action Buttons */}
//       <div className="flex justify-between pt-6">
//         <Button
//           variant="outline"
//           onClick={() => onCancel?.()}
//           disabled={isProcessing}
//         >
//           Cancel
//         </Button>
//       </div>
//     </div>
//   );
// };

// export default CandidateUpload;

// import { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import Layout from "@/components/Layout";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import { Progress } from "@/components/ui/progress";
// import { Upload, FileText, X, CheckCircle, ArrowRight, Users } from "lucide-react";
// import { useToast } from "@/components/ui/use-toast";
// import { useUploadCandidates, useScoreCandidates } from "@/lib/helper";
// import type { UploadedCandidate } from "@/lib/helper";

// interface UploadedFile {
//   id: string;
//   name: string;
//   size: number;
//   status: 'uploaded' | 'processing' | 'ready' |'duplicate'| 'error';
//   file?: File;
//   candidateData?: UploadedCandidate;
// }

// interface CandidateUploadProps {
//   onSuccess?: (uploaded: UploadedCandidate[]) => void;
//   onCancel?: () => void;
//   isModal?:boolean
// }

// const CandidateUpload: React.FC<CandidateUploadProps> = ({onSuccess, onCancel, isModal}) => {
//   const navigate = useNavigate();
//   const { toast } = useToast();
//   const [files, setFiles] = useState<UploadedFile[]>([]);
//   const [dragActive, setDragActive] = useState(false);

//   const uploadMutation = useUploadCandidates();
//   const scoreMutation = useScoreCandidates();

//   // Get role and persona from localStorage
//   const role = localStorage.getItem('jdData');
//   const personaData = localStorage.getItem('savedPersona');
//   const roleName = role ? JSON.parse(role).role : 'N/A';
//   const personaName = personaData ? JSON.parse(personaData).name : 'N/A';
//   const persona_id = personaData ? JSON.parse(personaData).id : null;

//   const isProcessing = uploadMutation.isPending || scoreMutation.isPending;
//   const useMockData = import.meta.env.VITE_USE_MOCK_DATA === 'true';

//   const handleFileUpload = async (uploadedFiles: FileList | null) => {
//     if (!uploadedFiles) return;

//     const filesArray: UploadedFile[] = Array.from(uploadedFiles).map(file => ({
//       id: Math.random().toString(36).substr(2, 9),
//       name: file.name,
//       size: file.size,
//       status: 'processing',
//       file,
//     }));

//     setFiles(prev => [...prev, ...filesArray]);

//     try {
//       const result = await uploadMutation.mutateAsync(Array.from(uploadedFiles));
//       // result: UploadedCandidate[]

//       const updatedFiles = filesArray.map(file => {
//         const candidateData = result.find((r: UploadedCandidate) => r.file_name === file.name);

//         let newStatus: UploadedFile['status'] = 'error';

//         if (candidateData) {
//           if (candidateData.status === 'success') {
//             newStatus = 'ready';       // <- keep this consistent with your union type
//           } else if (candidateData.status === 'duplicate') {
//             newStatus = 'duplicate';
//           }
//         }

//         return {
//           ...file,
//           status: newStatus,
//           candidateData, // store API response
//         };
//       });

//       setFiles(prev => [
//         ...prev.filter(f => !filesArray.some(nf => nf.id === f.id)),
//         ...updatedFiles,
//       ]);

//       // 🔹 Notify parent that upload is done
//       onSuccess?.(result);

//     } catch (error) {
//       console.error('Upload Error:', error);
//       setFiles(prev =>
//         prev.map(f =>
//           filesArray.some(nf => nf.id === f.id)
//             ? { ...f, status: 'error' as const }
//             : f,
//         ),
//       );
//     }
//   };

//   const handleDrag = (e: React.DragEvent) => {
//     e.preventDefault();
//     e.stopPropagation();
//     if (e.type === "dragenter" || e.type === "dragover") {
//       setDragActive(true);
//     } else if (e.type === "dragleave") {
//       setDragActive(false);
//     }
//   };

//   const handleDrop = (e: React.DragEvent) => {
//     e.preventDefault();
//     e.stopPropagation();
//     setDragActive(false);
    
//     if (e.dataTransfer.files && e.dataTransfer.files[0]) {
//       handleFileUpload(e.dataTransfer.files);
//     }
//   };

//   const removeFile = (fileId: string) => {
//     setFiles(prev => prev.filter(file => file.id !== fileId));
//   };

//   const formatFileSize = (bytes: number) => {
//     if (bytes === 0) return '0 Bytes';
//     const k = 1024;
//     const sizes = ['Bytes', 'KB', 'MB', 'GB'];
//     const i = Math.floor(Math.log(bytes) / Math.log(k));
//     return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
//   };


// //   const handleEvaluate = async () => {
// //   if (!persona_id) {
// //     toast({
// //       title: "Evaluation failed",
// //       description: "Missing persona information.",
// //       variant: "destructive",
// //     });
// //     return;
// //   }

// //   const candidates = files
// //     .filter(f => f.candidateData && (f.status === 'ready' || f.status === 'duplicate'))
// //     .map(f => f.candidateData!);

// //   if (candidates.length === 0) {
// //     toast({
// //       title: "No candidates to evaluate",
// //       description: "Please upload candidate CVs before proceeding.",
// //       variant: "destructive",
// //     });
// //     return;
// //   }

// //   try {
// //     await scoreMutation.mutateAsync({ candidates, persona_id });
// //   } catch (error) {
// //     console.error('Evaluation error:', error);
// //   }
// // };

//   const getStatusIcon = (status: UploadedFile['status']) => {
//     switch (status) {
//       case 'uploaded':
//         return <FileText className="w-4 h-4 text-muted-foreground" />;
//       case 'processing':
//         return <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />;
//       case 'ready':
//         return <CheckCircle className="w-4 h-4 text-success" />;
//       case 'duplicate':
//         return <CheckCircle className="w-4 h-4 text-success" />;
//       case 'error':
//         return <X className="w-4 h-4 text-danger" />;
//       default:
//         return <FileText className="w-4 h-4 text-muted-foreground" />;
//     }
//   };

//   const completedFiles = files.filter(file => file.status === 'ready' || file.status === 'duplicate').length;
//   const processingProgress = files.length > 0 ? (completedFiles / files.length) * 100 : 0;

//   return (
//     // <Layout currentStep={isModal ? undefined :3} isModal={isModal}>
//       <div className="max-w-7xl min-w-4xl w-full mx-auto space-y-4">
//         {/* Upload Area */}
//         <Card className="shadow-card">
//           <CardHeader className="pb-2">
//             <CardTitle className="flex items-center space-x-2 text-lg">
//               <Upload className="w-4 h-4 text-primary" />
//               <span>CV Upload</span>
//             </CardTitle>
//           </CardHeader>
//           <CardContent>
//             <div
//               className={`border-2 border-dashed rounded-lg p-8 text-center transition-all ${
//                 dragActive 
//                   ? 'border-primary bg-primary/5' 
//                   : 'border-border hover:border-primary hover:bg-muted/50'
//               }`}
//               onDragEnter={handleDrag}
//               onDragLeave={handleDrag}
//               onDragOver={handleDrag}
//               onDrop={handleDrop}
//             >
//               <input
//                 type="file"
//                 id="cv-upload"
//                 className="hidden"
//                 multiple
//                 accept=".pdf,.doc,.docx"
//                 onChange={(e) => handleFileUpload(e.target.files)}
//                 disabled={isProcessing}
//               />
//               <label htmlFor="cv-upload" className={isProcessing ? 'cursor-not-allowed' : 'cursor-pointer'}>
//                 <div className="flex flex-col items-center space-y-3">
//                   <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
//                     <Upload className="w-6 h-6 text-primary" />
//                   </div>
//                   <div className="space-y-1">
//                     <h3 className="text-base font-medium text-foreground">
//                       Drop files here or click to upload
//                     </h3>
//                     <p className="text-xs text-muted-foreground">
//                       Supports PDF, DOC, DOCX files up to 10MB each
//                     </p>
//                   </div>
//                 </div>
//               </label>
//             </div>
//           </CardContent>
//         </Card>

//         {/* File List */}
//         {files.length > 0 && (
//           <Card className="shadow-card">
//             <CardHeader>
//               <div className="flex items-center justify-between">
//                 <CardTitle className="flex items-center space-x-2">
//                   <Users className="w-5 h-5 text-primary" />
//                   <span>Uploaded CVs ({files.length})</span>
//                 </CardTitle>
//                 {isProcessing && (
//                   <div className="flex items-center space-x-2">
//                     <span className="text-sm text-muted-foreground">
//                       {uploadMutation.isPending ? 'Uploading...' : 'Evaluating...'}
//                     </span>
//                     <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
//                   </div>
//                 )}
//               </div>
//               {uploadMutation.isPending && (
//                 <div className="space-y-2">
//                   <Progress value={processingProgress} className="h-2" />
//                   <p className="text-xs text-muted-foreground">
//                     {completedFiles} of {files.length} files processed
//                   </p>
//                 </div>
//               )}
//             </CardHeader>
//             <CardContent>
//               <div className="space-y-1">
//                 {files.map((file) => (
//                   <div key={file.id} className="flex items-center justify-between px-4 py-2 bg-muted rounded-lg">
//                     <div className="flex items-center space-x-3">
//                       {getStatusIcon(file.status)}
//                       <div>
//                         <p className="font-medium text-foreground truncate">{file.name} - <span className="text-sm text-muted-foreground">{formatFileSize(file.size)}</span></p>
//                         {/* <p className="text-sm text-muted-foreground">{formatFileSize(file.size)}</p> */}
//                       </div>
//                     </div>
//                     <div className="flex items-center space-x-2">
//                       <span
//                         className={`text-xs px-2 py-1 rounded-full ${
//                           file.status === 'ready'
//                             ? 'bg-success/20 text-success'
//                             : file.status === 'processing'
//                             ? 'bg-primary/20 text-primary'
//                             : file.status === 'duplicate'
//                             ? 'bg-success/20 text-success'
//                             : file.status === 'error'
//                             ? 'bg-danger/20 text-danger'
//                             : 'bg-muted-foreground/20 text-muted-foreground'
//                         }`}
//                       >
//                         {file.status === 'uploaded'
//                           ? 'ready'
//                           : file.status === 'processing'
//                           ? 'Processing'
//                           : file.status === 'ready'
//                           ? 'ready'
//                           : file.status === 'duplicate'
//                           ? 'ready'
//                           : 'Error'}
//                       </span>

//                       {!isProcessing && file.status !== 'processing' && (
//                         <Button
//                           variant="ghost"
//                           size="sm"
//                           onClick={() => removeFile(file.id)}
//                           className="h-8 w-8 p-0"
//                         >
//                           <X className="w-4 h-4" />
//                         </Button>
//                       )}
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </CardContent>
//           </Card>
//         )}

//         {/* Action Buttons */}
//         <div className="flex justify-between pt-6">
//           <Button
//             variant="outline"
//             onClick={() => onCancel()}
//             disabled={isProcessing}
//           >
//             Cancel
//           </Button>
          
//           {/* <Button
//             onClick={handleEvaluate}
//             disabled={files.length === 0 || isProcessing || completedFiles === 0}
//             className="bg-gradient-primary hover:opacity-90 transition-smooth flex items-center space-x-2"
//           >
//             <span>Continue</span>
//             {!isProcessing && <ArrowRight className="w-4 h-4" />}
//           </Button> */}
//         </div>
//       </div>
//     // </Layout>
//   );
// };

// export default CandidateUpload;