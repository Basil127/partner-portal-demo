import type { Metadata } from 'next';
import React from 'react';
import { DashboardMetrics } from '@/components/dashboard/DashboardMetrics';
import MonthlyBookingsChart from '@/components/dashboard/MonthlyBookingsChart';
import BookingsSummary from '@/components/dashboard/BookingsSummary';
import RecentBookings from '@/components/dashboard/RecentBookings';
import HotelSelector from '@/components/hotel/HotelSelector';

export const metadata: Metadata = {
	title: 'Dashboard | B2B Partner portal',
	description: 'This is the Home for B2B Partner portal containing a dashboard of reservation metrics',
};

export default function Ecommerce() {
	return (
		<div className="grid grid-cols-12 gap-4 md:gap-6">
			<div className="col-span-12">
				<HotelSelector />
			</div>
			<div className="col-span-12 space-y-6 xl:col-span-7">
				<DashboardMetrics />
				<MonthlyBookingsChart />
			</div>
			<div className="col-span-12 xl:col-span-5">
				<BookingsSummary />
			</div>
			<div className="col-span-12">
				<RecentBookings />
			</div>
		</div>
	);
}
