'use client';

import React from 'react';
import Link from 'next/link';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/components/ui/table';
import Badge from '@/components/ui/badge/Badge';
import { useDashboardData } from '@/hooks/useDashboardData';

// Fallback static data shown when API returns no results
const FALLBACK_BOOKINGS = [
	{
		guestName: 'James Mitchell',
		confirmationId: 'CNF-001234',
		arrivalDate: '2026-02-20',
		departureDate: '2026-02-24',
		reservationStatus: 'Reserved',
	},
	{
		guestName: 'Sofia Andersen',
		confirmationId: 'CNF-001235',
		arrivalDate: '2026-02-21',
		departureDate: '2026-02-23',
		reservationStatus: 'InHouse',
	},
	{
		guestName: 'Luca Bianchi',
		confirmationId: 'CNF-001236',
		arrivalDate: '2026-02-18',
		departureDate: '2026-02-22',
		reservationStatus: 'Cancelled',
	},
	{
		guestName: 'Priya Sharma',
		confirmationId: 'CNF-001237',
		arrivalDate: '2026-02-22',
		departureDate: '2026-02-25',
		reservationStatus: 'DueIn',
	},
	{
		guestName: 'Noah Williams',
		confirmationId: 'CNF-001238',
		arrivalDate: '2026-02-15',
		departureDate: '2026-02-19',
		reservationStatus: 'CheckedOut',
	},
];

type BadgeColor = 'success' | 'primary' | 'error' | 'warning' | 'info' | 'light' | 'dark';

const STATUS_BADGE: Record<string, BadgeColor> = {
	InHouse: 'success',
	Reserved: 'primary',
	Cancelled: 'error',
	Canceled: 'error',
	DueIn: 'warning',
	DueOut: 'warning',
	CheckedOut: 'light',
	NoShow: 'dark',
};

function formatDate(dateStr?: string) {
	if (!dateStr) return '—';
	try {
		return new Date(dateStr).toLocaleDateString('en-GB', {
			day: '2-digit',
			month: 'short',
			year: 'numeric',
		});
	} catch {
		return dateStr;
	}
}

export default function RecentBookings() {
	const { recentBookings, isLoading } = useDashboardData();

	const rows = recentBookings.length > 0 ? recentBookings : FALLBACK_BOOKINGS;

	return (
		<div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
			<div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Recent Bookings</h3>
					{recentBookings.length === 0 && !isLoading && (
						<p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Showing sample data</p>
					)}
				</div>
				<div className="flex items-center gap-3">
					<Link
						href="/reservations"
						className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
					>
						See all
					</Link>
				</div>
			</div>

			{isLoading ? (
				<div className="flex items-center justify-center py-10 text-gray-400 dark:text-gray-500">
					<span className="text-sm">Loading bookings...</span>
				</div>
			) : (
				<div className="max-w-full overflow-x-auto">
					<Table>
						<TableHeader className="border-gray-100 dark:border-gray-800 border-y">
							<TableRow>
								<TableCell
									isHeader
									className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
								>
									Guest Name
								</TableCell>
								<TableCell
									isHeader
									className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
								>
									Confirmation ID
								</TableCell>
								<TableCell
									isHeader
									className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
								>
									Arrival
								</TableCell>
								<TableCell
									isHeader
									className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
								>
									Departure
								</TableCell>
								<TableCell
									isHeader
									className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
								>
									Status
								</TableCell>
							</TableRow>
						</TableHeader>
						<TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
							{rows.map((booking, idx) => {
								const status = booking.reservationStatus ?? '';
								const badgeColor: BadgeColor = STATUS_BADGE[status] ?? 'light';
								return (
									<TableRow key={booking.confirmationId ?? idx}>
										<TableCell className="py-3 font-medium text-gray-800 text-theme-sm dark:text-white/90">
											{booking.guestName ?? '—'}
										</TableCell>
										<TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
											{booking.confirmationId ?? '—'}
										</TableCell>
										<TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
											{formatDate(booking.arrivalDate)}
										</TableCell>
										<TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
											{formatDate(booking.departureDate)}
										</TableCell>
										<TableCell className="py-3">
											<Badge size="sm" color={badgeColor}>
												{status || 'Unknown'}
											</Badge>
										</TableCell>
									</TableRow>
								);
							})}
						</TableBody>
					</Table>
				</div>
			)}
		</div>
	);
}
