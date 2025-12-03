import { useState, useEffect, memo, useMemo, useRef } from "react";
import { Search, Users, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CandidateOption } from "@/lib/types";
import { formatDateTime } from "@/lib/helper";


interface InfiniteScrollCandidateListProps {
  candidates: CandidateOption[];
  selectedCandidates: CandidateOption[];
  onToggleCandidate: (candidate: object) => void;
  onSelectAll: () => void;
  onLoadMore: () => void;
  hasMore: boolean;
  loading: boolean;
  searchTerm: string;
  onSearchChange: (term: string) => void;
}

export const InfiniteScrollCandidateList = memo(({
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
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Sync local search with prop changes
  useEffect(() => {
    setLocalSearchTerm(searchTerm);
  }, [searchTerm]);

  // Debounce search input (300ms)
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (localSearchTerm !== searchTerm) {
      searchTimeoutRef.current = setTimeout(() => {
        onSearchChange(localSearchTerm);
      }, 800);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [localSearchTerm]); // Remove onSearchChange from deps

  const sortedCandidates = useMemo(() => {
    const selectedIds = new Set(selectedCandidates.map(c => c.id));

    const candidateIds = new Set(candidates.map(c => c.id));
    const missingSelected = selectedCandidates.filter(c => !candidateIds.has(c.id));

    const allCandidates = [...missingSelected, ...candidates];

    const selected = allCandidates.filter(c => selectedIds.has(c.id));
    const unselected = allCandidates.filter(c => !selectedIds.has(c.id));

    return [...selected, ...unselected];
  }, [candidates, selectedCandidates]);

  const handleToggle = (candidate: CandidateOption) => {
  onToggleCandidate(candidate);
  
  // If searching and selecting a candidate, clear search to show them in main list
  if (localSearchTerm && !selectedCandidates.some(c => c.id === candidate.id)) {
    setLocalSearchTerm('');
    onSearchChange('');
  }
};

  // const sortedCandidates = useMemo(() => {
  //   const selectedIds = new Set(selectedCandidates.map(c => c.id));

  //   const selected = candidates.filter(c => selectedIds.has(c.id));
  //   const unselected = candidates.filter(c => !selectedIds.has(c.id));

  //   return [...selected, ...unselected];
  // }, [candidates, selectedCandidates]);

  // Check if all visible candidates are selected
  const allSelected = useMemo(() => {
    if (candidates.length === 0) return false;

    // During search, only check against visible search results
    const visibleCandidates = localSearchTerm ? candidates : sortedCandidates;

    return visibleCandidates.every(candidate =>
      selectedCandidates.some(sel => sel.id === candidate.id)
    );
  }, [candidates, sortedCandidates, selectedCandidates, localSearchTerm]);

  return (
    <div className="space-y-4">
      {/* Header with search and select all */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search candidates by name or email..."
            value={localSearchTerm}
            onChange={(e) => setLocalSearchTerm(e.target.value)}
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
            <Users className="w-12 h-12 text-gray-400 mb-3" />
            <p className="text-sm font-medium">
              {localSearchTerm ? "No matching candidates found" : "No candidates available"}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {localSearchTerm
                ? "Try adjusting your search terms"
                : "Upload candidates to get started"}
            </p>
          </div>
        ) : (
          <div className="divide-y">

            {localSearchTerm ? (
              candidates.map((candidate) => {
                const isSelected = selectedCandidates.some(c => c.id === candidate.id);

                return (
                  <div
                    key={candidate.id}
                    className={`flex items-start gap-3 p-4 hover:bg-gray-50 cursor-pointer transition-colors ${isSelected ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                      }`}
                    onClick={() => handleToggle(candidate)}
                  >
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => handleToggle(candidate)}
                      onClick={(e) => e.stopPropagation()}
                      className="mt-1"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium truncate flex items-center gap-2">
                            {candidate.full_name}
                            {/* {isSelected && (
                        <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                          Selected
                        </Badge>
                      )} */}
                          </h4>
                          <p className="text-sm text-gray-600 truncate">
                            {candidate.email}
                          </p>
                        </div>
                        <Badge variant="outline" className="text-xs shrink-0">
                          {formatDateTime(candidate.created_at)?.split(" ")?.[0]}
                        </Badge>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              /* Show sorted candidates (selected on top) when not searching */
              sortedCandidates.map((candidate) => {
                const isSelected = selectedCandidates.some(c => c.id === candidate.id);

                return (
                  <div
                    key={candidate.id}
                    className={`flex items-start gap-3 p-4 hover:bg-gray-50 cursor-pointer transition-colors ${isSelected ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                      }`}
                    onClick={() => handleToggle(candidate)}
                  >
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => handleToggle(candidate)}
                      onClick={(e) => e.stopPropagation()}
                      className="mt-1"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium truncate flex items-center gap-2">
                            {candidate.full_name}
                            {/* {isSelected && (
                        <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                          Selected
                        </Badge>
                      )} */}
                          </h4>
                          <p className="text-sm text-gray-600 truncate">
                            {candidate.email}
                          </p>
                        </div>
                        <Badge variant="outline" className="text-xs shrink-0">
                          {formatDateTime(candidate.created_at)?.split(" ")?.[0]}
                        </Badge>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            {/* Load More Button - Only show when not searching */}
            {hasMore && !localSearchTerm && (
              <div className="py-4 flex justify-center">
                <Button
                  variant="outline"
                  onClick={onLoadMore}
                  disabled={loading}
                  className="min-w-[140px]"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    "Load More"
                  )}
                </Button>
              </div>
            )}

            {/* Loading indicator for search */}
            {loading && localSearchTerm && (
              <div className="py-4 flex justify-center">
                <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
              </div>
            )}

            {/* No more candidates message */}
            {!hasMore && candidates.length > 0 && !loading && !localSearchTerm && (
              <div className="py-4 text-center">
                <p className="text-sm text-gray-500">
                  All candidates loaded
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Selection count */}
      {selectedCandidates.length > 0 && (
        <div className="text-sm text-gray-600">
          {selectedCandidates.length} candidate{selectedCandidates.length !== 1 ? "s" : ""} selected
        </div>
      )}
    </div>
  );
});

export default InfiniteScrollCandidateList;
