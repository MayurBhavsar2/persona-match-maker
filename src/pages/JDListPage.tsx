import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ColumnDef } from '@tanstack/react-table';
import { useNavigate } from 'react-router-dom';
import { Edit, Trash2, Users, Target, Plus } from 'lucide-react';
import BasicTable from '@/components/BasicTable';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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

// Types
interface JD {
  id: string;
  title: string;
  role: string;
  role_name: string;
  created_at: string;
  updated_at: string;
  status: 'draft' | 'active' | 'archived';
  persona_count?: number;
  evaluation_count?: number;
  description?: string;
}

interface JDApiResponse {
  job_descriptions?: JD[];
  data?: JD[];
  total?: number;
  page?: number;
  size?: number;
}

const JDListPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; title: string } | null>(null);

  // Fetch JDs using React Query with 30 minutes caching
  const { data: apiResponse, isLoading, isError, error, refetch } = useQuery<JDApiResponse>({
    queryKey: ['jds'],
    queryFn: async () => {
      const response = await axiosInstance.get('/api/v1/jd/');
      return response.data;
    },
    retry: 3,
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });

  // Transform API data
  const jds = useMemo(() => {
    const rawData = apiResponse?.job_descriptions || apiResponse?.data || apiResponse || [];
    if (!Array.isArray(rawData)) return [];

    return rawData.map((jd: any) => ({
      id: jd.id,
      title: jd.title || jd.role || 'Untitled JD',
      role: jd.role || jd.role_name || 'Unknown Role',
      role_name: jd.role_name || jd.role || 'Unknown Role',
      created_by: jd.created_by || 'Unknown User',
      created_at: jd.created_at || new Date().toISOString(),
      updated_at: jd.updated_at || jd.created_at || new Date().toISOString(),
      status: jd.status || 'draft',
      persona_count: jd.persona_count || 0,
      evaluation_count: jd.evaluation_count || 0,
      description: jd.description || '',
    }));
  }, [apiResponse]);

  // Column definitions
  const columns = useMemo<ColumnDef<JD>[]>(
    () => [
      {
        accessorKey: 'title',
        header: 'Title & Role',
        cell: (info) => {
          const jd = info.row.original;
          return (
            <div>
              <div className="font-medium text-gray-900">{jd.title}</div>
              <div className="text-sm text-gray-500">{jd.role_name}</div>
            </div>
          );
        },
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: (info) => {
          const status = info.getValue() as string;
          const variants = {
            draft: 'secondary',
            active: 'default',
            archived: 'outline'
          } as const;

          return (
            <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Badge>
          );
        },
      },
      {
        accessorKey: 'persona_count',
        header: 'Personas',
        cell: (info) => (
          <div className="flex items-center justify-center space-x-1">
            <Users className="w-4 h-4 text-gray-400" />
            <span className="font-medium">{info.getValue() as number}</span>
          </div>
        ),
        enableSorting: true,
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
        header: 'Created At',
        cell: (info) => (
          <div className="text-sm text-gray-600">
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
          <div className="text-sm text-gray-600">
            {new Date(info.getValue() as string).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}
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
                className="h-8 w-8 p-0"
                title="Edit JD"
              >
                <Edit className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setDeleteConfirm({ id: jd.id, title: jd.title })}
                className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
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
      <div className="max-w-7xl mx-auto p-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
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

        {/* Table */}
        <BasicTable
          data={jds}
          columns={columns}
          isLoading={isLoading}
          isError={isError}
          error={error as Error}
          onRefresh={handleRefresh}
          title=""
          description={`${jds.length} total job descriptions`}
          searchPlaceholder="Search job descriptions..."
          enableSearch={true}
          enableSorting={true}
          enablePagination={true}
          enableRefresh={true}
          initialPageSize={10}
          pageSizeOptions={[10, 20, 30, 50]}
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