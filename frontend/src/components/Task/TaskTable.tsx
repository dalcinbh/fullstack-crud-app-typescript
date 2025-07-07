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

interface TaskTableProps {
  data: Task[];
  projectId: number;
  onUpdate?: () => void;
}

// Custom filter function
const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
  const itemRank = row.getValue(columnId);
  return itemRank ? itemRank.toString().toLowerCase().includes(value.toLowerCase()) : false;
};

interface TaskStatusCellProps {
  task: Task;
  projectId: number;
  onUpdate?: () => void;
}

const TaskStatusCell: React.FC<TaskStatusCellProps> = ({ task, projectId, onUpdate }) => {
  const dispatch = useAppDispatch();
  const [status, setStatus] = React.useState(task.isCompleted);
  const [hasChanges, setHasChanges] = React.useState(false);

  const handleStatusChange = (newStatus: boolean) => {
    setStatus(newStatus);
    setHasChanges(newStatus !== task.isCompleted);
  };

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

export function TaskTable({ data, projectId, onUpdate }: TaskTableProps) {
  const dispatch = useAppDispatch();
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = React.useState('');
  
  // Read page size from environment variables
  const taskPageSize = Number(process.env.REACT_APP_TASK_LIST_SIZE_PAGE) || 5;
  
  // Use pagination context
  const { taskPageIndex, setTaskPageIndex } = usePaginationContext();

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