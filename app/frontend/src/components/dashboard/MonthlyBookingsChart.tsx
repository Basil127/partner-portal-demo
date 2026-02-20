'use client';

import { ApexOptions } from 'apexcharts';
import dynamic from 'next/dynamic';
import { MoreDotIcon } from '@/icons';
import { DropdownItem } from '@/components/ui/dropdown/DropdownItem';
import { useState } from 'react';
import { Dropdown } from '@/components/ui/dropdown/Dropdown';
import { COLORS } from '@/lib/theme';

const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

export default function MonthlyBookingsChart() {
	const options: ApexOptions = {
		colors: [COLORS.light.primary],
		chart: {
			fontFamily: 'Outfit, sans-serif',
			type: 'bar',
			height: 180,
			toolbar: { show: false },
		},
		plotOptions: {
			bar: {
				horizontal: false,
				columnWidth: '39%',
				borderRadius: 5,
				borderRadiusApplication: 'end',
			},
		},
		dataLabels: { enabled: false },
		stroke: { show: true, width: 4, colors: ['transparent'] },
		xaxis: {
			categories: [
				'Jan',
				'Feb',
				'Mar',
				'Apr',
				'May',
				'Jun',
				'Jul',
				'Aug',
				'Sep',
				'Oct',
				'Nov',
				'Dec',
			],
			axisBorder: { show: false },
			axisTicks: { show: false },
		},
		legend: { show: true, position: 'top', horizontalAlign: 'left', fontFamily: 'Outfit' },
		yaxis: { title: { text: undefined } },
		grid: { yaxis: { lines: { show: true } } },
		fill: { opacity: 1 },
		tooltip: { x: { show: false }, y: { formatter: (val: number) => `${val} bookings` } },
	};

	const series = [{ name: 'Bookings', data: [42, 85, 67, 93, 78, 101, 112, 95, 88, 120, 105, 73] }];

	const [isOpen, setIsOpen] = useState(false);

	return (
		<div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
			<div className="flex items-center justify-between">
				<h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Monthly Bookings</h3>
				<div className="relative inline-block">
					<button onClick={() => setIsOpen(!isOpen)} className="dropdown-toggle">
						<MoreDotIcon className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-300" />
					</button>
					<Dropdown isOpen={isOpen} onClose={() => setIsOpen(false)} className="w-40 p-2">
						<DropdownItem
							tag="a"
							onItemClick={() => setIsOpen(false)}
							className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
						>
							This Month
						</DropdownItem>
						<DropdownItem
							tag="a"
							onItemClick={() => setIsOpen(false)}
							className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
						>
							Last 6 Months
						</DropdownItem>
					</Dropdown>
				</div>
			</div>
			<div className="max-w-full overflow-x-auto custom-scrollbar">
				<div className="-ml-5 min-w-[650px] xl:min-w-full pl-2">
					<ReactApexChart options={options} series={series} type="bar" height={180} />
				</div>
			</div>
		</div>
	);
}
