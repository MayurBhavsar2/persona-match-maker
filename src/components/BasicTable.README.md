# BasicTable Component

A reusable table component built with TanStack Table that provides pagination, filtering, search, and sorting functionality out of the box.

## Features

- ✅ **Pagination** - Client-side and server-side pagination support
- ✅ **Search** - Global search across all columns
- ✅ **Sorting** - Column-based sorting with visual indicators
- ✅ **Filtering** - Built-in filtering capabilities
- ✅ **Loading States** - Loading and error state handling
- ✅ **Responsive** - Mobile-friendly design
- ✅ **Customizable** - Highly configurable with sensible defaults
- ✅ **TypeScript** - Full TypeScript support
- ✅ **Shadcn/ui** - Uses shadcn/ui components for consistent styling

## Basic Usage

```tsx
import React, { useMemo } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import BasicTable from '@/components/BasicTable';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

const MyComponent = () => {
  const data: User[] = [
    { id: '1', name: 'John Doe', email: 'john@example.com', role: 'Admin' },
    { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'User' },
  ];

  const columns = useMemo<ColumnDef<User>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Name',
      },
      {
        accessorKey: 'email',
        header: 'Email',
      },
      {
        accessorKey: 'role',
        header: 'Role',
      },
    ],
    []
  );

  return (
    <BasicTable
      data={data}
      columns={columns}
      title="Users"
      description="Manage your users"
    />
  );
};
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `data` | `T[]` | **Required** | Array of data to display |
| `columns` | `ColumnDef<T>[]` | **Required** | Column definitions |
| `isLoading` | `boolean` | `false` | Show loading state |
| `isError` | `boolean` | `false` | Show error state |
| `error` | `Error \| null` | `null` | Error object to display |
| `onRefresh` | `() => void` | `undefined` | Refresh callback function |
| `title` | `string` | `undefined` | Table title |
| `description` | `string` | `undefined` | Table description |
| `searchPlaceholder` | `string` | `"Search..."` | Search input placeholder |
| `enableSearch` | `boolean` | `true` | Enable search functionality |
| `enableSorting` | `boolean` | `true` | Enable sorting functionality |
| `enablePagination` | `boolean` | `true` | Enable pagination |
| `enableRefresh` | `boolean` | `false` | Show refresh button |
| `initialPageSize` | `number` | `10` | Initial page size |
| `pageSizeOptions` | `number[]` | `[10, 20, 30, 40, 50]` | Page size options |
| `manualPagination` | `boolean` | `false` | Use server-side pagination |
| `pageCount` | `number` | `undefined` | Total pages (for manual pagination) |
| `onPaginationChange` | `(pagination: PaginationState) => void` | `undefined` | Pagination change callback |
| `className` | `string` | `""` | Additional CSS classes |

## Advanced Usage

### Custom Cell Rendering

```tsx
const columns = useMemo<ColumnDef<User>[]>(
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
      accessorKey: 'status',
      header: 'Status',
      cell: (info) => {
        const status = info.getValue() as string;
        return (
          <span
            className={`px-2 py-1 rounded-full text-xs ${
              status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}
          >
            {status}
          </span>
        );
      },
    },
  ],
  []
);
```

### Server-Side Pagination

```tsx
const [pagination, setPagination] = useState({
  pageIndex: 0,
  pageSize: 10,
});

const { data, isLoading } = useQuery({
  queryKey: ['users', pagination.pageIndex, pagination.pageSize],
  queryFn: () => fetchUsers(pagination.pageIndex + 1, pagination.pageSize),
});

return (
  <BasicTable
    data={data?.users || []}
    columns={columns}
    isLoading={isLoading}
    manualPagination={true}
    pageCount={data ? Math.ceil(data.total / pagination.pageSize) : 0}
    onPaginationChange={setPagination}
  />
);
```

### With Loading and Error States

```tsx
const { data, isLoading, isError, error, refetch } = useQuery({
  queryKey: ['users'],
  queryFn: fetchUsers,
});

return (
  <BasicTable
    data={data || []}
    columns={columns}
    isLoading={isLoading}
    isError={isError}
    error={error}
    onRefresh={refetch}
    enableRefresh={true}
    title="Users"
    description={`${data?.length || 0} total users`}
  />
);
```

### Minimal Configuration

```tsx
// Just the essentials
<BasicTable
  data={data}
  columns={columns}
  enableSearch={false}
  enableRefresh={false}
  enablePagination={false}
/>
```

## Column Definition Examples

### Basic Column
```tsx
{
  accessorKey: 'name',
  header: 'Full Name',
}
```

### Custom Cell with Formatting
```tsx
{
  accessorKey: 'createdAt',
  header: 'Created',
  cell: (info) => (
    <div className="text-sm text-gray-600">
      {new Date(info.getValue() as string).toLocaleDateString()}
    </div>
  ),
}
```

### Non-Sortable Column
```tsx
{
  accessorKey: 'actions',
  header: 'Actions',
  enableSorting: false,
  cell: (info) => (
    <div className="flex gap-2">
      <button>Edit</button>
      <button>Delete</button>
    </div>
  ),
}
```

### Computed Column
```tsx
{
  id: 'fullName',
  header: 'Full Name',
  cell: (info) => {
    const row = info.row.original;
    return `${row.firstName} ${row.lastName}`;
  },
}
```

## Styling

The component uses Tailwind CSS classes and shadcn/ui components. You can customize the appearance by:

1. **Using the className prop** to add additional styles
2. **Modifying the shadcn/ui theme** for global changes
3. **Customizing cell renderers** for specific column styling

## Dependencies

- `@tanstack/react-table` - Table functionality
- `lucide-react` - Icons
- `shadcn/ui components` - UI components (Table, Input, Button, Select)
- `tailwindcss` - Styling

## Migration from UserList

If you're migrating from the existing UserList component:

1. Extract your column definitions
2. Replace the table implementation with BasicTable
3. Configure the props based on your needs
4. Handle pagination changes if using server-side pagination

```tsx
// Before (UserList pattern)
const table = useReactTable({
  data: filteredData,
  columns,
  // ... lots of configuration
});

// After (BasicTable)
<BasicTable
  data={data}
  columns={columns}
  title="Candidates"
  description={`${data?.total || 0} total candidates`}
  manualPagination={true}
  pageCount={data ? Math.ceil(data.total / pagination.pageSize) : 0}
  onPaginationChange={setPagination}
/>
```