import React, { useMemo } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import BasicTable from './BasicTable';

// Example data type
interface ExampleUser {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

// Example usage component
const BasicTableExample: React.FC = () => {
  // Example data
  const data: ExampleUser[] = [
    {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      role: 'Admin',
      status: 'active',
      createdAt: '2024-01-15',
    },
    {
      id: '2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      role: 'User',
      status: 'active',
      createdAt: '2024-01-16',
    },
    // Add more example data as needed
  ];

  // Column definitions
  const columns = useMemo<ColumnDef<ExampleUser>[]>(
    () => [
      {
        accessorKey: 'name',
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
        accessorKey: 'role',
        header: 'Role',
        cell: (info) => (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {info.getValue() as string}
          </span>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: (info) => {
          const status = info.getValue() as string;
          return (
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                status === 'active'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              {status}
            </span>
          );
        },
      },
      {
        accessorKey: 'createdAt',
        header: 'Created On',
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

  const handleRefresh = () => {
    console.log('Refreshing data...');
    // Implement your refresh logic here
  };

  return (
    <div className="p-8">
      {/* Basic usage */}
      <BasicTable
        data={data}
        columns={columns}
        title="Users"
        description={`${data.length} total users`}
        searchPlaceholder="Search users..."
        enableSearch={true}
        enableSorting={true}
        enablePagination={true}
        enableRefresh={true}
        onRefresh={handleRefresh}
        initialPageSize={10}
        pageSizeOptions={[5, 10, 20, 50]}
      />

      {/* Minimal usage */}
      <div className="mt-8">
        <BasicTable
          data={data}
          columns={columns}
          enableSearch={false}
          enableRefresh={false}
          title="Simple Table"
        />
      </div>

      {/* Loading state example */}
      <div className="mt-8">
        <BasicTable
          data={[]}
          columns={columns}
          isLoading={true}
          title="Loading Table"
        />
      </div>

      {/* Error state example */}
      <div className="mt-8">
        <BasicTable
          data={[]}
          columns={columns}
          isError={true}
          error={new Error('Failed to load data')}
          title="Error Table"
        />
      </div>
    </div>
  );
};

export default BasicTableExample;