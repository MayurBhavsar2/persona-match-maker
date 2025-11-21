import { useEffect, useRef, useState } from "react";
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
  /**
   * Preferably return a Promise that resolves when loading completes.
   * If you can't return a Promise, this component will fall back to watching `loading` prop.
   */
  onLoadMore: () => void | Promise<void>;
  hasMore: boolean;
  loading: boolean; // parent should set true when fetch starts, false when finished
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

  // Refs & nodes
  const containerRef = useRef<HTMLDivElement | null>(null);
  const observerTargetRef = useRef<HTMLDivElement | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Stable refs for props used inside observer
  const loadingRef = useRef<boolean>(loading);
  const hasMoreRef = useRef<boolean>(hasMore);
  const onLoadMoreRef = useRef<typeof onLoadMore>(onLoadMore);

  // Local mutex and time guard
  const isFetchingRef = useRef(false);
  const triggeredAtRef = useRef<number>(0); // timestamp of last trigger

  // Keep refs in sync
  useEffect(() => { loadingRef.current = loading; }, [loading]);
  useEffect(() => { hasMoreRef.current = hasMore; }, [hasMore]);
  useEffect(() => { onLoadMoreRef.current = onLoadMore; }, [onLoadMore]);

  // Debounce search input (300ms)
  useEffect(() => {
    const t = setTimeout(() => onSearchChange(debouncedSearchTerm), 300);
    return () => clearTimeout(t);
  }, [debouncedSearchTerm, onSearchChange]);

  // Intersection observer setup: create once, reuse
  useEffect(() => {
    // If searching, don't observe
    if (!containerRef.current || searchTerm) {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
      return;
    }

    // Create observer if missing
    if (!observerRef.current) {
      observerRef.current = new IntersectionObserver(
        async (entries) => {
          for (const entry of entries) {
            if (!entry.isIntersecting) continue;

            // throttle multiple tight triggers
            const now = Date.now();
            if (now - triggeredAtRef.current < 700) {
              // ignore if triggered recently (700ms)
              return;
            }

            // check guards (immediate via refs)
            if (isFetchingRef.current || loadingRef.current || !hasMoreRef.current) {
              return;
            }

            // mark triggered time and local mutex
            triggeredAtRef.current = now;
            isFetchingRef.current = true;

            // unobserve immediately to avoid duplicates until we re-enable
            try {
              if (observerTargetRef.current && observerRef.current) {
                observerRef.current.unobserve(observerTargetRef.current);
              }
            } catch (e) {
              // ignore
            }

            // Call onLoadMore and wait if it returns a promise
            try {
              const maybePromise = onLoadMoreRef.current();
              if (maybePromise && typeof (maybePromise as any).then === "function") {
                await maybePromise;
                // parent has control to set loading=false when done
              } else {
                // no promise returned: we rely on loading prop to flip to false
                // Wait until loadingRef becomes true (fetch started) then false, but to avoid
                // indefinite wait, we set a timeout fallback of 10s.
                const waitForLoadingToFinish = () =>
                  new Promise<void>((resolve) => {
                    const start = Date.now();
                    const interval = setInterval(() => {
                      // if loading prop turned false, done
                      if (!loadingRef.current) {
                        clearInterval(interval);
                        resolve();
                        return;
                      }
                      // safety timeout 10s
                      if (Date.now() - start > 10000) {
                        clearInterval(interval);
                        resolve();
                        return;
                      }
                    }, 150);
                  });
                await waitForLoadingToFinish();
              }
            } catch (err) {
              // swallow - parent handles errors; we still want to re-observe later
              // console.error("onLoadMore failed:", err);
            } finally {
              isFetchingRef.current = false;
              // small delay before re-observing to give DOM a chance to update
              setTimeout(() => {
                if (observerRef.current && observerTargetRef.current && !searchTerm && hasMoreRef.current) {
                  try { observerRef.current.observe(observerTargetRef.current); } catch (e) {}
                }
              }, 250);
            }
          }
        },
        {
          root: containerRef.current,      // observe relative to scroll container
          rootMargin: "200px",            // adjust prefetch distance as desired
          threshold: 0.1,
        }
      );
    }

    // Observe target if present
    const t = observerTargetRef.current;
    if (t && observerRef.current) {
      observerRef.current.observe(t);
    }

    // cleanup
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
    };
    // only recreate when searchTerm or container changes
  }, [searchTerm]);

  // Extra re-observe if parent finishes loading and we are not searching
  useEffect(() => {
    if (!searchTerm && !loading && hasMore && observerRef.current && observerTargetRef.current) {
      // Small delay so DOM updates and new target is stable
      const id = setTimeout(() => {
        try { observerRef.current?.observe(observerTargetRef.current!); } catch (e) {}
      }, 300);
      return () => clearTimeout(id);
    }
  }, [loading, hasMore, searchTerm]);

  // Format date helper
  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });

  const allSelected = candidates.length > 0 && candidates.every(c => selectedCandidates.includes(c.id));

  return (
    <div className="space-y-4">
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
        <Button variant="outline" size="sm" onClick={onSelectAll} disabled={candidates.length === 0}>
          {allSelected ? "Deselect All" : "Select All"}
        </Button>
      </div>

      <div ref={containerRef} className="max-h-[500px] overflow-y-auto border rounded-lg">
        {candidates.length === 0 && !loading ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Users className="w-12 h-12 text-muted-foreground mb-3" />
            <p className="text-sm font-medium text-foreground">
              {searchTerm ? "No matching candidates found" : "No candidates available"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {searchTerm ? "Try adjusting your search terms" : "Upload candidates to get started"}
            </p>
          </div>
        ) : (
          <div className="divide-y">
            {candidates.map(candidate => (
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
                      <h4 className="font-medium text-foreground truncate">{candidate.full_name}</h4>
                      <p className="text-sm text-muted-foreground truncate">{candidate.email}</p>
                    </div>
                    <Badge variant="outline" className="text-xs shrink-0">{formatDate(candidate.created_at)}</Badge>
                  </div>
                  {candidate.personas && candidate.personas.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {candidate.personas.map(p => (
                        <Badge key={p.persona_id} variant="secondary" className="text-xs">{p.persona_name}</Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                <span className="ml-2 text-sm text-muted-foreground">Loading more candidates...</span>
              </div>
            )}

            {hasMore && !loading && !searchTerm && <div ref={observerTargetRef} className="h-4" />}

            {!hasMore && candidates.length > 0 && !loading && (
              <div className="py-4 text-center"><p className="text-sm text-muted-foreground">No more candidates to load</p></div>
            )}
          </div>
        )}
      </div>

      {selectedCandidates.length > 0 && (
        <div className="text-sm text-muted-foreground">
          {selectedCandidates.length} candidate{selectedCandidates.length !== 1 ? "s" : ""} selected
        </div>
      )}
    </div>
  );
};

export default InfiniteScrollCandidateList;

// import { useState, useEffect, useRef, useCallback } from "react";
// import { Search, Users, Loader2 } from "lucide-react";
// import { Input } from "@/components/ui/input";
// import { Checkbox } from "@/components/ui/checkbox";
// import { Badge } from "@/components/ui/badge";
// import { Button } from "@/components/ui/button";

// interface CandidateOption {
//   id: string;
//   full_name: string;
//   email: string;
//   created_at: string;
//   personas: Array<{ persona_id: string; persona_name: string }>;
// }

// interface InfiniteScrollCandidateListProps {
//   candidates: CandidateOption[];
//   selectedCandidates: string[];
//   onToggleCandidate: (candidateId: string) => void;
//   onSelectAll: () => void;
//   onLoadMore: () => void;
//   hasMore: boolean;
//   loading: boolean;
//   searchTerm: string;
//   onSearchChange: (term: string) => void;
// }

// export const InfiniteScrollCandidateList = ({
//   candidates,
//   selectedCandidates,
//   onToggleCandidate,
//   onSelectAll,
//   onLoadMore,
//   hasMore,
//   loading,
//   searchTerm,
//   onSearchChange,
// }: InfiniteScrollCandidateListProps) => {
//   const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);
//   const observerTarget = useRef<HTMLDivElement>(null);
//   const isLoadingRef = useRef(false);
//   const hasMoreRef = useRef(hasMore);

//   // Keep refs in sync with props
//   useEffect(() => {
//     isLoadingRef.current = loading;
//   }, [loading]);

//   useEffect(() => {
//     hasMoreRef.current = hasMore;
//   }, [hasMore]);

//   // Debounce search input (300ms)
//   useEffect(() => {
//     const timer = setTimeout(() => {
//       onSearchChange(debouncedSearchTerm);
//     }, 300);

//     return () => clearTimeout(timer);
//   }, [debouncedSearchTerm, onSearchChange]);

//   // Stable callback for load more
//   const handleLoadMore = useCallback(() => {
//     // Prevent concurrent requests using refs for immediate check
//     if (isLoadingRef.current || !hasMoreRef.current) {
//       return;
//     }
//     onLoadMore();
//   }, [onLoadMore]);

//   // Intersection Observer for infinite scroll
//   useEffect(() => {
//     // Don't create observer if searching or no target
//     if (!observerTarget.current || searchTerm) {
//       return;
//     }

//     const observer = new IntersectionObserver(
//       (entries) => {
//         // Only trigger if intersecting AND not already loading
//         if (entries[0].isIntersecting && !isLoadingRef.current && hasMoreRef.current) {
//           handleLoadMore();
//         }
//       },
//       { 
//         threshold: 0.1,
//         rootMargin: '100px'
//       }
//     );

//     const currentTarget = observerTarget.current;
//     observer.observe(currentTarget);

//     return () => {
//       observer.disconnect();
//     };
//   }, [handleLoadMore, searchTerm]); // Removed hasMore and loading from deps since we use refs

//   // Format date helper
//   const formatDate = (dateString: string) => {
//     return new Date(dateString).toLocaleDateString("en-US", {
//       year: "numeric",
//       month: "short",
//       day: "numeric",
//     });
//   };

//   // Check if all visible candidates are selected
//   const allSelected = candidates.length > 0 && candidates.every((c) => selectedCandidates.includes(c.id));

//   return (
//     <div className="space-y-4">
//       {/* Header with search and select all */}
//       <div className="flex items-center justify-between gap-4">
//         <div className="relative flex-1">
//           <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
//           <Input
//             placeholder="Search candidates by name or email..."
//             value={debouncedSearchTerm}
//             onChange={(e) => setDebouncedSearchTerm(e.target.value)}
//             className="pl-10"
//           />
//         </div>
//         <Button
//           variant="outline"
//           size="sm"
//           onClick={onSelectAll}
//           disabled={candidates.length === 0}
//         >
//           {allSelected ? "Deselect All" : "Select All"}
//         </Button>
//       </div>

//       {/* Candidate List */}
//       <div className="max-h-[500px] overflow-y-auto border rounded-lg">
//         {candidates.length === 0 && !loading ? (
//           <div className="flex flex-col items-center justify-center py-12 text-center">
//             <Users className="w-12 h-12 text-muted-foreground mb-3" />
//             <p className="text-sm font-medium text-foreground">
//               {searchTerm ? "No matching candidates found" : "No candidates available"}
//             </p>
//             <p className="text-xs text-muted-foreground mt-1">
//               {searchTerm
//                 ? "Try adjusting your search terms"
//                 : "Upload candidates to get started"}
//             </p>
//           </div>
//         ) : (
//           <div className="divide-y">
//             {candidates.map((candidate) => (
//               <div
//                 key={candidate.id}
//                 className="flex items-start gap-3 p-4 hover:bg-muted/50 cursor-pointer transition-colors"
//                 onClick={() => onToggleCandidate(candidate.id)}
//               >
//                 <Checkbox
//                   checked={selectedCandidates.includes(candidate.id)}
//                   onCheckedChange={() => onToggleCandidate(candidate.id)}
//                   onClick={(e) => e.stopPropagation()}
//                   className="mt-1"
//                 />
//                 <div className="flex-1 min-w-0">
//                   <div className="flex items-start justify-between gap-2">
//                     <div className="flex-1 min-w-0">
//                       <h4 className="font-medium text-foreground truncate">
//                         {candidate.full_name}
//                       </h4>
//                       <p className="text-sm text-muted-foreground truncate">
//                         {candidate.email}
//                       </p>
//                     </div>
//                     <Badge variant="outline" className="text-xs shrink-0">
//                       {formatDate(candidate.created_at)}
//                     </Badge>
//                   </div>
//                   {candidate.personas && candidate.personas.length > 0 && (
//                     <div className="flex flex-wrap gap-1 mt-2">
//                       {candidate.personas.map((persona) => (
//                         <Badge
//                           key={persona.persona_id}
//                           variant="secondary"
//                           className="text-xs"
//                         >
//                           {persona.persona_name}
//                         </Badge>
//                       ))}
//                     </div>
//                   )}
//                 </div>
//               </div>
//             ))}

//             {/* Loading indicator at bottom */}
//             {loading && (
//               <div className="flex items-center justify-center py-6">
//                 <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
//                 <span className="ml-2 text-sm text-muted-foreground">
//                   Loading more candidates...
//                 </span>
//               </div>
//             )}

//             {/* Intersection observer target */}
//             {hasMore && !loading && !searchTerm && (
//               <div ref={observerTarget} className="h-4" />
//             )}

//             {/* No more candidates message */}
//             {!hasMore && candidates.length > 0 && !loading && (
//               <div className="py-4 text-center">
//                 <p className="text-sm text-muted-foreground">
//                   No more candidates to load
//                 </p>
//               </div>
//             )}
//           </div>
//         )}
//       </div>

//       {/* Selection count */}
//       {selectedCandidates.length > 0 && (
//         <div className="text-sm text-muted-foreground">
//           {selectedCandidates.length} candidate{selectedCandidates.length !== 1 ? "s" : ""} selected
//         </div>
//       )}
//     </div>
//   );
// };

// export default InfiniteScrollCandidateList;
