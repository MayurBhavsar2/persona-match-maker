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
  id: string;
  name: string;
}

interface JD {
  id: string;
  title: string;
  role: string;
  role_name: string;
  created_at: string;
  created_by: string;
  created_by_name: string;
  updated_at: string;
  status: 'draft' | 'active' | 'archived';
  persona_count?: number;
  personas?: Persona[];
  evaluation_count?: number;
  description?: string;
}

interface JDApiResponse {
  jds: JD[];
  total: number;
  page: number;
  size: number;
  has_next: boolean;
  has_prev: boolean;
}

const JDListPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; title: string } | null>(null);
  const userData = JSON.parse(localStorage.getItem("user") || "{}");
  
  // Pagination state
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  // Fetch JDs using React Query with server-side pagination
  const { data: apiResponse, isLoading, isError, error, refetch } = useQuery<JDApiResponse>({
    queryKey: ['jds', pagination.pageIndex, pagination.pageSize],
    queryFn: async () => {
      const response = await axiosInstance.get('/api/v1/jd/', {
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
  const jds = useMemo(() => {
    const rawData = apiResponse?.jds || [];
    if (!Array.isArray(rawData)) return [];

    return rawData.map((jd: any) => ({
      id: jd.id,
      title: jd.title || jd.role || 'Untitled JD',
      role: jd.role || jd.role_name || 'Unknown Role',
      role_name: jd.role_name || jd.role || 'Unknown Role',
      created_by: jd.created_by || 'Unknown User',
      created_by_name: jd.created_by_name || 'Unknown User',
      created_at: jd.created_at || new Date().toISOString(),
      updated_at: jd.updated_at || jd.created_at || new Date().toISOString(),
      status: jd.status || 'draft',
      persona_count: jd.persona_count || 0,
      personas: jd.personas || [],
      evaluation_count: jd.evaluation_count || 0,
      description: jd.description || '',
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
  const columns = useMemo<ColumnDef<JD>[]>(
    () => [
      {
        accessorKey: 'role_name',
        header: 'Role',
        cell: (info) => {
          const jd = info.row.original;
          return (
            <div>
              <div className="font-medium text-gray-900">{jd.role_name}</div>
            </div>
          );
        },
      },
      {
        accessorKey: 'title',
        header: 'JD Title',
        cell: (info) => {
          const jd = info.row.original;
          return (
            <div>
              <div className="font-medium text-gray-900">{jd.title}</div>
            </div>
          );
        },
      },
      // {
      //   accessorKey: 'status',
      //   header: 'Status',
      //   cell: (info) => {
      //     const status = info.getValue() as string;
      //     const variants = {
      //       draft: 'secondary',
      //       active: 'default',
      //       archived: 'outline'
      //     } as const;

      //     return (
      //       <div>
      //         {status.charAt(0).toUpperCase() + status.slice(1)}
      //       </div>
      //     );
      //   },
      // },
      {
        id: 'personas',
        header: 'Personas',
        cell: (info) => {
          const jd = info.row.original;
          const personaCount = jd.personas?.length || jd.persona_count || 0;
          const personaNames = jd.personas?.map(p => p.persona_name) || [];
          
          return (
            <div className="flex items-center justify-center">
              {personaCount > 0 ? (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="font-medium text-blue-600 cursor-help">
                        {personaCount}
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="max-w-xs">
                        <p className="font-semibold mb-1">Personas:</p>
                        <ul className="text-sm">
                          {personaNames.length > 0 ? (
                            personaNames.map((name, index) => (
                              <li key={index} className="truncate">
                                • {name}
                              </li>
                            ))
                          ) : (
                            <li className="text-gray-500">No persona details available</li>
                          )}
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
          const aCount = rowA.original.personas?.length || rowA.original.persona_count || 0;
          const bCount = rowB.original.personas?.length || rowB.original.persona_count || 0;
          return aCount - bCount;
        },
      },
      // {
      //   accessorKey: 'evaluation_count',
      //   header: 'Evaluations',
      //   cell: (info) => (
      //     <div className="flex items-center justify-center space-x-1">
      //       <Target className="w-4 h-4 text-gray-400" />
      //       <span className="font-medium">{info.getValue() as number}</span>
      //     </div>
      //   ),
      //   enableSorting: true,
      // },
      {
        accessorKey: 'created_by_name',
        header: 'Created By',
        cell: (info) => (
          <div className="text-gray-600 capitalize">
            {info.getValue() as string}
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
          const jd = info.row.original;
          return (
            <div className="flex items-center justify-end space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleEdit(jd.id)}
                className="h-6 w-6 p-0"
                title="Edit JD"
              >
                <Edit className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                disabled={userData?.role_name !== "Admin"}
                onClick={() => setDeleteConfirm({ id: jd.id, title: jd.title })}
                className="h-6 w-6 p-0 hover:bg-red-50 hover:text-red-600"
                title="Delete JD"
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
    navigate('/jd-upload');
  };

  const handleEdit = (jdId: string) => {
    navigate(`/jd-upload?id=${jdId}`);
  };

  const handleDelete = async (jdId: string) => {
    try {
      await axiosInstance.delete(`/api/v1/jd/${jdId}`);

      toast({
        title: "JD Deleted",
        description: "Job description has been deleted successfully.",
      });

      // Refetch data to update the table
      refetch();
    } catch (error: any) {
      console.error("Error deleting JD:", error);
      toast({
        title: "Delete failed",
        description: error.response?.data?.message || "Could not delete the job description. Please try again.",
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
              <h1 className="text-3xl font-bold text-gray-900">Job Descriptions</h1>
              <p className="mt-2 text-gray-600">
                Manage your job descriptions and requirements
              </p>
            </div>
            <Button onClick={handleCreate} className="flex items-center space-x-2">
              <Plus className="w-4 h-4" />
              <span>Create New JD</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-8 py-4">
        {/* Table */}
        <BasicTable
          data={jds}
          columns={columns}
          isLoading={isLoading}
          isError={isError}
          error={error as Error}
          onRefresh={handleRefresh}
          title=""
          description={`${apiResponse?.total || 0}`}
          searchPlaceholder="Search job descriptions..."
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
              <AlertDialogTitle>Delete Job Description</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete "{deleteConfirm?.title}"? This action cannot be undone.
                All associated personas and evaluations will also be affected.
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

export default JDListPage;