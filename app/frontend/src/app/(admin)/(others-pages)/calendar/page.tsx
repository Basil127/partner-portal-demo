import Calendar from '@/components/calendar/Calendar';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
	title: 'Calendar | B2B Partner Portal',
	description: 'This is the Calendar page for B2B Partner Portal',
	// other metadata
};
export default function page() {
	return (
		<div>
			<PageBreadcrumb pageTitle="Calendar" />
			<Calendar />
		</div>
	);
}
