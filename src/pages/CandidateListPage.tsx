import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ColumnDef, PaginationState } from '@tanstack/react-table';
import { useNavigate } from 'react-router-dom';
import { Edit, Trash2, Plus } from 'lucide-react';
import BasicTable from '@/components/BasicTable';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useToast } from '@/components/ui/use-toast';
import axiosInstance from '@/lib/utils';

// Date formatting utility
const formatDateTime = (dateString: string) => {
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear().toString().slice(-2);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${day}/${month}/${year} ${hours}:${minutes}`;
};

// Types
interface Persona {
  persona_id: string;
  persona_name: string;
}

interface Candidate {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  latest_cv_id: string;
  created_at: string;
  created_by: string | null;
  created_by_name: string | null;
  updated_at: string;
  updated_by: string | null;
  updated_by_name: string | null;
  personas: Persona[];
  cvs: any;
}

interface CandidateApiResponse {
  candidates: Candidate[];
  total: number;
  page: number;
  size: number;
  has_next: boolean;
  has_prev: boolean;
}

const CandidateListPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string } | null>(null);
  const userData = JSON.parse(localStorage.getItem("user") || "{}");
  
  // Pagination state
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  // Fetch candidates using React Query with server-side pagination
  const { data: apiResponse, isLoading, isError, error, refetch } = useQuery<CandidateApiResponse>({
    queryKey: ['candidates', pagination.pageIndex, pagination.pageSize],
    queryFn: async () => {
      const response = await axiosInstance.get('/api/v1/candidate/', {
        params: {
          page: pagination.pageIndex + 1, // API expects 1-based page numbers
          size: pagination.pageSize,
        },
      });
      return response.data;
    },
    retry: 3,
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    keepPreviousData: true, // Keep previous data while fetching new data
  });

  // Transform API data
  const candidates = useMemo(() => {
    const rawData = apiResponse?.candidates || [];
    if (!Array.isArray(rawData)) return [];

    return rawData.map((candidate: any) => ({
      id: candidate.id,
      full_name: candidate.full_name || 'Unknown Name',
      email: candidate.email || '',
      phone: candidate.phone || '',
      latest_cv_id: candidate.latest_cv_id || '',
      created_at: candidate.created_at || new Date().toISOString(),
      created_by: candidate.created_by,
      created_by_name: candidate.created_by_name || 'Unknown',
      updated_at: candidate.updated_at || candidate.created_at || new Date().toISOString(),
      updated_by: candidate.updated_by,
      updated_by_name: candidate.updated_by_name,
      personas: candidate.personas || [],
      cvs: candidate.cvs,
    }));
  }, [apiResponse]);

  // Calculate total page count for server-side pagination
  const pageCount = useMemo(() => {
    if (!apiResponse?.total || !pagination.pageSize) return 0;
    return Math.ceil(apiResponse.total / pagination.pageSize);
  }, [apiResponse?.total, pagination.pageSize]);

  // Handle pagination changes
  const handlePaginationChange = (updater: any) => {
    const newPagination = typeof updater === 'function' ? updater(pagination) : updater;
    setPagination(newPagination);
  };



  // Column definitions
  const columns = useMemo<ColumnDef<Candidate>[]>(
    () => [
      {
        accessorKey: 'full_name',
        header: 'Name',
        cell: (info) => (
          <div className="font-medium text-gray-900">
            {info.getValue() as string}
          </div>
        ),
      },
      {
        accessorKey: 'email',
        header: 'Email',
        cell: (info) => (
          <div className="text-gray-600">
            {info.getValue() as string}
          </div>
        ),
      },
      {
        id: 'evaluations',
        header: 'Evaluations',
        cell: (info) => {
          const candidate = info.row.original;
          const evaluationCount = candidate.personas?.length || 0;
          const personaNames = candidate.personas?.map(p => p.persona_name) || [];
          
          return (
            <div className="flex items-center justify-center">
              {evaluationCount > 0 ? (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="font-medium text-blue-600 cursor-help">
                        {evaluationCount}
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="max-w-xs">
                        <p className="font-semibold mb-1">Personas:</p>
                        <ul className="text-sm">
                          {personaNames.map((name, index) => (
                            <li key={index} className="truncate">
                              • {name}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ) : (
                <span className="font-medium text-gray-400">0</span>
              )}
            </div>
          );
        },
        enableSorting: true,
        sortingFn: (rowA, rowB) => {
          const aCount = rowA.original.personas?.length || 0;
          const bCount = rowB.original.personas?.length || 0;
          return aCount - bCount;
        },
      },
      {
        accessorKey: 'created_by_name',
        header: 'Created By',
        cell: (info) => (
          <div className="text-gray-600">
            {info.getValue() as string || 'Unknown'}
          </div>
        ),
      },
      {
        accessorKey: 'created_at',
        header: 'Created On',
        cell: (info) => (
          <div className="text-sm text-gray-600">
            {formatDateTime(info.getValue() as string)}
          </div>
        ),
      },
      {
        accessorKey: 'updated_at',
        header: 'Updated On',
        cell: (info) => (
          <div className="text-sm text-gray-600">
            {formatDateTime(info.getValue() as string)}
          </div>
        ),
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: (info) => {
          const candidate = info.row.original;
          return (
            <div className="flex items-center justify-end space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleEdit(candidate.id)}
                className="h-6 w-6 p-0"
                title="Edit Candidate"
              >
                <Edit className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setDeleteConfirm({ id: candidate.id, name: candidate.full_name })}
                className="h-6 w-6 p-0 hover:bg-red-50 hover:text-red-600"
                title="Delete Candidate"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          );
        },
        enableSorting: false,
      },
    ],
    []
  );

  // Handlers
  const handleCreate = () => {
    navigate('/candidate-upload');
  };

  const handleEdit = (candidateId: string) => {
    navigate(`/candidate-upload?id=${candidateId}`);
  };

  const handleDelete = async (candidateId: string) => {
    try {
      await axiosInstance.delete(`/api/v1/candidate/${candidateId}`);

      toast({
        title: "Candidate Deleted",
        description: "Candidate has been deleted successfully.",
      });

      // Refetch data to update the table
      refetch();
    } catch (error: any) {
      console.error("Error deleting candidate:", error);
      toast({
        title: "Delete failed",
        description: error.response?.data?.message || "Could not delete the candidate. Please try again.",
        variant: "destructive",
      });
    }
    setDeleteConfirm(null);
  };

  const handleRefresh = () => {
    refetch();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sticky Header */}
      <div className="sticky top-[80px] z-30 bg-gray-50 border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Candidates</h1>
              <p className="mt-2 text-gray-600">
                Manage candidate profiles and evaluations
              </p>
            </div>
            <Button onClick={handleCreate} className="flex items-center space-x-2">
              <Plus className="w-4 h-4" />
              <span>Add Candidate</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-8 py-4">
        {/* Table */}
        <BasicTable
          data={candidates}
          columns={columns}
          isLoading={isLoading}
          isError={isError}
          error={error as Error}
          onRefresh={handleRefresh}
          title=""
          description={`${apiResponse?.total || 0}`}
          searchPlaceholder="Search candidates..."
          enableSearch={true} // Enable client-side search within current page data
          enableSorting={true} // Enable client-side sorting within current page data
          enablePagination={true}
          enableRefresh={true}
          initialPageSize={10}
          pageSizeOptions={[10, 20, 30, 50]}
          manualPagination={true}
          pageCount={pageCount}
          onPaginationChange={handlePaginationChange}
        />

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Candidate</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete "{deleteConfirm?.name}"? This action cannot be undone.
                All associated evaluations will also be affected.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deleteConfirm && handleDelete(deleteConfirm.id)}
                className="bg-red-600 text-white hover:bg-red-700"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default CandidateListPage;