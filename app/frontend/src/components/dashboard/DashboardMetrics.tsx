'use client';

import React from 'react';
import Badge from '@/components/ui/badge/Badge';
import { ArrowUpIcon, DollarLineIcon } from '@/icons';

export const DashboardMetrics = ({ classname }: { classname?: string }) => {
	return (
		<div className={`rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 ${classname}`}>
			<div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
				<DollarLineIcon className="text-gray-800 size-6 dark:text-white/90" />
			</div>
			<div className="flex items-end justify-between mt-5">
				<div>
					<span className="text-sm text-gray-500 dark:text-gray-400">Monthly Revenue</span>
					<h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">$24,500</h4>
					<p className="mt-1.5 text-xs text-gray-400 dark:text-gray-500">
						vs.{' '}
						<span className="font-medium text-gray-500 dark:text-gray-400">$21,800</span> last month
					</p>
				</div>
				<Badge color="success">
					<ArrowUpIcon />
					12.4%
				</Badge>
			</div>
		</div>
	);
};
