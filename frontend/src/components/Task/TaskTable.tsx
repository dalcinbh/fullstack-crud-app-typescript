import React, { useCallback } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  ColumnDef,
  SortingState,
  FilterFn,
  PaginationState,
  Updater,
} from '@tanstack/react-table';
import useAppDispatch from '../../hooks/use-app.dispatch';
import { Task } from '../../interfaces/task.interface';
import { deleteTaskAsync, updateTaskStatusAsync } from '../../slices/task.slice';
import { formatDateToBR } from '../../utils/dateFormat';
import { usePaginationContext } from '../../contexts/PaginationContext';

/**
 * Props interface for the TaskTable component
 */
interface TaskTableProps {
  /** Array of task objects to display in the table */
  data: Task[];
  /** Unique identifier of the project that owns these tasks */
  projectId: number;
  /** Optional callback function executed after task updates */
  onUpdate?: () => void;
}

/**
 * Custom fuzzy filter function for searching across task table data.
 * Performs case-insensitive substring matching on task field values.
 * 
 * @param row - Table row object containing task data
 * @param columnId - Identifier for the column being filtered
 * @param value - Search term entered by user
 * @param addMeta - Function to add metadata to the filter (unused)
 * @returns Boolean indicating whether the row matches the search criteria
 */
const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
  const itemRank = row.getValue(columnId);
  return itemRank ? itemRank.toString().toLowerCase().includes(value.toLowerCase()) : false;
};

/**
 * Props interface for the TaskStatusCell component
 */
interface TaskStatusCellProps {
  /** Task object containing status information */
  task: Task;
  /** Unique identifier of the project that owns this task */
  projectId: number;
  /** Optional callback function executed after status updates */
  onUpdate?: () => void;
}

/**
 * Specialized cell component for handling task status changes with inline editing.
 * Provides dropdown selection for task status with save functionality.
 * Tracks local changes and only shows save button when modifications are pending.
 * Integrates with Redux store for status updates and error handling.
 * 
 * @param props - Configuration object containing task data, project ID, and update callback
 * @returns JSX element with status dropdown and conditional save button
 */
