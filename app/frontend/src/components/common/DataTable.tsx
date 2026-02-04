'use client';

import {
	ColumnDef,
	flexRender,
	getCoreRowModel,
	useReactTable,
	PaginationState,
	SortingState,
} from '@tanstack/react-table';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/components/ui/table';
import Button from '@/components/ui/button/Button';
import { ChevronLeftIcon, ChevronForward, ArrowUpIcon, ArrowDownIcon } from '@/icons';

interface DataTableProps<TData, TValue> {
	columns: ColumnDef<TData, TValue>[];
	data: TData[];
	pageCount: number;
	pagination: PaginationState;
	onPaginationChange: (pagination: PaginationState) => void;
	sorting: SortingState;
	onSortingChange: (sorting: SortingState) => void;
	isLoading?: boolean;
}

export function DataTable<TData, TValue>({
	columns,
	data,
	pageCount,
	pagination,
	onPaginationChange,
	sorting,
	onSortingChange,
	isLoading,
}: DataTableProps<TData, TValue>) {
	const table = useReactTable({
		data,
		columns,
		pageCount,
		state: {
			pagination,
			sorting,
		},
		onPaginationChange: (updater) => {
			if (typeof updater === 'function') {
				onPaginationChange(updater(pagination));
			} else {
				onPaginationChange(updater);
			}
		},
		onSortingChange: (updater) => {
			if (typeof updater === 'function') {
				onSortingChange(updater(sorting));
			} else {
				onSortingChange(updater);
			}
		},
		getCoreRowModel: getCoreRowModel(),
		manualPagination: true,
		manualSorting: true,
	});

	return (
		<div className="space-y-4">
			<div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/5 dark:bg-white/3">
				<div className="max-w-full overflow-x-auto">
					<Table>
						<TableHeader className="border-b border-gray-100 dark:border-white/5">
							{table.getHeaderGroups().map((headerGroup) => (
								<TableRow key={headerGroup.id}>
									{headerGroup.headers.map((header) => {
										return (
											<TableCell
												key={header.id}
												isHeader
												className="px-5 py-3 text-left text-sm font-medium text-gray-500"
											>
												{header.isPlaceholder ? null : (
													<div
														className={`flex items-center gap-1 ${header.column.getCanSort() ? 'cursor-pointer select-none' : ''}`}
														onClick={header.column.getToggleSortingHandler()}
													>
														{flexRender(header.column.columnDef.header, header.getContext())}
														{{
															asc: <ArrowUpIcon className="w-3 h-3" />,
															desc: <ArrowDownIcon className="w-3 h-3" />,
														}[header.column.getIsSorted() as string] ?? null}
													</div>
												)}
											</TableCell>
										);
									})}
								</TableRow>
							))}
						</TableHeader>
						<TableBody>
							{isLoading ? (
								<TableRow>
									<TableCell
										colSpan={columns.length}
										className="px-5 py-10 text-center text-gray-500"
									>
										Loading...
									</TableCell>
								</TableRow>
							) : table.getRowModel().rows?.length ? (
								table.getRowModel().rows.map((row) => (
									<TableRow
										key={row.id}
										className="border-b border-gray-100 dark:border-white/5 last:border-0 hover:bg-gray-50 dark:hover:bg-white/5"
									>
										{row.getVisibleCells().map((cell) => (
											<TableCell
												key={cell.id}
												className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400"
											>
												{flexRender(cell.column.columnDef.cell, cell.getContext())}
											</TableCell>
										))}
									</TableRow>
								))
							) : (
								<TableRow>
									<TableCell
										colSpan={columns.length}
										className="px-5 py-10 text-center text-gray-500"
									>
										No results found.
									</TableCell>
								</TableRow>
							)}
						</TableBody>
					</Table>
				</div>
			</div>

			<div className="flex items-center justify-between px-2">
				<div className="text-sm text-gray-500 dark:text-gray-400">
					Page {table.getState().pagination.pageIndex + 1} of {Math.max(1, table.getPageCount())}
				</div>
				<div className="flex items-center space-x-2">
					<Button
						variant="outline"
						size="sm"
						onClick={() => table.previousPage()}
						disabled={!table.getCanPreviousPage()}
					>
						<ChevronLeftIcon className="w-4 h-4" />
						Previous
					</Button>
					<Button
						variant="outline"
						size="sm"
						onClick={() => table.nextPage()}
						disabled={!table.getCanNextPage()}
					>
						Next
						<ChevronForward className="w-4 h-4" />
					</Button>
				</div>
			</div>
		</div>
	);
}
