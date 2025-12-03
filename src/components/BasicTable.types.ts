  import { ColumnDef, PaginationState, SortingState  } from '@tanstack/react-table';

  export interface BasicTableProps<T> {
    /** The data array to display in the table */
    data: T[];
    
    /** Column definitions for the table */
    columns: ColumnDef<T>[];
    
    /** Loading state */
    isLoading?: boolean;
    
    /** Error state */
    isError?: boolean;
    
    /** Error object */
    error?: Error | null;
    
    /** Refresh function callback */
    onRefresh?: () => void;
    
    /** Table title */
    title?: string;
    
    /** Table description */
    description?: string;
    
    /** Search input placeholder text */
    searchPlaceholder?: string;
    
    state?: {
      pagination?: PaginationState;
    };
    
    /** Enable/disable search functionality */
    enableSearch?: boolean;
    
    /** Enable/disable sorting functionality */
    enableSorting?: boolean;
    
    /** Enable/disable pagination */
    enablePagination?: boolean;

    initialSorting?: SortingState;
    
    /** Enable/disable refresh button */
    enableRefresh?: boolean;
    
    /** Initial page size */
    initialPageSize?: number;
    
    /** Available page size options */
    pageSizeOptions?: number[];
    
    /** Use manual pagination (for server-side pagination) */
    manualPagination?: boolean;
    
    /** Total page count (required for manual pagination) */
    pageCount?: number;
    
    /** Pagination change callback (for manual pagination) */
    onPaginationChange?: (pagination: PaginationState) => void;
    
    /** Additional CSS classes */
    className?: string;
  }

  export interface TableColumn<T> extends ColumnDef<T> {
    /** Column header text */
    header: string;
    
    /** Data accessor key */
    accessorKey?: keyof T;
    
    /** Custom cell renderer */
    cell?: (info: any) => React.ReactNode;
    
    /** Enable/disable sorting for this column */
    enableSorting?: boolean;
  }