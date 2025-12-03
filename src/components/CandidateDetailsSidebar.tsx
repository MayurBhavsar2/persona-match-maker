import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Info } from "lucide-react";
import { evaluationData } from "@/SampleResultEvaluationResponse";


import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { X, Loader2, AlertCircle, ChevronDown, ChevronUp } from "lucide-react";

interface CandidateDetailsSidebarProps {
  candidate: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CandidateDetailsSidebar = ({
  candidate,
  open,
  onOpenChange,
}: CandidateDetailsSidebarProps) => {
  const useMockData = import.meta.env.VITE_USE_MOCK_DATA === 'true';
  const [expandedScoreIndex, setExpandedScoreIndex] = useState<number | null>(
    null
  );

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
        `${import.meta.env.VITE_API_URL}/api/v1/candidate/${
          candidate.candidate_id
        }/scores`,
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
    ? evaluationData?.scores
    : scoresData?.scores || [];

    console.log("candidate details of the candidate: ", candidate)

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-[calc(100vw-220px)] max-w-full overflow-y-auto p-0"
      >
        {candidate && (
          <div className="flex flex-col h-full">
            {/* Candidate Header Info - Sticky */}
            <div className="sticky top-0 z-20 border-b bg-background p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                    <span className="text-lg font-semibold text-muted-foreground">
                      {candidate?.candidate_name
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
                      {candidate.candidate_name ??
                        candidate.candidate_id}
                    </span>
                    <span className="text-muted-foreground">|</span>
                    <span className="text-muted-foreground">
                      candidate@example.com
                    </span>
                    <span className="text-muted-foreground">|</span>
                    <span className="text-muted-foreground">
                      +91-9876543210
                    </span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onOpenChange(false)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Loading State */}
            {isLoading && !useMockData && (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center space-y-4">
                  <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
                  <p className="text-muted-foreground">
                    Loading candidate details...
                  </p>
                </div>
              </div>
            )}

            {/* Error State */}
            {isError && !useMockData && (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center space-y-4 max-w-md p-6">
                  <AlertCircle className="w-12 h-12 text-destructive mx-auto" />
                  <h3 className="text-lg font-semibold">
                    Oops! Something went wrong
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    We couldn't load the candidate details. Please try again.
                  </p>
                  <Button onClick={() => refetch()} variant="outline">
                    Try Again
                  </Button>
                  {error && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Error:{" "}
                      {error instanceof Error ? error.message : "Unknown error"}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Content */}
            {(useMockData || (!isLoading && !isError)) && scores.length > 0 && (
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

                <TabsContent
                  value="summary"
                  className="flex-1 p-6 mt-0 overflow-y-auto"
                >
                  <div className="space-y-4">
                    <div className="rounded-md border overflow-y-auto relative">
                      <Table className="relative">
                        <TableHeader>
                          <TableRow>
                            <TableHead className="py-2 px-3">Role</TableHead>
                            <TableHead className="py-2 px-3">Persona</TableHead>
                            <TableHead className="text-center py-2 px-3">
                              Overall Score
                            </TableHead>
                            <TableHead className="text-center py-2 px-3">
                              Date
                            </TableHead>
                            <TableHead className="text-center py-2 px-3">
                             Evaluation Status
                            </TableHead>
                            <TableHead className="text-center py-2 px-3">
                             Interview Status
                            </TableHead>
                            
                            {/* <TableHead className="w-12 py-2 px-3"></TableHead> */}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {scores.map((score, index) => (
                            <>
                              <TableRow
                                key={score.id}
                                className={`cursor-pointer transition-all ${index % 2 !== 0 ? 'bg-gray-300 hover:!bg-gray-300' : 'bg-white '}`}
                              >
                                {/* h-auto sticky top-[76px] z-20 */}
      <TableCell className="font-medium py-2 px-3">
        {score.role_name}
      </TableCell>
      <TableCell className="py-2 px-3">
        {score.persona_name}
      </TableCell>
      <TableCell className="text-center py-2 px-3">
        <Button
          variant="link"
          className={`font-bold text-lg p-0 h-auto ${getScoreColor(
            parseFloat(score.final_score)
          )}`}
          onClick={() => {
            toggleScoreDetails(index);
          }}
        >
          {score.final_score}%
        </Button>
      </TableCell>
      <TableCell className="text-center py-2 px-3">
        {new Date(score.scored_at).toLocaleString('en-US', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false
}).replace(',', ' -')}
      </TableCell>
      <TableCell className="text-center py-2 px-3 capitalize">
        {score.final_decision?.replace("_", " ")?.toLowerCase()}
      </TableCell>
      <TableCell className="text-center py-2 px-3 capitalize">
        {score.current_status?.replace("_", " ") ?? "Evaluated"}
      </TableCell>
      
      {/* <TableCell className="py-2 px-3 text-right">
        <Button
          variant="ghost"
          size="sm"
          className={`h-8 w-8 p-0 ${
            score.final_score < 90 ? "hidden" : "block"
          }`}
          onClick={() => toggleScoreDetails(index)}
        >
          {expandedScoreIndex === index ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>
      </TableCell> */}
    </TableRow>

    {/* Expanded Attribution Evaluation */}
    {expandedScoreIndex === index && score.categories?.length > 0 && (
      <TableRow className={`${index % 2 !== 0 ? 'bg-gray-300 hover:!bg-gray-300' : 'bg-white '}`}>
        <TableCell colSpan={5} className="p-0 w-full hover:bg-transparent">
          <div className="p-6 space-y-4 flex min-w-full justify-center items-center hover:bg-transparent">
            <div className="rounded-md border w-full hover:bg-transparent">
              <Table className="w-full hover:bg-transparent">
                <TableHeader >
                  <TableRow className={`${index % 2 !== 0 ? 'bg-gray-300 hover:!bg-gray-300' : 'bg-white '}`}>
                    <TableHead className="py-2 px-3 w-[45%]">
                      Skills
                    </TableHead>
                    <TableHead className="text-center py-2 px-3 w-[25%]">
                      Weightage
                    </TableHead>
                    <TableHead className="text-center py-2 px-3 w-[25%]">
                      Score
                    </TableHead>
                    <TableHead className="w-[20%] py-2 px-3"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <Accordion
                    type="multiple"
                    className="w-full"
                    asChild
                  >
                    <>
                      {score.categories.map((category, catIndex) => (
                        <AccordionItem
                          key={catIndex}
                          value={`category-${catIndex}`}
                          className={`border-0 transition-all hover:bg-transparent ${
                              catIndex % 2 !== 0 ? 'bg-gray-300' : 'bg-white'
                            }`}
                          asChild
                        >
                          <>
                            <TableRow className="cursor-pointer hover:bg-transparent">
                              <TableCell className="font-medium py-2 px-3 border-0 w-[45%]">
                                {category.category_name}
                              </TableCell>
                              <TableCell className="text-center py-2 px-3 w-[25%]">
                                {category.weight_percentage}%
                              </TableCell>
                              <TableCell className="text-center py-2 px-3 w-[25%]">
                                <span
                                  className={`font-semibold ${getScoreColor(
                                    category.category_contribution
                                  )}`}
                                >
                                  {category.category_contribution.toFixed(2)}%
                                </span>
                              </TableCell>
                              <TableCell className="w-[20%] py-2 px-3">
                                <AccordionTrigger className="hover:no-underline p-0 flex justify-end">
                                  {/* <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" /> */}
                                </AccordionTrigger>
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell
                                colSpan={4}
                                className="p-0 border-0"
                              >
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
                                            <Tooltip>
                                                                              <TooltipTrigger asChild>
                                                                                <div className="flex items-center gap-1 cursor-help">
                                                                                  Scored
                                                                                  <Info className="h-3.5 w-3.5" />
                                                                                </div>
                                                                              </TooltipTrigger>
                                                                              <TooltipContent>
                                                                                <p>Calculation made against weightage</p>
                                                                              </TooltipContent>
                                                                            </Tooltip>
                                          
                                          </TableHead>
                                          <TableHead className="py-1 px-2">
                                            <Tooltip>
                                              <TooltipTrigger asChild>
                                                <div className="flex items-center gap-1 cursor-help">
                                                  Score
                                                  <Info className="h-3.5 w-3.5" />
                                                </div>
                                              </TooltipTrigger>
                                              <TooltipContent>
                                                <p>Placeholder text</p>
                                              </TooltipContent>
                                            </Tooltip>
                                            
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
                                              (subScore * subAttr.weight_percentage) / 100
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

                <TabsContent
                  value="documents"
                  className="flex-1 p-6 mt-0 overflow-y-auto"
                >
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">
                      No documents uploaded yet
                    </p>
                  </div>
                </TabsContent>
              </Tabs>
            )}

            {/* No Scores State */}
            {!isLoading && !isError && scores.length === 0 && (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center space-y-2">
                  <p className="text-muted-foreground">
                    No scores available for this candidate
                  </p>
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

