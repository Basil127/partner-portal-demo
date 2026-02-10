import BarChartOne from '@/components/charts/bar/BarChartOne';
import ComponentCard from '@/components/common/ComponentCard';
import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
	title: 'Bar Chart | B2B Partner Portal',
	description: 'This is the Bar Chart page for B2B Partner Portal',
};

export default function page() {
	return (
		<div>
			<div className="space-y-6">
				<ComponentCard title="Bar Chart 1">
					<BarChartOne />
				</ComponentCard>
			</div>
		</div>
	);
}
