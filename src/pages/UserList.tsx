import React, { useState, useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
  SortingState,
  ColumnDef,
} from '@tanstack/react-table';
import { useQuery } from '@tanstack/react-query';
import { Search, ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';

// Types
interface CV {
  id: string;
  candidate_id: string;
  file_name: string;
  file_hash: string;
  version: number;
  s3_url: string;
  file_size: number;
  mime_type: string;
  status: string;
  uploaded_at: string;
  cv_text: string;
  skills: string[];
  roles_detected: string[];
}

interface Candidate {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  latest_cv_id: string;
  created_at: string;
  updated_at: string;
  cvs: CV[];
}

interface ApiResponse {
  candidates: Candidate[];
  total: number;
  page: number;
  size: number;
  has_next: boolean;
  has_prev: boolean;
}

const fetchCandidates = async (page: number, size: number): Promise<ApiResponse> => {
  const token = localStorage?.getItem("token");
  
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/api/v1/candidate/?page=${page}&size=${size}`,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  );
  
  if (!response.ok) {
    throw new Error('Failed to fetch candidates');
  }
  return response.json();
};

const UserList: React.FC = () => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  // TanStack Query with no caching
  const { data, isLoading, isError, error, refetch } = useQuery<ApiResponse>({
    queryKey: ['candidates', pagination.pageIndex, pagination.pageSize],
    queryFn: () => fetchCandidates(pagination.pageIndex + 1, pagination.pageSize),
    gcTime: 0,
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  // Column definitions
  const columns = useMemo<ColumnDef<Candidate>[]>(
    () => [
      {
        accessorKey: 'full_name',
        header: 'Full Name',
        cell: (info) => (
          <div className="font-medium text-gray-900">{info.getValue() as string}</div>
        ),
      },
      {
        accessorKey: 'email',
        header: 'Email',
        cell: (info) => (
          <div className="text-gray-600">{info.getValue() as string}</div>
        ),
      },
      {
        accessorKey: 'phone',
        header: 'Phone',
        cell: (info) => (
          <div className="text-gray-600">{info.getValue() as string}</div>
        ),
      },
      {
        accessorKey: 'cvs',
        header: 'CVs Count',
        cell: (info) => {
          const cvs = info.getValue() as CV[];
          return (
            <div className="text-center">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {cvs?.length || 0}
              </span>
            </div>
          );
        },
        enableSorting: false,
      },
      {
        accessorKey: 'created_at',
        header: 'Created At',
        cell: (info) => (
          <div className="text-gray-600 text-sm">
            {new Date(info.getValue() as string).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}
          </div>
        ),
      },
      {
        accessorKey: 'updated_at',
        header: 'Updated At',
        cell: (info) => (
          <div className="text-gray-600 text-sm">
            {new Date(info.getValue() as string).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}
          </div>
        ),
      },
    ],
    []
  );

  // Filter data based on search (client-side filtering on current page)
  const filteredData = useMemo(() => {
    if (!data?.candidates) return [];
    if (!globalFilter) return data.candidates;

    return data.candidates.filter((candidate) => {
      const searchStr = globalFilter.toLowerCase();
      return (
        candidate?.full_name?.toLowerCase().includes(searchStr) ||
        candidate?.email?.toLowerCase().includes(searchStr) ||
        candidate?.phone?.toLowerCase().includes(searchStr)
      );
    });
  }, [data?.candidates, globalFilter]);

  // Table instance
  const table = useReactTable({
    data: filteredData,
    columns,
    state: {
      sorting,
      pagination,
    },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: true,
    pageCount: data ? Math.ceil(data.total / pagination.pageSize) : 0,
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow">
          {/* Header */}
          <div className="px-6 py-5 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">Candidates</h2>
                <p className="mt-1 text-sm text-gray-500">
                  {data?.total || 0} total candidates
                </p>
              </div>
              <button
                onClick={() => refetch()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                Refresh
              </button>
            </div>

            {/* Search Bar */}
            <div className="mt-4 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={globalFilter ?? ''}
                onChange={(e) => setGlobalFilter(e.target.value)}
                placeholder="Search candidates..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-gray-500">Loading...</div>
              </div>
            ) : isError ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-red-500">Error: {(error as Error).message}</div>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <th
                          key={header.id}
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          {header.isPlaceholder ? null : (
                            <div
                              className={
                                header.column.getCanSort()
                                  ? 'flex items-center gap-2 cursor-pointer select-none'
                                  : ''
                              }
                              onClick={header.column.getToggleSortingHandler()}
                            >
                              {flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                              {header.column.getCanSort() && (
                                <span className="text-gray-400">
                                  {header.column.getIsSorted() === 'asc' ? (
                                    <ChevronUp className="h-4 w-4" />
                                  ) : header.column.getIsSorted() === 'desc' ? (
                                    <ChevronDown className="h-4 w-4" />
                                  ) : (
                                    <ChevronsUpDown className="h-4 w-4" />
                                  )}
                                </span>
                              )}
                            </div>
                          )}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {table.getRowModel().rows.map((row) => (
                    <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} className="px-6 py-4 whitespace-nowrap">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-700">
                Page {pagination.pageIndex + 1} of {table.getPageCount()}
              </span>
              <select
                value={pagination.pageSize}
                onChange={(e) => {
                  setPagination((prev) => ({
                    ...prev,
                    pageSize: Number(e.target.value),
                    pageIndex: 0,
                  }));
                }}
                className="border border-gray-300 rounded px-2 py-1 text-sm"
              >
                {[10, 20, 30, 40, 50].map((pageSize) => (
                  <option key={pageSize} value={pageSize}>
                    Show {pageSize}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-1">
              {/* First Page */}
              <button
                onClick={() => setPagination((prev) => ({ ...prev, pageIndex: 0 }))}
                disabled={pagination.pageIndex === 0}
                className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                title="First page"
              >
                «
              </button>

              {/* Previous Page */}
              <button
                onClick={() =>
                  setPagination((prev) => ({ ...prev, pageIndex: prev.pageIndex - 1 }))
                }
                disabled={pagination.pageIndex === 0}
                className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                title="Previous page"
              >
                ‹
              </button>

              {/* Page Numbers */}
              {(() => {
                const totalPages = table.getPageCount();
                const currentPage = pagination.pageIndex;
                const pages: (number | string)[] = [];

                if (totalPages <= 7) {
                  // Show all pages if 7 or fewer
                  for (let i = 0; i < totalPages; i++) {
                    pages.push(i);
                  }
                } else {
                  // Always show first page
                  pages.push(0);

                  if (currentPage <= 3) {
                    // Near the start
                    for (let i = 1; i <= 5; i++) {
                      pages.push(i);
                    }
                    pages.push('...');
                    pages.push(totalPages - 1);
                  } else if (currentPage >= totalPages - 4) {
                    // Near the end
                    pages.push('...');
                    for (let i = totalPages - 6; i < totalPages - 1; i++) {
                      pages.push(i);
                    }
                    pages.push(totalPages - 1);
                  } else {
                    // In the middle
                    pages.push('...');
                    for (let i = currentPage - 1; i <= currentPage + 1; i++) {
                      pages.push(i);
                    }
                    pages.push('...');
                    pages.push(totalPages - 1);
                  }
                }

                return pages.map((page, idx) =>
                  typeof page === 'number' ? (
                    <button
                      key={page}
                      onClick={() =>
                        setPagination((prev) => ({ ...prev, pageIndex: page }))
                      }
                      className={`px-3 py-1 border rounded text-sm transition-colors ${
                        pagination.pageIndex === page
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {page + 1}
                    </button>
                  ) : (
                    <span key={`ellipsis-${idx}`} className="px-2 py-1 text-gray-500">
                      {page}
                    </span>
                  )
                );
              })()}

              {/* Next Page */}
              <button
                onClick={() =>
                  setPagination((prev) => ({ ...prev, pageIndex: prev.pageIndex + 1 }))
                }
                disabled={pagination.pageIndex >= table.getPageCount() - 1}
                className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                title="Next page"
              >
                ›
              </button>

              {/* Last Page */}
              <button
                onClick={() =>
                  setPagination((prev) => ({
                    ...prev,
                    pageIndex: table.getPageCount() - 1,
                  }))
                }
                disabled={pagination.pageIndex >= table.getPageCount() - 1}
                className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                title="Last page"
              >
                »
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserList;



