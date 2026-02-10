import React from 'react';
import { render, screen } from '@testing-library/react';
import HotelsPage from '@/app/(admin)/(primary)/hotels/page';
import RoomsPage from '@/app/(admin)/(primary)/rooms/page';
import BookingsPage from '@/app/(admin)/(primary)/reservations/page';

jest.mock('next/navigation', () => ({
	usePathname: () => '/',
}));

jest.mock('@/icons', () => ({
	__esModule: true,
	CalenderIcon: (props: any) => <svg {...props} />,
	ChevronDownIcon: (props: any) => <svg {...props} />,
	SearchIcon: (props: any) => <svg {...props} />,
}));

jest.mock('@/lib/api-client/client.gen', () => ({
	__esModule: true,
	client: {
		get: jest.fn().mockResolvedValue({ data: {} }),
	},
}));

jest.mock('@/components/ui/table', () => ({
	__esModule: true,
	Table: ({ children }: any) => <table>{children}</table>,
	TableHeader: ({ children }: any) => <thead>{children}</thead>,
	TableBody: ({ children }: any) => <tbody>{children}</tbody>,
	TableRow: ({ children }: any) => <tr>{children}</tr>,
	TableCell: ({ children }: any) => <td>{children}</td>,
}));

jest.mock('@/components/form/date-picker', () => ({
	__esModule: true,
	default: ({ label }: { label: string }) => (
		<div>
			<label>{label}</label>
			<input type="text" />
		</div>
	),
}));

jest.mock('@/components/common/PageBreadCrumb', () => ({
	__esModule: true,
	default: ({ pageTitle }: { pageTitle: string }) => <h2>{pageTitle}</h2>,
}));

jest.mock('@/components/common/ComponentCard', () => ({
	__esModule: true,
	default: ({ title, children }: any) => (
		<div>
			<h3>{title}</h3>
			{children}
		</div>
	),
}));

jest.mock('@/components/ui/badge/Badge', () => ({
	__esModule: true,
	default: ({ children }: any) => <span>{children}</span>,
}));

jest.mock('@/components/ui/button/Button', () => ({
	__esModule: true,
	default: ({ children }: any) => <button>{children}</button>,
}));

jest.mock('@/components/form/Label', () => ({
	__esModule: true,
	default: ({ children }: any) => <label>{children}</label>,
}));

jest.mock('@/components/form/input/InputField', () => ({
	__esModule: true,
	default: (props: any) => <input {...props} />,
}));

jest.mock('@/components/form/Select', () => ({
	__esModule: true,
	default: () => <select />,
}));

jest.mock('@/app/(admin)/(others-pages)/hotels/page', () => ({
	__esModule: true,
	default: () => (
		<div>
			<h2>Hotels</h2>
		</div>
	),
}));

describe('Partner portal placeholder pages', () => {
	it('renders the Hotels page heading', () => {
		render(<HotelsPage />);
		expect(screen.getAllByRole('heading', { name: 'Hotels' })[0]).toBeInTheDocument();
	});

	it('renders the Rooms page heading', () => {
		render(<RoomsPage />);
		expect(screen.getAllByRole('heading', { name: 'Rooms' })[0]).toBeInTheDocument();
	});

	it('renders the Bookings page heading', () => {
		render(<BookingsPage />);
		expect(screen.getAllByRole('heading', { name: 'Reservations' })[0]).toBeInTheDocument();
	});
});