const TaskStatusCell: React.FC<TaskStatusCellProps> = ({ task, projectId, onUpdate }) => {
  const dispatch = useAppDispatch();
  const [status, setStatus] = React.useState(task.isCompleted);
  const [hasChanges, setHasChanges] = React.useState(false);

  /**
   * Handles status selection changes and tracks modification state.
   * Updates local state and determines if save button should be displayed.
   * 
   * @param newStatus - Boolean indicating new completion status
   */
  const handleStatusChange = (newStatus: boolean) => {
    setStatus(newStatus);
    setHasChanges(newStatus !== task.isCompleted);
  };

  /**
   * Saves status changes to the backend and updates related data.
   * Dispatches Redux action to update task status and triggers refresh callback.
   * Handles error cases with console logging for debugging.
   */
  const handleSave = async () => {
    try {
      await dispatch(updateTaskStatusAsync({
        id: task.id.toString(),
        projectId: projectId,
        isCompleted: status,
      }));
      setHasChanges(false);
      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <select
        value={status ? 'completed' : 'pending'}
        onChange={(e) => handleStatusChange(e.target.value === 'completed')}
        className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        <option value="pending">Pending</option>
        <option value="completed">Completed</option>
      </select>
      
      {hasChanges && (
        <button
          onClick={handleSave}
          className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
        >
          Save
        </button>
      )}
    </div>
  );
};

/**
 * Advanced task table component with comprehensive features for task management.
 * Built on TanStack Table library with sorting, filtering, pagination, and inline editing capabilities.
 * Features fixed height container with scrolling, sticky header, and responsive design.
 * Integrates with pagination context to maintain state across component re-renders.
 * Provides inline task status editing and deletion functionality with confirmation dialogs.
 * 
 * @param props - Configuration object containing task data, project ID, and update callback
 * @returns JSX element containing fully-featured task table with controls
 */
export function TaskTable({ data, projectId, onUpdate }: TaskTableProps) {
  const dispatch = useAppDispatch();
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = React.useState('');
  
  /** Read page size from environment variables with fallback to default value */
  const taskPageSize = Number(process.env.REACT_APP_TASK_LIST_SIZE_PAGE) || 5;
  
  /** Use pagination context to maintain page state across table instances */
  const { taskPageIndex, setTaskPageIndex } = usePaginationContext();

  /**
   * Handles task deletion with user confirmation.
   * Shows confirmation dialog before proceeding with deletion.
   * Dispatches Redux action to delete task and triggers data refresh.
   * Uses useCallback to prevent unnecessary re-renders.
   * 
   * @param task - Task object to be deleted
   */
  const handleDeleteTask = useCallback((task: Task) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      dispatch(deleteTaskAsync({
        id: task.id.toString(),
        projectId: projectId,
      }));
      if (onUpdate) {
        onUpdate();
      }
    }
  }, [dispatch, projectId, onUpdate]);

  /**
   * Memoized column definitions for the task table.
   * Defines structure, formatting, and behavior for each table column including sorting and filtering.
   * Uses React.useMemo to prevent re-creation on every render for better performance.
   */
  const columns = React.useMemo<ColumnDef<Task>[]>(
    () => [
      {
        header: 'Title',
        accessorKey: 'title',
        cell: (info) => (
          <div className="font-medium text-gray-900 max-w-xs">
            {info.getValue() as string}
          </div>
        ),
        enableSorting: true,
        enableColumnFilter: false,
        filterFn: 'includesString',
      },
      {
        header: 'Description',
        accessorKey: 'description',
        cell: (info) => (
          <div className="text-gray-600 max-w-xs truncate" title={info.getValue() as string}>
            {info.getValue() as string}
          </div>
        ),
        enableSorting: true,
        enableColumnFilter: false,
        filterFn: 'includesString',
      },
      {
        header: 'Due Date',
        accessorKey: 'dueDate',
        cell: (info) => (
          <div className="text-gray-900 text-sm">
            {formatDateToBR(info.getValue() as string | Date)}
          </div>
        ),
        enableSorting: true,
        enableColumnFilter: false,
        filterFn: 'includesString',
      },
      {
        header: 'Status',
        accessorKey: 'isCompleted',
        cell: (info) => {
          const task = info.row.original;
          return (
            <TaskStatusCell
              task={task}
              projectId={projectId}
              onUpdate={onUpdate}
            />
          );
        },
        enableSorting: true,
        enableColumnFilter: false,
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: (info) => {
          const task = info.row.original;
          return (
            <div className="flex justify-center">
              <button
                onClick={() => handleDeleteTask(task)}
                className="text-red-600 hover:text-red-800 p-1 rounded-md hover:bg-red-50 transition-colors"
                title="Delete task"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" 
                  />
                </svg>
              </button>
            </div>
          );
        },
        enableSorting: false,
        enableColumnFilter: false,
      },
    ],
    [handleDeleteTask, projectId, onUpdate]
  );

  /**
   * Main table instance configuration with all features enabled.
   * Handles state management, event handlers, and model generation for the table.
   */
  const table = useReactTable({
    data,
    columns,
    filterFns: {
      fuzzy: fuzzyFilter,
    },
    state: {
      sorting,
      globalFilter,
      pagination: {
        pageIndex: taskPageIndex,
        pageSize: taskPageSize,
      },
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: (updater: Updater<PaginationState>) => {
      const newPaginationState = typeof updater === 'function' 
        ? updater({ pageIndex: taskPageIndex, pageSize: taskPageSize })
        : updater;
      setTaskPageIndex(newPaginationState.pageIndex);
    },
    globalFilterFn: fuzzyFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    autoResetPageIndex: false,
  });

  /** Calculate pagination display values for user feedback */
  const totalPages = table.getPageCount();
  const currentPage = table.getState().pagination.pageIndex;
  const showPagination = totalPages > 1;

  return (
    <div className="w-full">
      {/* Search Input */}
      <div className="mb-4">
        <input
          value={globalFilter ?? ''}
          onChange={(e) => setGlobalFilter(String(e.target.value))}
          className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Search tasks..."
        />
      </div>

      {/* Table Container with Fixed Height */}
      <div className="max-h-[500px] overflow-y-auto shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
        <table className="min-w-full divide-y divide-gray-300">
          <thead className="bg-gray-50 sticky top-0 z-10">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <div className="flex items-center space-x-1">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                      <span className="text-gray-400">
                        {{
                          asc: ' ↑',
                          desc: ' ↓',
                        }[header.column.getIsSorted() as string] ?? null}
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="hover:bg-gray-50">
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-4 flex items-center justify-between">
        <div className="text-sm text-gray-500">
          Showing{' '}
          {showPagination 
            ? `${currentPage * taskPageSize + 1} to ${Math.min((currentPage + 1) * taskPageSize, table.getFilteredRowModel().rows.length)}`
            : table.getFilteredRowModel().rows.length
          }{' '}
          of {table.getFilteredRowModel().rows.length} results
        </div>
        
        {showPagination && (
          <div className="flex items-center space-x-2">
            <button
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
              className="px-3 py-1 text-sm bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {'<<'}
            </button>
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="px-3 py-1 text-sm bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {'<'}
            </button>
            <span className="px-3 py-1 text-sm text-gray-700">
              Page {currentPage + 1} of {totalPages}
            </span>
            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="px-3 py-1 text-sm bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {'>'}
            </button>
            <button
              onClick={() => table.setPageIndex(totalPages - 1)}
              disabled={!table.getCanNextPage()}
              className="px-3 py-1 text-sm bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {'>>'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}; 