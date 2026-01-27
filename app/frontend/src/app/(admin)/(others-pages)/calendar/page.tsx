import Calendar from '@/components/calendar/Calendar';
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
			<Calendar />
		</div>
	);
}
