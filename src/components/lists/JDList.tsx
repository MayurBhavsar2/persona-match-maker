import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from '@tanstack/react-query';
import { ColumnDef } from '@tanstack/react-table';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { FileText, Plus, Edit, Trash2, Users, Target } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import BasicTable from "@/components/BasicTable";
import axiosInstance from "@/lib/utils";

interface JDListItem {
  id: string;
  title: string;
  role_name: string;
  created_at: string;
  updated_at: string;
  status: 'draft' | 'active' | 'archived';
  persona_count: number;
  evaluation_count: number;
}

interface JDApiResponse {
  job_descriptions?: JDListItem[];
  data?: JDListItem[];
  total?: number;
}

interface JDListProps {
  onEdit: (jdId: string) => void;
  onCreate: () => void;
  onDelete: (jdId: string) => void;
}

const JDList = ({ onEdit, onCreate, onDelete }: JDListProps) => {
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
      role_name: jd.role || jd.role_name || 'Unknown Role',
      created_at: jd.created_at || new Date().toISOString(),
      updated_at: jd.updated_at || jd.created_at || new Date().toISOString(),
      status: jd.status || 'draft',
      persona_count: jd.persona_count || 0,
      evaluation_count: jd.evaluation_count || 0,
    }));
  }, [apiResponse]);

  // Column definitions for BasicTable
  const columns = useMemo<ColumnDef<JDListItem>[]>(
    () => [
      {
        accessorKey: 'title',
        header: 'Title & Role',
        cell: (info) => {
          const jd = info.row.original;
          return (
            <div>
              <div className="font-medium text-foreground">{jd.title}</div>
              <div className="text-sm text-muted-foreground">{jd.role_name}</div>
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
            <Users className="w-4 h-4 text-muted-foreground" />
            <span className="font-medium">{info.getValue() as number}</span>
          </div>
        ),
        enableSorting: true,
      },
      {
        accessorKey: 'evaluation_count',
        header: 'Evaluations',
        cell: (info) => (
          <div className="flex items-center justify-center space-x-1">
            <Target className="w-4 h-4 text-muted-foreground" />
            <span className="font-medium">{info.getValue() as number}</span>
          </div>
        ),
        enableSorting: true,
      },
      {
        accessorKey: 'created_at',
        header: 'Created At',
        cell: (info) => (
          <div className="text-sm text-muted-foreground">
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
                onClick={() => onEdit(jd.id)}
                className="h-8 w-8 p-0"
              >
                <Edit className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setDeleteConfirm({ id: jd.id, title: jd.title })}
                className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          );
        },
        enableSorting: false,
      },
    ],
    [onEdit]
  );

  const handleDelete = async (jdId: string) => {
    try {
      await axiosInstance.delete(`/api/v1/jd/${jdId}`);
      
      toast({
        title: "JD Deleted",
        description: "Job description has been deleted successfully.",
      });
      
      // Refetch data to update the table
      refetch();
      onDelete(jdId);
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Job Descriptions</h2>
          <p className="text-muted-foreground">Manage your job descriptions and requirements</p>
        </div>
        <Button onClick={onCreate} className="flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>Create New JD</span>
        </Button>
      </div>

      {/* JD List using BasicTable */}
      <BasicTable
        data={jds}
        columns={columns}
        isLoading={isLoading}
        isError={isError}
        error={error as Error}
        onRefresh={refetch}
        title="Job Descriptions"
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
              {/* TODO: Add dependency checking here */}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteConfirm && handleDelete(deleteConfirm.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default JDList;