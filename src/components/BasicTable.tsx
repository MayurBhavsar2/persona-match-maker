import React, { useState, useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  flexRender,
  SortingState,
  PaginationState,
} from '@tanstack/react-table';
import { Search, ChevronUp, ChevronDown, ChevronsUpDown, RefreshCw } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { BasicTableProps } from './BasicTable.types';

function BasicTable<T>({
  data,
  columns,
  isLoading = false,
  isError = false,
  error = null,
  onRefresh,
  title,
  description,
  searchPlaceholder = "Search...",
  enableSearch = true,
  enableSorting = true,
  enablePagination = true,
  enableRefresh = false,
  initialPageSize = 10,
  pageSizeOptions = [10, 20, 30, 40, 50],
  manualPagination = false,
  pageCount,
  onPaginationChange,
  className = "",
}: BasicTableProps<T>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: initialPageSize,
  });

  // Handle pagination changes
  const handlePaginationChange = (updater: any) => {
    const newPagination = typeof updater === 'function' ? updater(pagination) : updater;
    setPagination(newPagination);
    if (onPaginationChange) {
      onPaginationChange(newPagination);
    }
  };

  // Filter data based on search (client-side filtering)
  const filteredData = useMemo(() => {
    if (!enableSearch || !globalFilter) return data;

    return data.filter((item: any) => {
      const searchStr = globalFilter.toLowerCase();
      return Object.values(item).some((value: any) => {
        if (value === null || value === undefined) return false;
        return String(value).toLowerCase().includes(searchStr);
      });
    });
  }, [data, globalFilter, enableSearch]);

  // Table instance
  const table = useReactTable({
    data: enableSearch ? filteredData : data,
    columns,
    state: {
      sorting: enableSorting ? sorting : [],
      globalFilter: enableSearch ? globalFilter : '',
      pagination: enablePagination ? pagination : { pageIndex: 0, pageSize: data.length },
    },
    onSortingChange: enableSorting ? setSorting : undefined,
    onGlobalFilterChange: enableSearch ? setGlobalFilter : undefined,
    onPaginationChange: enablePagination ? handlePaginationChange : undefined,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: enableSorting ? getSortedRowModel() : undefined,
    getFilteredRowModel: enableSearch && !manualPagination ? getFilteredRowModel() : undefined,
    getPaginationRowModel: enablePagination ? getPaginationRowModel() : undefined,
    manualPagination,
    pageCount: manualPagination ? pageCount : undefined,
  });

  return (
    <div className={`bg-white rounded-lg shadow ${className}`}>
      {/* Header */}
      {(title || description || enableSearch || enableRefresh) && (
        <div className="px-6 py-5 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              {title && (
                <h2 className="text-2xl font-semibold text-gray-900">{title}</h2>
              )}
              {description && (
                <p className="mt-1 text-sm text-gray-500">{description}</p>
              )}
            </div>
            {enableRefresh && onRefresh && (
              <Button
                onClick={onRefresh}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </Button>
            )}
          </div>

          {/* Search Bar */}
          {enableSearch && (
            <div className="mt-4 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <Input
                type="text"
                value={globalFilter ?? ''}
                onChange={(e) => setGlobalFilter(e.target.value)}
                placeholder={searchPlaceholder}
                className="pl-10"
              />
            </div>
          )}
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-500">Loading...</div>
          </div>
        ) : isError ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-red-500">Error: {error?.message || 'Something went wrong'}</div>
          </div>
        ) : (
          <div className="border border-gray-300 rounded-md">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id} className="border-b border-gray-300">
                    {headerGroup.headers.map((header, index) => (
                      <TableHead 
                        key={header.id} 
                        className={`text-center align-middle border-r border-gray-300 ${
                          index === headerGroup.headers.length - 1 ? 'border-r-0' : ''
                        }`}
                      >
                        {header.isPlaceholder ? null : (
                          <div
                            className={
                              enableSorting && header.column.getCanSort()
                                ? 'flex items-center justify-center gap-2 cursor-pointer select-none'
                                : 'flex items-center justify-center'
                            }
                            onClick={
                              enableSorting ? header.column.getToggleSortingHandler() : undefined
                            }
                          >
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                            {enableSorting && header.column.getCanSort() && (
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
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows.length === 0 ? (
                  <TableRow className="border-b border-gray-300">
                    <TableCell colSpan={columns.length} className="text-center align-middle py-8">
                      No data available
                    </TableCell>
                  </TableRow>
                ) : (
                  table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id} className="border-b border-gray-300">
                      {row.getVisibleCells().map((cell, index) => (
                        <TableCell 
                          key={cell.id} 
                          className={`text-center align-middle border-r border-gray-300 ${
                            index === row.getVisibleCells().length - 1 ? 'border-r-0' : ''
                          }`}
                        >
                          <div className="flex items-center justify-center min-h-[2.5rem]">
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </div>
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {enablePagination && !isLoading && !isError && (
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-700">
              Page {pagination.pageIndex + 1} of {table.getPageCount()}
            </span>
            <Select
              value={pagination.pageSize.toString()}
              onValueChange={(value) => {
                handlePaginationChange({
                  ...pagination,
                  pageSize: Number(value),
                  pageIndex: 0,
                });
              }}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {pageSizeOptions.map((pageSize) => (
                  <SelectItem key={pageSize} value={pageSize.toString()}>
                    Show {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-1">
            {/* First Page */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePaginationChange({ ...pagination, pageIndex: 0 })}
              disabled={pagination.pageIndex === 0}
              title="First page"
            >
              «
            </Button>

            {/* Previous Page */}
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                handlePaginationChange({
                  ...pagination,
                  pageIndex: pagination.pageIndex - 1,
                })
              }
              disabled={pagination.pageIndex === 0}
              title="Previous page"
            >
              ‹
            </Button>

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
                  <Button
                    key={page}
                    variant={pagination.pageIndex === page ? "default" : "outline"}
                    size="sm"
                    onClick={() =>
                      handlePaginationChange({ ...pagination, pageIndex: page })
                    }
                  >
                    {page + 1}
                  </Button>
                ) : (
                  <span key={`ellipsis-${idx}`} className="px-2 py-1 text-gray-500">
                    {page}
                  </span>
                )
              );
            })()}

            {/* Next Page */}
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                handlePaginationChange({
                  ...pagination,
                  pageIndex: pagination.pageIndex + 1,
                })
              }
              disabled={pagination.pageIndex >= table.getPageCount() - 1}
              title="Next page"
            >
              ›
            </Button>

            {/* Last Page */}
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                handlePaginationChange({
                  ...pagination,
                  pageIndex: table.getPageCount() - 1,
                })
              }
              disabled={pagination.pageIndex >= table.getPageCount() - 1}
              title="Last page"
            >
              »
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default BasicTable;