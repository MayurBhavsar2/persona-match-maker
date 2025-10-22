import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import {
  X,
  Loader2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface CandidateDetailsSidebarProps {
  candidate: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  useMockData?: boolean;
}

const CandidateDetailsSidebar = ({ 
  candidate, 
  open, 
  onOpenChange,
  useMockData = false 
}: CandidateDetailsSidebarProps) => {
  const [expandedScoreIndex, setExpandedScoreIndex] = useState<number | null>(null);

  // Fetch candidate scores with React Query
  const {
    data: scoresData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["candidateScores", candidate?.candidate_id],
    queryFn: async () => {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/v1/candidate/${candidate.candidate_id}/scores`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch candidate scores");
      }

      return response.json();
    },
    enabled: open && !useMockData && !!candidate?.candidate_id,
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes (formerly cacheTime)
  });

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 80) return "text-orange-500";
    return "text-red-600";
  };

  const toggleScoreDetails = (index: number) => {
    setExpandedScoreIndex(expandedScoreIndex === index ? null : index);
  };

  // Use mock data or API data
  const scores = useMockData
    ? [
        {
          id: "mock-1",
          role_name: candidate?.selectedRole || "Senior QA Engineer",
          persona_name: candidate?.selectedPersona || "Default Persona",
          final_score: candidate?.overallScore || 0,
          scored_at: candidate?.applicationDate || new Date().toISOString(),
          categories: candidate?.detailedEvaluation?.categories || [],
        },
      ]
    : scoresData?.scores || [];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[calc(100vw-220px)] max-w-full overflow-y-auto p-0">
        {candidate && (
          <div className="flex flex-col h-full">
            {/* Candidate Header Info - Sticky */}
            <div className="sticky top-0 z-20 border-b bg-background p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                    <span className="text-lg font-semibold text-muted-foreground">
                      {candidate?.score?.candidate_name
                        ?.split(" ")
                        ?.map((n) => n[0])
                        .join("") ||
                        candidate?.candidate_id
                          ?.split(" ")
                          ?.map((n) => n[0])
                          .join("")}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-base">
                    <span className="font-semibold text-foreground">
                      {candidate.score?.candidate_name ?? candidate.candidate_id}
                    </span>
                    <span className="text-muted-foreground">|</span>
                    <span className="text-muted-foreground">candidate@example.com</span>
                    <span className="text-muted-foreground">|</span>
                    <span className="text-muted-foreground">+91-9876543210</span>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Loading State */}
            {isLoading && !useMockData && (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center space-y-4">
                  <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
                  <p className="text-muted-foreground">Loading candidate details...</p>
                </div>
              </div>
            )}

            {/* Error State */}
            {isError && !useMockData && (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center space-y-4 max-w-md p-6">
                  <AlertCircle className="w-12 h-12 text-destructive mx-auto" />
                  <h3 className="text-lg font-semibold">Oops! Something went wrong</h3>
                  <p className="text-sm text-muted-foreground">
                    We couldn't load the candidate details. Please try again.
                  </p>
                  <Button onClick={() => refetch()} variant="outline">
                    Try Again
                  </Button>
                  {error && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Error: {error instanceof Error ? error.message : "Unknown error"}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Content */}
            {((useMockData || (!isLoading && !isError)) && scores.length > 0) && (
              <Tabs defaultValue="summary" className="flex-1 flex flex-col">
                <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0 h-auto sticky top-[76px] z-10 bg-background">
                  <TabsTrigger
                    value="summary"
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3"
                  >
                    Summary
                  </TabsTrigger>
                  <TabsTrigger
                    value="documents"
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3"
                  >
                    Documents
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="summary" className="flex-1 p-6 mt-0 overflow-y-auto">
                  <div className="space-y-4">
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="py-2 px-3">Role</TableHead>
                            <TableHead className="py-2 px-3">Persona</TableHead>
                            <TableHead className="text-center py-2 px-3">Overall Score</TableHead>
                            <TableHead className="text-center py-2 px-3">Date</TableHead>
                            <TableHead className="w-12 py-2 px-3"></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {scores.map((score, index) => (
                            <>
                              <TableRow key={score.id} className="cursor-pointer hover:bg-muted/50">
                                <TableCell className="font-medium py-2 px-3">
                                  {score.role_name}
                                </TableCell>
                                <TableCell className="py-2 px-3">{score.persona_name}</TableCell>
                                <TableCell className="text-center py-2 px-3">
                                  <Button
                                    variant="link"
                                    className={`font-bold text-lg p-0 h-auto ${getScoreColor(
                                      score.final_score
                                    )}`}
                                    onClick={() => {
                                        if(score.final_score < 90) toggleScoreDetails(index)
                                    }}
                                  >
                                    {score.final_score}%
                                  </Button>
                                </TableCell>
                                <TableCell className="text-center py-2 px-3">
                                  {new Date(score.scored_at).toLocaleDateString()}
                                </TableCell>
                                <TableCell className="py-2 px-3">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className={`h-8 w-8 p-0 ${score.final_score < 90 ? "hidden" : "block"}`}
                                    onClick={() => toggleScoreDetails(index)}
                                  >
                                    {expandedScoreIndex === index ? (
                                      <ChevronUp className="h-4 w-4" />
                                    ) : (
                                      <ChevronDown className="h-4 w-4" />
                                    )}
                                  </Button>
                                </TableCell>
                              </TableRow>

                              {/* Expanded Attribution Evaluation */}
                              {expandedScoreIndex === index && score.categories?.length > 0 && (
                                <TableRow>
                                  <TableCell colSpan={5} className="p-0">
                                    <div className="bg-muted/30 p-6 space-y-4">
                                      <h4 className="font-semibold text-lg mb-4">
                                        Attribution Evaluation
                                      </h4>
                                      <div className="rounded-md border">
                                        <Table>
                                          <TableHeader>
                                            <TableRow>
                                              <TableHead className="py-2 px-3">Skills</TableHead>
                                              <TableHead className="text-center py-2 px-3">Weightage</TableHead>
                                              <TableHead className="text-center py-2 px-3">Score</TableHead>
                                              <TableHead className="w-12 py-2 px-3"></TableHead>
                                            </TableRow>
                                          </TableHeader>
                                          <TableBody>
                                            <Accordion type="multiple" className="w-full" asChild>
                                              <>
                                                {score.categories.map((category, catIndex) => (
                                                  <AccordionItem
                                                    key={catIndex}
                                                    value={`category-${catIndex}`}
                                                    className="border-0"
                                                    asChild
                                                  >
                                                    <>
                                                      <TableRow className="cursor-pointer hover:bg-muted/50">
                                                        <AccordionTrigger className="py-2 px-3 hover:no-underline w-full [&[data-state=open]>svg]:rotate-180">
                                                          <TableCell className="font-medium py-2 px-3 border-0">
                                                            {category.category_name}
                                                          </TableCell>
                                                        </AccordionTrigger>
                                                        <TableCell className="text-center py-2 px-3">
                                                          {category.weight_percentage}%
                                                        </TableCell>
                                                        <TableCell className="text-center py-2 px-3">
                                                          <span
                                                            className={`font-semibold ${getScoreColor(
                                                              category.category_contribution
                                                            )}`}
                                                          >
                                                            {category.category_contribution.toFixed(2)}%
                                                          </span>
                                                        </TableCell>
                                                        {/* <TableCell className="py-2 px-3">
                                                          <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
                                                        </TableCell> */}
                                                      </TableRow>
                                                      <TableRow>
                                                        <TableCell colSpan={4} className="p-0 border-0">
                                                          <AccordionContent className="pb-0">
                                                            <div className="px-3 pb-3">
                                                              <Table>
                                                                <TableHeader>
                                                                  <TableRow>
                                                                    <TableHead className="py-1 px-2">
                                                                      Sub-Attribute
                                                                    </TableHead>
                                                                    <TableHead className="py-1 px-2">
                                                                      Weight (%)
                                                                    </TableHead>
                                                                    <TableHead className="py-1 px-2">
                                                                      Expected
                                                                    </TableHead>
                                                                    <TableHead className="py-1 px-2">
                                                                      Actual
                                                                    </TableHead>
                                                                    <TableHead className="py-1 px-2">
                                                                      Scored
                                                                    </TableHead>
                                                                    <TableHead className="py-1 px-2">
                                                                      Score
                                                                    </TableHead>
                                                                    <TableHead className="py-1 px-2">
                                                                      Notes
                                                                    </TableHead>
                                                                  </TableRow>
                                                                </TableHeader>
                                                                <TableBody>
                                                                  {category.subcategories?.map(
                                                                    (subAttr, subIndex) => {
                                                                      const subScore = subAttr.scored_percentage;
                                                                      const subAttributeScore = (
                                                                        (subScore * subAttr.weight_percentage) /
                                                                        100
                                                                      ).toFixed(2);
                                                                      return (
                                                                        <TableRow key={subIndex}>
                                                                          <TableCell className="font-medium text-sm py-1 px-2">
                                                                            {subAttr.subcategory_name}
                                                                          </TableCell>
                                                                          <TableCell className="py-1 px-2">
                                                                            {subAttr.weight_percentage}%
                                                                          </TableCell>
                                                                          <TableCell className="py-1 px-2">
                                                                            {subAttr.expected_level}
                                                                          </TableCell>
                                                                          <TableCell className="py-1 px-2">
                                                                            {subAttr.actual_level}
                                                                          </TableCell>
                                                                          <TableCell
                                                                            className={`${getScoreColor(
                                                                              subScore
                                                                            )} py-1 px-2`}
                                                                          >
                                                                            {subScore.toFixed(1)}%
                                                                          </TableCell>
                                                                          <TableCell className="py-1 px-2">
                                                                            {subAttributeScore}%
                                                                          </TableCell>
                                                                          <TableCell className="text-xs text-muted-foreground max-w-xs py-1 px-2">
                                                                            {subAttr.notes}
                                                                          </TableCell>
                                                                        </TableRow>
                                                                      );
                                                                    }
                                                                  )}
                                                                </TableBody>
                                                              </Table>
                                                            </div>
                                                          </AccordionContent>
                                                        </TableCell>
                                                      </TableRow>
                                                    </>
                                                  </AccordionItem>
                                                ))}
                                              </>
                                            </Accordion>
                                          </TableBody>
                                        </Table>
                                      </div>

                                      {/* Final Score Summary */}
                                      <div className="mt-6 p-4 rounded-lg border-2 bg-background">
                                        <div className="flex items-center justify-between">
                                          <span className="font-semibold text-lg">
                                            Final Overall Score
                                          </span>
                                          <div className="flex items-center gap-3">
                                            <Badge variant="outline">Weight: 100%</Badge>
                                            <Badge
                                              variant="outline"
                                              className="text-lg px-4 py-1"
                                            >
                                              <span className={getScoreColor(score.final_score)}>
                                                {score.final_score}%
                                              </span>
                                            </Badge>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              )}
                            </>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="documents" className="flex-1 p-6 mt-0 overflow-y-auto">
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">No documents uploaded yet</p>
                  </div>
                </TabsContent>
              </Tabs>
            )}

            {/* No Scores State */}
            {!isLoading && !isError && scores.length === 0 && (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center space-y-2">
                  <p className="text-muted-foreground">No scores available for this candidate</p>
                </div>
              </div>
            )}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default CandidateDetailsSidebar;

// import { useState } from "react";
// import { useQuery } from "@tanstack/react-query";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { Sheet, SheetContent } from "@/components/ui/sheet";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
// import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
// import {
//   X,
//   Loader2,
//   AlertCircle,
//   ChevronDown,
//   ChevronUp,
// } from "lucide-react";

// interface CandidateDetailsSidebarProps {
//   candidate: any;
//   open: boolean;
//   onOpenChange: (open: boolean) => void;
//   useMockData?: boolean;
// }

// const CandidateDetailsSidebar = ({ 
//   candidate, 
//   open, 
//   onOpenChange,
//   useMockData = false 
// }: CandidateDetailsSidebarProps) => {
//   const [expandedScoreIndex, setExpandedScoreIndex] = useState<number | null>(null);

//   // Fetch candidate scores with React Query
//   const {
//     data: scoresData,
//     isLoading,
//     isError,
//     error,
//     refetch,
//   } = useQuery({
//     queryKey: ["candidateScores", candidate?.candidate_id],
//     queryFn: async () => {
//       const response = await fetch(
//         `${import.meta.env.VITE_API_URL}/api/v1/candidate/${candidate.candidate_id}/scores`,
//         {
//           method: "GET",
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${localStorage.getItem("token")}`,
//           },
//         }
//       );

//       if (!response.ok) {
//         throw new Error("Failed to fetch candidate scores");
//       }

//       return response.json();
//     },
//     enabled: open && !useMockData && !!candidate?.candidate_id,
//     staleTime: 30 * 60 * 1000, // 30 minutes
//     gcTime: 30 * 60 * 1000, // 30 minutes (formerly cacheTime)
//   });

//   const getScoreColor = (score: number) => {
//     if (score >= 90) return "text-green-600";
//     if (score >= 80) return "text-orange-500";
//     return "text-red-600";
//   };

//   const toggleScoreDetails = (index: number) => {
//     setExpandedScoreIndex(expandedScoreIndex === index ? null : index);
//   };

//   // Use mock data or API data
//   const scores = useMockData
//     ? [
//         {
//           id: "mock-1",
//           role_name: candidate?.selectedRole || "Senior QA Engineer",
//           persona_name: candidate?.selectedPersona || "Default Persona",
//           final_score: candidate?.overallScore || 0,
//           scored_at: candidate?.applicationDate || new Date().toISOString(),
//           categories: candidate?.detailedEvaluation?.categories || [],
//         },
//       ]
//     : scoresData?.scores || [];

//   return (
//     <Sheet open={open} onOpenChange={onOpenChange}>
//       <SheetContent side="right" className="w-[calc(100vw-220px)] max-w-full overflow-y-auto p-0">
//         {candidate && (
//           <div className="flex flex-col h-full">
//             {/* Candidate Header Info - Sticky */}
//             <div className="sticky top-0 z-20 border-b bg-background p-4 shadow-sm">
//               <div className="flex items-center justify-between">
//                 <div className="flex items-center gap-4">
//                   <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center overflow-hidden">
//                     <span className="text-lg font-semibold text-muted-foreground">
//                       {candidate?.candidate_name
//                         ?.split(" ")
//                         ?.map((n) => n[0])
//                         .join("") ||
//                         candidate?.candidate_id
//                           ?.split(" ")
//                           ?.map((n) => n[0])
//                           .join("")}
//                     </span>
//                   </div>
//                   <div className="flex items-center gap-2 text-base">
//                     <span className="font-semibold text-foreground">
//                       {candidate.candidate_name ?? candidate.candidate_id}
//                     </span>
//                     <span className="text-muted-foreground">|</span>
//                     <span className="text-muted-foreground">candidate@example.com</span>
//                     <span className="text-muted-foreground">|</span>
//                     <span className="text-muted-foreground">+91-9876543210</span>
//                   </div>
//                 </div>
//                 <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
//                   <X className="h-5 w-5" />
//                 </Button>
//               </div>
//             </div>

//             {/* Loading State */}
//             {isLoading && !useMockData && (
//               <div className="flex-1 flex items-center justify-center">
//                 <div className="text-center space-y-4">
//                   <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
//                   <p className="text-muted-foreground">Loading candidate details...</p>
//                 </div>
//               </div>
//             )}

//             {/* Error State */}
//             {isError && !useMockData && (
//               <div className="flex-1 flex items-center justify-center">
//                 <div className="text-center space-y-4 max-w-md p-6">
//                   <AlertCircle className="w-12 h-12 text-destructive mx-auto" />
//                   <h3 className="text-lg font-semibold">Oops! Something went wrong</h3>
//                   <p className="text-sm text-muted-foreground">
//                     We couldn't load the candidate details. Please try again.
//                   </p>
//                   <Button onClick={() => refetch()} variant="outline">
//                     Try Again
//                   </Button>
//                   {error && (
//                     <p className="text-xs text-muted-foreground mt-2">
//                       Error: {error instanceof Error ? error.message : "Unknown error"}
//                     </p>
//                   )}
//                 </div>
//               </div>
//             )}

//             {/* Content */}
//             {((useMockData || (!isLoading && !isError)) && scores.length > 0) && (
//               <Tabs defaultValue="summary" className="flex-1 flex flex-col">
//                 <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0 h-auto sticky top-[76px] z-10 bg-background">
//                   <TabsTrigger
//                     value="summary"
//                     className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3"
//                   >
//                     Summary
//                   </TabsTrigger>
//                   <TabsTrigger
//                     value="documents"
//                     className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3"
//                   >
//                     Documents
//                   </TabsTrigger>
//                 </TabsList>

//                 <TabsContent value="summary" className="flex-1 p-6 mt-0 overflow-y-auto">
//                   <div className="space-y-4">
//                     <div className="rounded-md border">
//                       <Table>
//                         <TableHeader>
//                           <TableRow>
//                             <TableHead className="py-2 px-3">Role</TableHead>
//                             <TableHead className="py-2 px-3">Persona</TableHead>
//                             <TableHead className="text-center py-2 px-3">Overall Score</TableHead>
//                             <TableHead className="text-center py-2 px-3">Date</TableHead>
//                             <TableHead className="w-12 py-2 px-3"></TableHead>
//                           </TableRow>
//                         </TableHeader>
//                         <TableBody>
//                           {scores.map((score, index) => (
//                             <>
//                               <TableRow key={score.id} className="cursor-pointer hover:bg-muted/50">
//                                 <TableCell className="font-medium py-2 px-3">
//                                   {score.role_name}
//                                 </TableCell>
//                                 <TableCell className="py-2 px-3">{score.persona_name}</TableCell>
//                                 <TableCell className="text-center py-2 px-3">
//                                   <Button
//                                     variant="link"
//                                     className={`font-bold text-lg p-0 h-auto ${getScoreColor(
//                                       score.final_score
//                                     )}`}
//                                     onClick={() => {
//                                         if(score.final_score < 90) toggleScoreDetails(index)
//                                     }}
//                                   >
//                                     {score.final_score}%
//                                   </Button>
//                                 </TableCell>
//                                 <TableCell className="text-center py-2 px-3">
//                                   {new Date(score.scored_at).toLocaleDateString()}
//                                 </TableCell>
//                                 <TableCell className="py-2 px-3">
//                                   <Button
//                                     variant="ghost"
//                                     size="sm"
//                                     className={`h-8 w-8 p-0 ${score.final_score < 90 ? "hidden" : "block"}`}
//                                     onClick={() => toggleScoreDetails(index)}
//                                   >
//                                     {expandedScoreIndex === index ? (
//                                       <ChevronUp className="h-4 w-4" />
//                                     ) : (
//                                       <ChevronDown className="h-4 w-4" />
//                                     )}
//                                   </Button>
//                                 </TableCell>
//                               </TableRow>

//                               {/* Expanded Attribution Evaluation */}
//                               {expandedScoreIndex === index && score.categories?.length > 0 && (
//                                 <TableRow>
//                                   <TableCell colSpan={5} className="p-0">
//                                     <div className="bg-muted/30 p-6 space-y-4">
//                                       <h4 className="font-semibold text-lg mb-4">
//                                         Attribution Evaluation
//                                       </h4>
//                                       <Accordion type="multiple" className="w-full space-y-3">
//                                         {score.categories.map((category, catIndex) => (
//                                           <AccordionItem
//                                             key={catIndex}
//                                             value={`category-${catIndex}`}
//                                             className="border rounded-lg px-4 bg-background"
//                                           >
//                                             <AccordionTrigger className="hover:no-underline">
//                                               <div className="flex items-center justify-between w-full mr-4">
//                                                 <span className="font-semibold text-left">
//                                                   {category.category_name}
//                                                 </span>
//                                                 <div className="flex items-center gap-3">
//                                                   <Badge variant="outline">
//                                                     Weight: {category.weight_percentage}%
//                                                   </Badge>
//                                                   <Badge
//                                                     variant="outline"
//                                                     className="bg-transparent"
//                                                   >
//                                                     <span
//                                                       className={getScoreColor(
//                                                         category.category_score_percentage
//                                                       )}
//                                                     >
//                                                       {category.category_score_percentage.toFixed(1)}%
//                                                     </span>
//                                                   </Badge>
//                                                   <Badge
//                                                     variant="outline"
//                                                     className="bg-transparent"
//                                                   >
//                                                     <span
//                                                       className={getScoreColor(
//                                                         category.category_contribution
//                                                       )}
//                                                     >
//                                                       Score: {category.category_contribution.toFixed(2)}%
//                                                     </span>
//                                                   </Badge>
//                                                 </div>
//                                               </div>
//                                             </AccordionTrigger>
//                                             <AccordionContent>
//                                               <div className="pt-4">
//                                                 <Table>
//                                                   <TableHeader>
//                                                     <TableRow>
//                                                       <TableHead className="py-1 px-2">
//                                                         Sub-Attribute
//                                                       </TableHead>
//                                                       <TableHead className="py-1 px-2">
//                                                         Weight (%)
//                                                       </TableHead>
//                                                       <TableHead className="py-1 px-2">
//                                                         Expected
//                                                       </TableHead>
//                                                       <TableHead className="py-1 px-2">
//                                                         Actual
//                                                       </TableHead>
//                                                       <TableHead className="py-1 px-2">
//                                                         Scored
//                                                       </TableHead>
//                                                       <TableHead className="py-1 px-2">
//                                                         Score
//                                                       </TableHead>
//                                                       <TableHead className="py-1 px-2">
//                                                         Notes
//                                                       </TableHead>
//                                                     </TableRow>
//                                                   </TableHeader>
//                                                   <TableBody>
//                                                     {category.subcategories?.map(
//                                                       (subAttr, subIndex) => {
//                                                         const subScore = subAttr.scored_percentage;
//                                                         const subAttributeScore = (
//                                                           (subScore * subAttr.weight_percentage) /
//                                                           100
//                                                         ).toFixed(2);
//                                                         return (
//                                                           <TableRow key={subIndex}>
//                                                             <TableCell className="font-medium text-sm py-1 px-2">
//                                                               {subAttr.subcategory_name}
//                                                             </TableCell>
//                                                             <TableCell className="py-1 px-2">
//                                                               {subAttr.weight_percentage}%
//                                                             </TableCell>
//                                                             <TableCell className="py-1 px-2">
//                                                               {subAttr.expected_level}
//                                                             </TableCell>
//                                                             <TableCell className="py-1 px-2">
//                                                               {subAttr.actual_level}
//                                                             </TableCell>
//                                                             <TableCell
//                                                               className={`${getScoreColor(
//                                                                 subScore
//                                                               )} py-1 px-2`}
//                                                             >
//                                                               {subScore.toFixed(1)}%
//                                                             </TableCell>
//                                                             <TableCell className="py-1 px-2">
//                                                               {subAttributeScore}%
//                                                             </TableCell>
//                                                             <TableCell className="text-xs text-muted-foreground max-w-xs py-1 px-2">
//                                                               {subAttr.notes}
//                                                             </TableCell>
//                                                           </TableRow>
//                                                         );
//                                                       }
//                                                     )}
//                                                   </TableBody>
//                                                 </Table>
//                                               </div>
//                                             </AccordionContent>
//                                           </AccordionItem>
//                                         ))}
//                                       </Accordion>

//                                       {/* Final Score Summary */}
//                                       <div className="mt-6 p-4 rounded-lg border-2 bg-background">
//                                         <div className="flex items-center justify-between">
//                                           <span className="font-semibold text-lg">
//                                             Final Overall Score
//                                           </span>
//                                           <div className="flex items-center gap-3">
//                                             <Badge variant="outline">Weight: 100%</Badge>
//                                             <Badge
//                                               variant="outline"
//                                               className="text-lg px-4 py-1"
//                                             >
//                                               <span className={getScoreColor(score.final_score)}>
//                                                 {score.final_score}%
//                                               </span>
//                                             </Badge>
//                                           </div>
//                                         </div>
//                                       </div>
//                                     </div>
//                                   </TableCell>
//                                 </TableRow>
//                               )}
//                             </>
//                           ))}
//                         </TableBody>
//                       </Table>
//                     </div>
//                   </div>
//                 </TabsContent>

//                 <TabsContent value="documents" className="flex-1 p-6 mt-0 overflow-y-auto">
//                   <div className="text-center py-12">
//                     <p className="text-muted-foreground">No documents uploaded yet</p>
//                   </div>
//                 </TabsContent>
//               </Tabs>
//             )}

//             {/* No Scores State */}
//             {!isLoading && !isError && scores.length === 0 && (
//               <div className="flex-1 flex items-center justify-center">
//                 <div className="text-center space-y-2">
//                   <p className="text-muted-foreground">No scores available for this candidate</p>
//                 </div>
//               </div>
//             )}
//           </div>
//         )}
//       </SheetContent>
//     </Sheet>
//   );
// };

// export default CandidateDetailsSidebar;