// import React, { useState, useMemo } from 'react';
// import {
//   useReactTable,
//   getCoreRowModel,
//   getSortedRowModel,
//   getPaginationRowModel,
//   getFilteredRowModel,
//   flexRender,
//   SortingState,
//   ColumnDef,
// } from '@tanstack/react-table';
// import { useQuery } from '@tanstack/react-query';
// import { Search, ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';

// // Types
// interface CV {
//   id: string;
//   candidate_id: string;
//   file_name: string;
//   file_hash: string;
//   version: number;
//   s3_url: string;
//   file_size: number;
//   mime_type: string;
//   status: string;
//   uploaded_at: string;
//   cv_text: string;
//   skills: string[];
//   roles_detected: string[];
// }

// interface Candidate {
//   id: string;
//   full_name: string;
//   email: string;
//   phone: string;
//   latest_cv_id: string;
//   created_at: string;
//   updated_at: string;
//   cvs: CV[];
// }

// interface ApiResponse {
//   candidates: Candidate[];
//   total: number;
//   page: number;
//   size: number;
//   has_next: boolean;
//   has_prev: boolean;
// }

// const fetchCandidates = async (page: number, size: number): Promise<ApiResponse> => {
//     const token = localStorage.getItem('token'); 
    
//     const response = await fetch(
//       `${import.meta.env.VITE_API_URL}/api/v1/candidate/?page=${page}&size=${size}`,
//       {
//         headers: {
//           'Authorization': `Bearer ${token}`,
//           'Content-Type': 'application/json',
//         },
//       }
//     );
    
