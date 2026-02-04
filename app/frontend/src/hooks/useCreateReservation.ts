import { useState } from 'react';
import { postApiHotelsByHotelIdReservations } from '@/lib/api-client';
import type { ReservationFormData } from '@/lib/schemas/reservation.schema';
import { transformFormToApiRequest } from '@/lib/schemas/reservation.schema';

export interface UseCreateReservationOptions {
	onSuccess?: (data: any) => void;
	onError?: (error: Error) => void;
}

export function useCreateReservation(options?: UseCreateReservationOptions) {
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<Error | null>(null);

	const createReservation = async (hotelId: string, formData: ReservationFormData) => {
		setIsLoading(true);
		setError(null);

		try {
			// Transform form data to API request format
			const apiRequest = transformFormToApiRequest(formData);

			// Call the API
			const response = await postApiHotelsByHotelIdReservations({
				path: { hotelId },
				body: apiRequest as any,
			});

			// Handle success
			if (options?.onSuccess) {
				options.onSuccess(response.data);
			}

			return response.data;
		} catch (err) {
			const error = err instanceof Error ? err : new Error('Failed to create reservation');
			setError(error);

			if (options?.onError) {
				options.onError(error);
			}

			throw error;
		} finally {
			setIsLoading(false);
		}
	};

	return {
		createReservation,
		isLoading,
		error,
	};
}
