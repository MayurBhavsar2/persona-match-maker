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
  job_description_id: string;
  name: string;
  role_name: string;
  role_id: string;
  created_at: string;
  created_by: string;
  categories: any[];
  persona_notes: string;
}

interface PersonaApiResponse {
  personas: Persona[];
  total: number;
  page: number;
  size: number;
  has_next: boolean;
  has_prev: boolean;
}

const PersonaListPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string } | null>(null);
  
  // Pagination state
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  // Fetch personas using React Query with server-side pagination
  const { data: apiResponse, isLoading, isError, error, refetch } = useQuery<PersonaApiResponse>({
    queryKey: ['personas', pagination.pageIndex, pagination.pageSize],
    queryFn: async () => {
      const response = await axiosInstance.get('/api/v1/persona/', {
        params: {
          page: pagination.pageIndex + 1, // API expects 1-based page numbers
          size: pagination.pageSize,
        },
      });
      return response.data;
    },
    retry: 3,
    staleTime: 30 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    keepPreviousData: true, // Keep previous data while fetching new data
  });

  // Transform API data
  const personas = useMemo(() => {
    const rawData = apiResponse?.personas || [];
    if (!Array.isArray(rawData)) return [];

    return rawData.map((persona: any) => ({
      id: persona.id,
      job_description_id: persona.job_description_id || '',
      name: persona.name || 'Unnamed Persona',
      role_name: persona.role_name || 'Unknown Role',
      role_id: persona.role_id || '',
      created_at: persona.created_at || new Date().toISOString(),
      created_by: persona.created_by || 'Unknown',
      categories: persona.categories || [],
      persona_notes: persona.persona_notes || '',
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
  const columns = useMemo<ColumnDef<Persona>[]>(
    () => [
        {
            accessorKey: 'role_name',
            header: 'Role Name',
            cell: (info) => (
              <span className="inline-flex items-center">
                {info.getValue() as string}
              </span>
            ),
          },
      {
        accessorKey: 'name',
        header: 'Persona Name',
        cell: (info) => (
          <div className="text-gray-900">
            {info.getValue() as string}
          </div>
        ),
      },
      
      {
        accessorKey: 'created_by',
        header: 'Created By',
        cell: (info) => (
          <div className="text-gray-600">
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
        id: 'actions',
        header: 'Actions',
        cell: (info) => {
          const persona = info.row.original;
          return (
            <div className="flex items-center justify-end space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleEdit(persona.id)}
                className="h-6 w-6 p-0"
                title="Edit Persona"
              >
                <Edit className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setDeleteConfirm({ id: persona.id, name: persona.name })}
                className="h-6 w-6 p-0 hover:bg-red-50 hover:text-red-600"
                title="Delete Persona"
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
    navigate('/persona/create');
  };

  const handleEdit = (personaId: string) => {
    navigate(`/persona/edit/${personaId}`);
  };

  const handleDelete = async (personaId: string) => {
    try {
      await axiosInstance.delete(`/api/v1/persona/${personaId}`);

      toast({
        title: "Persona Deleted",
        description: "Persona has been deleted successfully.",
      });

      // Refetch data to update the table
      refetch();
    } catch (error: any) {
      console.error("Error deleting persona:", error);
      toast({
        title: "Delete failed",
        description: error.response?.data?.message || "Could not delete the persona. Please try again.",
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
      <div className="sticky top-[80px] z-30 bg-gray-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Personas</h1>
              <p className="mt-2 text-gray-600">
                Manage your evaluation personas and criteria
              </p>
            </div>
            <Button onClick={handleCreate} className="flex items-center space-x-2">
              <Plus className="w-4 h-4" />
              <span>Create New Persona</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-8 py-4">
        {/* Table */}
        <BasicTable
          data={personas}
          columns={columns}
          isLoading={isLoading}
          isError={isError}
          error={error as Error}
          onRefresh={handleRefresh}
          title=""
          description={`Total: ${apiResponse?.total || 0} personas`}
          searchPlaceholder="Search personas..."
          enableSearch={true}
          enableSorting={true}
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
              <AlertDialogTitle>Delete Persona</AlertDialogTitle>
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

export default PersonaListPage;