//     if (!response.ok) {
//       throw new Error('Failed to fetch candidates');
//     }
//     return response.json();
//   };

// const UserList: React.FC = () => {
//   const [sorting, setSorting] = useState<SortingState>([]);
//   const [globalFilter, setGlobalFilter] = useState('');
//   const [pagination, setPagination] = useState({
//     pageIndex: 0,
//     pageSize: 10,
//   });

//   // TanStack Query with no caching
//   const { data, isLoading, isError, error, refetch } = useQuery<ApiResponse>({
//     queryKey: ['candidates', pagination.pageIndex, pagination.pageSize],
//     queryFn: () => fetchCandidates(pagination.pageIndex + 1, pagination.pageSize),
//     gcTime: 0, // No cache time
//     staleTime: 0, // Data is immediately stale
//     refetchOnMount: true,
//     refetchOnWindowFocus: true,
//   });

//   // Column definitions
//   const columns = useMemo<ColumnDef<Candidate>[]>(
//     () => [
//       {
//         accessorKey: 'full_name',
//         header: 'Full Name',
//         cell: (info) => (
//           <div className="font-medium text-gray-900">{info.getValue() as string}</div>
//         ),
//       },
//       {
//         accessorKey: 'email',
//         header: 'Email',
//         cell: (info) => (
//           <div className="text-gray-600">{info.getValue() as string}</div>
//         ),
//       },
//       {
//         accessorKey: 'phone',
//         header: 'Phone',
//         cell: (info) => (
//           <div className="text-gray-600">{info.getValue() as string}</div>
//         ),
//       },
//       {
//         accessorKey: 'cvs',
//         header: 'CVs Count',
//         cell: (info) => {
//           const cvs = info.getValue() as CV[];
//           return (
//             <div className="text-center">
//               <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
//                 {cvs?.length || 0}
//               </span>
//             </div>
//           );
//         },
//         enableSorting: false,
//       },
//       {
//         accessorKey: 'created_at',
//         header: 'Created At',
//         cell: (info) => (
//           <div className="text-gray-600 text-sm">
//             {new Date(info.getValue() as string).toLocaleDateString('en-US', {
//               year: 'numeric',
//               month: 'short',
//               day: 'numeric',
//             })}
//           </div>
//         ),
//       },
//       {
//         accessorKey: 'updated_at',
//         header: 'Updated At',
//         cell: (info) => (
//           <div className="text-gray-600 text-sm">
//             {new Date(info.getValue() as string).toLocaleDateString('en-US', {
//               year: 'numeric',
//               month: 'short',
//               day: 'numeric',
//             })}
//           </div>
//         ),
//       },
//     ],
//     []
//   );

//   // Table instance
//   const table = useReactTable({
//     data: data?.candidates || [],
//     columns,
//     state: {
//       sorting,
//       globalFilter,
//       pagination,
//     },
//     onSortingChange: setSorting,
//     onGlobalFilterChange: setGlobalFilter,
//     onPaginationChange: setPagination,
//     getCoreRowModel: getCoreRowModel(),
//     getSortedRowModel: getSortedRowModel(),
//     getFilteredRowModel: getFilteredRowModel(),
//     getPaginationRowModel: getPaginationRowModel(),
//     manualPagination: false,
//     pageCount: data ? Math.ceil(data.total / pagination.pageSize) : 0,
//   });

