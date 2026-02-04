import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { getApiContentHotels, getApiHotelsByHotelIdReservations } from '@/lib/api-client/sdk.gen';
import { PaginationState, SortingState } from '@tanstack/react-table';

export function useReservations() {
	const searchParams = useSearchParams();
	const router = useRouter();
	const pathname = usePathname();

	// --- State ---
	const pageParam = Number(searchParams.get('page'));
	const pageSizeParam = Number(searchParams.get('pageSize'));

	const [pagination, setPagination] = useState<PaginationState>({
		pageIndex: pageParam > 0 ? pageParam - 1 : 0,
		pageSize: pageSizeParam > 0 ? pageSizeParam : 10,
	});

	const [sorting, setSorting] = useState<SortingState>([]);

	// Filters
	const [hotelId, setHotelId] = useState<string>(searchParams.get('hotelId') || '');
	const [surname, setSurname] = useState(searchParams.get('surname') || '');
	const [givenName, setGivenName] = useState(searchParams.get('givenName') || '');
	const [arrivalStartDate, setArrivalStartDate] = useState(
		searchParams.get('arrivalStartDate') || '',
	);
	const [arrivalEndDate, setArrivalEndDate] = useState(searchParams.get('arrivalEndDate') || '');
	const [guests, setGuests] = useState(searchParams.get('guests') || '');
	const [children, setChildren] = useState(searchParams.get('children') || '');

	// --- URL Sync ---
	const createQueryString = useCallback(
		(params: Record<string, string | number | null>) => {
			const newSearchParams = new URLSearchParams(searchParams.toString());

			for (const [key, value] of Object.entries(params)) {
				if (value === null || value === '' || value === undefined) {
					newSearchParams.delete(key);
				} else {
					newSearchParams.set(key, String(value));
				}
			}

			return newSearchParams.toString();
		},
		[searchParams],
	);

	const updateUrl = useCallback(
		(updates: Record<string, string | number | null>) => {
			const queryString = createQueryString(updates);
			router.push(`${pathname}?${queryString}`, { scroll: false });
		},
		[createQueryString, pathname, router],
	);

	// Sync pagination to URL when it changes
	useEffect(() => {
		const queryString = createQueryString({
			page: pagination.pageIndex + 1,
			pageSize: pagination.pageSize,
		});
		router.push(`${pathname}?${queryString}`, { scroll: false });
	}, [pagination.pageIndex, pagination.pageSize]);

	const handleFilterChange = (key: string, value: string) => {
		updateUrl({ [key]: value, page: 1 }); // Reset to page 1 on filter change

		switch (key) {
			case 'hotelId':
				setHotelId(value);
				break;
			case 'surname':
				setSurname(value);
				break;
			case 'givenName':
				setGivenName(value);
				break;
			case 'arrivalStartDate':
				setArrivalStartDate(value);
				break;
			case 'arrivalEndDate':
				setArrivalEndDate(value);
				break;
			case 'guests':
				setGuests(value);
				break;
			case 'children':
				setChildren(value);
				break;
		}
		setPagination((prev) => ({ ...prev, pageIndex: 0 }));
	};

	// --- Queries ---

	// 1. Get Hotels List
	const { data: hotelsData, isLoading: isLoadingHotels } = useQuery({
		queryKey: ['hotels'],
		queryFn: () => getApiContentHotels(),
		staleTime: 1000 * 60 * 60, // 1 hour
	});

	const hotels = (hotelsData?.data as any)?.hotels || [];

	// Auto-select first hotel if none selected and hotels loaded
	useEffect(() => {
		if (!hotelId && hotels.length > 0 && Array.isArray(hotels)) {
			const firstId = hotels[0]?.hotelCode || '';
			if (firstId) {
				setHotelId(firstId);
				const queryString = createQueryString({ hotelId: firstId });
				router.push(`${pathname}?${queryString}`, { scroll: false });
			}
		}
	}, [hotels.length, hotelId]);

	// 2. Get Reservations
	const {
		data: reservationsData,
		isLoading: isLoadingReservations,
		isFetching,
	} = useQuery({
		queryKey: [
			'reservations',
			hotelId,
			pagination,
			surname,
			givenName,
			arrivalStartDate,
			arrivalEndDate,
		],
		queryFn: async () => {
			if (!hotelId) {
				return { data: null };
			}

			return await getApiHotelsByHotelIdReservations({
				path: { hotelId },
				query: {
					offset: pagination.pageIndex * pagination.pageSize,
					limit: pagination.pageSize,
					surname: surname || undefined,
					givenName: givenName || undefined,
					arrivalStartDate: arrivalStartDate || undefined,
					arrivalEndDate: arrivalEndDate || undefined,
				},
			});
		},
		placeholderData: keepPreviousData,
		enabled: !!hotelId,
	});

	// Extract data
	const reservations = (reservationsData?.data as any)?.reservations?.reservation || [];
	const totalCount = 0; // API does not return total count

	return {
		hotels,
		reservations,
		totalCount,
		pagination,
		setPagination,
		sorting,
		setSorting,
		filters: {
			hotelId,
			surname,
			givenName,
			startDate: arrivalStartDate,
			endDate: arrivalEndDate,
			guests,
			children,
		},
		handleFilterChange,
		isLoading: isLoadingHotels || isLoadingReservations,
		isFetching,
	};
}
