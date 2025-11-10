import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ColumnDef } from '@tanstack/react-table';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import BasicTable from '@/components/BasicTable';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
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
interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  is_active: boolean;
  role_id: string;
  role_name: string;
  created_at: string;
  updated_at: string;
}

interface UsersApiResponse {
  users?: User[];
  data?: User[];
  total?: number;
}

const UserListPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [deactivateConfirm, setDeactivateConfirm] = useState<{ id: string; name: string; currentStatus: boolean } | null>(null);

  // Fetch users using React Query with 30 minutes caching
  const { data: apiResponse, isLoading, isError, error, refetch } = useQuery<UsersApiResponse>({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await axiosInstance.get('/api/v1/auth/users');
      return response.data;
    },
    retry: 3,
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });

  // Transform API data
  const users = useMemo(() => {
    const rawData = apiResponse?.users || apiResponse?.data || apiResponse || [];
    if (!Array.isArray(rawData)) return [];

    return rawData.map((user: any) => ({
      id: user.id,
      email: user.email || '',
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      phone: user.phone || '',
      is_active: user.is_active ?? true,
      role_id: user.role_id || '',
      role_name: user.role_name || 'User',
      created_at: user.created_at || new Date().toISOString(),
      updated_at: user.updated_at || user.created_at || new Date().toISOString(),
    }));
  }, [apiResponse]);

  // Handle toggle change for user active status
  const handleToggleChange = (userId: string, newActiveStatus: boolean, userName: string) => {
    // If user is being deactivated, show confirmation dialog
    if (!newActiveStatus) {
      setDeactivateConfirm({ 
        id: userId, 
        name: userName, 
        currentStatus: !newActiveStatus 
      });
    } else {
      // If user is being activated, proceed directly
      performStatusUpdate(userId, newActiveStatus);
    }
  };

  // Perform the actual status update
  const performStatusUpdate = async (userId: string, newActiveStatus: boolean) => {
    try {
      await axiosInstance.patch(`/api/v1/auth/users/${userId}`, {
        is_active: newActiveStatus
      });

      toast({
        title: "User Status Updated",
        description: `User has been ${newActiveStatus ? 'activated' : 'deactivated'} successfully.`,
      });

      // Refetch data to update the table
      refetch();
    } catch (error: any) {
      console.error("Error updating user status:", error);
      toast({
        title: "Update failed",
        description: error.response?.data?.message || "Could not update user status. Please try again.",
        variant: "destructive",
      });
    }
    setDeactivateConfirm(null);
  };

  // Column definitions
  const columns = useMemo<ColumnDef<User>[]>(
    () => [
      {
        id: 'name',
        header: 'Name',
        cell: (info) => {
          const user = info.row.original;
          const fullName = `${user.first_name} ${user.last_name}`.trim();
          return (
            <div className="font-medium text-gray-900 capitalize">
              {fullName || 'N/A'}
            </div>
          );
        },
        accessorFn: (row) => `${row.first_name} ${row.last_name}`.trim(),
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
        accessorKey: 'phone',
        header: 'Phone',
        cell: (info) => (
          <div className="text-gray-600">
            {info.getValue() as string || 'N/A'}
          </div>
        ),
      },
      {
        accessorKey: 'role_name',
        header: 'Role',
        cell: (info) => (
          <span className="inline-flex items-center capitalize">
            {info.getValue() as string}
          </span>
        ),
      },
      {
        id: 'status',
        header: 'Status',
        cell: (info) => {
          const user = info.row.original;
          return (
            <div className="flex items-center space-x-2">
              <Switch
                checked={user.is_active}
                onCheckedChange={(checked) => handleToggleChange(user.id, checked, `${user.first_name} ${user.last_name}`.trim())}
                aria-label={`Toggle user ${user.first_name} ${user.last_name} status`}
              />
              {/* <span className={`text-sm ${user.is_active ? 'text-green-600' : 'text-red-600'}`}>
                {user.is_active ? 'Active' : 'Inactive'}
              </span> */}
            </div>
          );
        },
        enableSorting: false,
      },
    ],
    [handleToggleChange]
  );

  // Handlers
  const handleCreate = () => {
    navigate('/users/create');
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
              <h1 className="text-3xl font-bold text-gray-900">Users</h1>
              <p className="mt-2 text-gray-600">
                Manage system users and their permissions
              </p>
            </div>
            <Button onClick={handleCreate} className="flex items-center space-x-2">
              <Plus className="w-4 h-4" />
              <span>Add User</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-8 py-4">
        {/* Table */}
        <BasicTable
          data={users}
          columns={columns}
          isLoading={isLoading}
          isError={isError}
          error={error as Error}
          onRefresh={handleRefresh}
          title=""
          description={`${users.length || 0}`}
          searchPlaceholder="Search users..."
          enableSearch={true}
          enableSorting={true}
          enablePagination={true}
          enableRefresh={true}
          initialPageSize={10}
          pageSizeOptions={[10, 20, 30, 50]}
        />

        {/* Deactivate Confirmation Dialog */}
        <AlertDialog open={!!deactivateConfirm} onOpenChange={() => setDeactivateConfirm(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Deactivate User</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to deactivate "{deactivateConfirm?.name}"? 
                This will prevent the user from accessing the system until they are reactivated.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deactivateConfirm && performStatusUpdate(deactivateConfirm.id, false)}
                className="bg-red-600 text-white hover:bg-red-700"
              >
                Deactivate
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default UserListPage;