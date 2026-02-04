'use client';

import React, { useMemo, useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import Link from 'next/link';
import ComponentCard from '@/components/common/ComponentCard';
import { DataTable } from '@/components/common/DataTable';
import ReservationFilters from '@/components/reservation/ReservationFilters';
import { useReservations } from '@/hooks/useReservations';
import Badge from '@/components/ui/badge/Badge';
import { Dropdown } from '@/components/ui/dropdown/Dropdown';
import EditReservationModal from '@/components/reservation/EditReservationModal';

// Utility to safely get guest name
const getGuestName = (reservation: any) => {
	const guests = reservation.reservationGuests;
	if (guests && Array.isArray(guests) && guests.length > 0) {
		const primary = guests.find((g: any) => g.primary) || guests[0];
		// Accessing profileInfo which is typed as unknown in SDK, so we cast to any
		const profile = (primary?.profileInfo as any)?.profile;
		if (profile?.customer?.personName?.[0]) {
			const name = profile.customer.personName[0];
			return `${name.givenName || ''} ${name.surname || ''}`.trim();
		}
	}
	return 'Unknown Guest';
};

export default function ReservationsPage() {
	const { reservations, totalCount, pagination, setPagination, sorting, setSorting, isLoading } =
		useReservations();

	const [selectedReservation, setSelectedReservation] = useState<any>(null);
	const [isEditModalOpen, setIsEditModalOpen] = useState(false);
	const [openRowId, setOpenRowId] = useState<string | null>(null);

	const handleEditClick = (reservation: any) => {
		setSelectedReservation(reservation);
		setIsEditModalOpen(true);
		setOpenRowId(null);
	};

	const columns = useMemo<ColumnDef<any>[]>(
		() => [
			{
				accessorKey: 'id',
				header: () => <div className="text-center">Confirmation</div>,
				cell: ({ row }) => {
					const ids = row.original.reservationIdList;
					const mainId = ids?.find((bit: any) => bit.type === 'CONFIRMATION') || ids?.[0];
					const displayId = mainId?.id || 'N/A';
					const hotelId = row.original.hotelId;

					return (
						<div className="flex flex-col">
							<Link href={`#`} className="hover:text-brand-500 hover:underline font-medium">
								{displayId}
							</Link>
							{hotelId && <span className="text-xs text-gray-400">{hotelId}</span>}
						</div>
					);
				},
			},
			{
				id: 'guest',
				header: () => <div className="text-center">Guest Name</div>,
				cell: ({ row }) => {
					const name = getGuestName(row.original);
					return <span className="font-medium text-gray-800 dark:text-white/90">{name}</span>;
				},
			},
			{
				accessorKey: 'roomStay.arrivalDate',
				header: () => <div className="text-center">Arrival</div>,
				cell: ({ row }) => row.original.roomStay?.arrivalDate || '-',
			},
			{
				accessorKey: 'roomStay.departureDate',
				header: () => <div className="text-center">Departure</div>,
				cell: ({ row }) => row.original.roomStay?.departureDate || '-',
			},
			{
				id: 'guests',
				header: () => <div className="text-center">Guests</div>,
				cell: ({ row }) => {
					const guestCount = row.original.reservationGuests?.length || 0;
					return <span className="font-medium">{guestCount}</span>;
				},
			},
			{
				accessorKey: 'reservationStatus',
				header: () => <div className="text-center">Status</div>,
				cell: ({ row }) => {
					const status = row.original.reservationStatus || 'UNKNOWN';
					let color: 'success' | 'warning' | 'error' | 'info' = 'info';

					if (status === 'RESERVED' || status === 'CHECKED_IN') color = 'success';
					if (status === 'CANCELLED') color = 'error';
					if (status === 'CHECKED_OUT') color = 'warning';

					return (
						<Badge color={color} variant="light">
							{status}
						</Badge>
					);
				},
			},
			{
				id: 'actions',
				header: () => <div className="text-center">Actions</div>,
				cell: ({ row }) => {
					const reservation = row.original;
					const isOpen = openRowId === row.id;

					return (
						<div className="flex justify-center relative">
							<button
								className="dropdown-toggle p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
								onClick={() => setOpenRowId(isOpen ? null : row.id)}
							>
								<svg
									width="20"
									height="20"
									viewBox="0 0 20 20"
									fill="currentColor"
									className="text-gray-600 dark:text-gray-400"
								>
									<circle cx="10" cy="4" r="1.5" />
									<circle cx="10" cy="10" r="1.5" />
									<circle cx="10" cy="16" r="1.5" />
								</svg>
							</button>
							<Dropdown isOpen={isOpen} onClose={() => setOpenRowId(null)} className="w-40 right-0">
								<div className="py-1">
									<button
										onClick={(e) => {
											e.stopPropagation();
											handleEditClick(reservation);
										}}
										className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
									>
										Edit Reservation
									</button>
								</div>
							</Dropdown>
						</div>
					);
				},
			},
		],
		[openRowId],
	);

	return (
		<div className="space-y-6">
			<div className="flex flex-col gap-4">
				<div className="flex justify-between items-center">
					<h1 className="text-2xl font-bold text-gray-800 dark:text-white">Reservations</h1>
				</div>

				<ReservationFilters />
			</div>

			<ComponentCard title="Reservations List">
				<DataTable
					columns={columns}
					data={reservations}
					pageCount={totalCount > 0 ? Math.ceil(totalCount / pagination.pageSize) : -1}
					pagination={pagination}
					onPaginationChange={setPagination}
					sorting={sorting}
					onSortingChange={setSorting}
					isLoading={isLoading}
				/>
			</ComponentCard>

			{selectedReservation && (
				<EditReservationModal
					isOpen={isEditModalOpen}
					onClose={() => {
						setIsEditModalOpen(false);
						setSelectedReservation(null);
					}}
					reservation={selectedReservation}
					hotelId={selectedReservation.hotelId}
				/>
			)}
		</div>
	);
}
