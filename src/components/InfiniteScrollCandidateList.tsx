import { useState, useEffect, useRef, useCallback } from "react";
import { Search, Users, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface CandidateOption {
  id: string;
  full_name: string;
  email: string;
  created_at: string;
  personas: Array<{ persona_id: string; persona_name: string }>;
}

interface InfiniteScrollCandidateListProps {
  candidates: CandidateOption[];
  selectedCandidates: string[];
  onToggleCandidate: (candidateId: string) => void;
  onSelectAll: () => void;
  onLoadMore: () => void;
  hasMore: boolean;
  loading: boolean;
  searchTerm: string;
  onSearchChange: (term: string) => void;
}

export const InfiniteScrollCandidateList = ({
  candidates,
  selectedCandidates,
  onToggleCandidate,
  onSelectAll,
  onLoadMore,
  hasMore,
  loading,
  searchTerm,
  onSearchChange,
}: InfiniteScrollCandidateListProps) => {
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);
  const observerTarget = useRef<HTMLDivElement>(null);
  const isLoadingRef = useRef(false);

  // Update loading ref when loading state changes
  useEffect(() => {
    isLoadingRef.current = loading;
  }, [loading]);

  // Debounce search input (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearchChange(debouncedSearchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [debouncedSearchTerm, onSearchChange]);

  // Stable callback for load more
  const handleLoadMore = useCallback(() => {
    // Prevent concurrent requests
    if (isLoadingRef.current || !hasMore || searchTerm) {
      return;
    }
    onLoadMore();
  }, [hasMore, searchTerm, onLoadMore]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    // Don't create observer if searching or no target
    if (!observerTarget.current || searchTerm) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          handleLoadMore();
        }
      },
      { 
        threshold: 0.1,
        rootMargin: '100px' // Start loading before reaching the bottom
      }
    );

    const currentTarget = observerTarget.current;
    observer.observe(currentTarget);

    return () => {
      observer.disconnect();
    };
  }, [handleLoadMore, searchTerm]);

  // Format date helper
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Check if all visible candidates are selected
  const allSelected = candidates.length > 0 && candidates.every((c) => selectedCandidates.includes(c.id));

  return (
    <div className="space-y-4">
      {/* Header with search and select all */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search candidates by name or email..."
            value={debouncedSearchTerm}
            onChange={(e) => setDebouncedSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onSelectAll}
          disabled={candidates.length === 0}
        >
          {allSelected ? "Deselect All" : "Select All"}
        </Button>
      </div>

      {/* Candidate List */}
      <div className="max-h-[500px] overflow-y-auto border rounded-lg">
        {candidates.length === 0 && !loading ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Users className="w-12 h-12 text-muted-foreground mb-3" />
            <p className="text-sm font-medium text-foreground">
              {searchTerm ? "No matching candidates found" : "No candidates available"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {searchTerm
                ? "Try adjusting your search terms"
                : "Upload candidates to get started"}
            </p>
          </div>
        ) : (
          <div className="divide-y">
            {candidates.map((candidate) => (
              <div
                key={candidate.id}
                className="flex items-start gap-3 p-4 hover:bg-muted/50 cursor-pointer transition-colors"
                onClick={() => onToggleCandidate(candidate.id)}
              >
                <Checkbox
                  checked={selectedCandidates.includes(candidate.id)}
                  onCheckedChange={() => onToggleCandidate(candidate.id)}
                  onClick={(e) => e.stopPropagation()}
                  className="mt-1"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-foreground truncate">
                        {candidate.full_name}
                      </h4>
                      <p className="text-sm text-muted-foreground truncate">
                        {candidate.email}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs shrink-0">
                      {formatDate(candidate.created_at)}
                    </Badge>
                  </div>
                  {candidate.personas && candidate.personas.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {candidate.personas.map((persona) => (
                        <Badge
                          key={persona.persona_id}
                          variant="secondary"
                          className="text-xs"
                        >
                          {persona.persona_name}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Loading indicator at bottom */}
            {loading && (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                <span className="ml-2 text-sm text-muted-foreground">
                  Loading more candidates...
                </span>
              </div>
            )}

            {/* Intersection observer target */}
            {hasMore && !loading && (
              <div ref={observerTarget} className="h-4" />
            )}

            {/* No more candidates message */}
            {!hasMore && candidates.length > 0 && !loading && (
              <div className="py-4 text-center">
                <p className="text-sm text-muted-foreground">
                  No more candidates to load
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Selection count */}
      {selectedCandidates.length > 0 && (
        <div className="text-sm text-muted-foreground">
          {selectedCandidates.length} candidate{selectedCandidates.length !== 1 ? "s" : ""} selected
        </div>
      )}
    </div>
  );
};

export default InfiniteScrollCandidateList;