//   return (
//     <div className="min-h-screen bg-gray-50 p-8">
//       <div className="max-w-7xl mx-auto">
//         <div className="bg-white rounded-lg shadow">
//           {/* Header */}
//           <div className="px-6 py-5 border-b border-gray-200">
//             <div className="flex items-center justify-between">
//               <div>
//                 <h2 className="text-2xl font-semibold text-gray-900">Candidates</h2>
//                 <p className="mt-1 text-sm text-gray-500">
//                   {data?.total || 0} total candidates
//                 </p>
//               </div>
//               <button
//                 onClick={() => refetch()}
//                 className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
//               >
//                 Refresh
//               </button>
//             </div>

//             {/* Search Bar */}
//             <div className="mt-4 relative">
//               <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                 <Search className="h-5 w-5 text-gray-400" />
//               </div>
//               <input
//                 type="text"
//                 value={globalFilter ?? ''}
//                 onChange={(e) => setGlobalFilter(e.target.value)}
//                 placeholder="Search candidates..."
//                 className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               />
//             </div>
//           </div>

//           {/* Table */}
//           <div className="overflow-x-auto">
//             {isLoading ? (
//               <div className="flex items-center justify-center h-64">
//                 <div className="text-gray-500">Loading...</div>
//               </div>
//             ) : isError ? (
//               <div className="flex items-center justify-center h-64">
//                 <div className="text-red-500">Error: {(error as Error).message}</div>
//               </div>
//             ) : (
//               <table className="min-w-full divide-y divide-gray-200">
//                 <thead className="bg-gray-50">
//                   {table.getHeaderGroups().map((headerGroup) => (
//                     <tr key={headerGroup.id}>
//                       {headerGroup.headers.map((header) => (
//                         <th
//                           key={header.id}
//                           className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
//                         >
//                           {header.isPlaceholder ? null : (
//                             <div
//                               className={
//                                 header.column.getCanSort()
//                                   ? 'flex items-center gap-2 cursor-pointer select-none'
//                                   : ''
//                               }
//                               onClick={header.column.getToggleSortingHandler()}
//                             >
//                               {flexRender(
//                                 header.column.columnDef.header,
//                                 header.getContext()
//                               )}
//                               {header.column.getCanSort() && (
//                                 <span className="text-gray-400">
//                                   {header.column.getIsSorted() === 'asc' ? (
//                                     <ChevronUp className="h-4 w-4" />
//                                   ) : header.column.getIsSorted() === 'desc' ? (
//                                     <ChevronDown className="h-4 w-4" />
//                                   ) : (
//                                     <ChevronsUpDown className="h-4 w-4" />
//                                   )}
//                                 </span>
//                               )}
//                             </div>
//                           )}
//                         </th>
//                       ))}
//                     </tr>
//                   ))}
//                 </thead>
//                 <tbody className="bg-white divide-y divide-gray-200">
//                   {table.getRowModel().rows.map((row) => (
//                     <tr key={row.id} className="hover:bg-gray-50 transition-colors">
//                       {row.getVisibleCells().map((cell) => (
//                         <td key={cell.id} className="px-6 py-4 whitespace-nowrap">
//                           {flexRender(cell.column.columnDef.cell, cell.getContext())}
//                         </td>
//                       ))}
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             )}
//           </div>

//           {/* Pagination */}
//           <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
//             <div className="flex items-center gap-2">
//               <span className="text-sm text-gray-700">
//                 Page {table.getState().pagination.pageIndex + 1} of{' '}
//                 {table.getPageCount()}
//               </span>
//               <select
//                 value={table.getState().pagination.pageSize}
//                 onChange={(e) => {
//                   table.setPageSize(Number(e.target.value));
//                 }}
//                 className="border border-gray-300 rounded px-2 py-1 text-sm"
//               >
//                 {[10, 20, 30, 40, 50].map((pageSize) => (
//                   <option key={pageSize} value={pageSize}>
//                     Show {pageSize}
//                   </option>
//                 ))}
//               </select>
//             </div>

//             <div className="flex gap-2">
//               <button
//                 onClick={() => table.setPageIndex(0)}
//                 disabled={!table.getCanPreviousPage()}
//                 className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
//               >
//                 First
//               </button>
//               <button
//                 onClick={() => table.previousPage()}
//                 disabled={!table.getCanPreviousPage()}
//                 className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
//               >
//                 Previous
//               </button>
//               <button
//                 onClick={() => table.nextPage()}
//                 disabled={!table.getCanNextPage()}
//                 className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
//               >
//                 Next
//               </button>
//               <button
//                 onClick={() => table.setPageIndex(table.getPageCount() - 1)}
//                 disabled={!table.getCanNextPage()}
//                 className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
//               >
//                 Last
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default UserList;