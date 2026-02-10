import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface Booking {
	id: string;
	partnerId: string;
	customerName: string;
	serviceType: string;
	startDate: string;
	endDate: string;
	status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
	createdAt: string;
	updatedAt: string;
}

export interface CreateBookingData {
	partnerId: string;
	customerName: string;
	serviceType: string;
	startDate: string;
	endDate: string;
}

export interface UpdateBookingData {
	customerName?: string;
	status?: 'pending' | 'confirmed' | 'cancelled' | 'completed';
	startDate?: string;
	endDate?: string;
}

const api = axios.create({
	baseURL: API_URL,
	headers: {
		'Content-Type': 'application/json',
	},
});

export const bookingApi = {
	getAll: async (): Promise<Booking[]> => {
		const response = await api.get<Booking[]>('/api/bookings');
		return response.data;
	},

	getById: async (id: string): Promise<Booking> => {
		const response = await api.get<Booking>(`/api/bookings/${id}`);
		return response.data;
	},

	create: async (data: CreateBookingData): Promise<Booking> => {
		const response = await api.post<Booking>('/api/bookings', data);
		return response.data;
	},

	update: async (id: string, data: UpdateBookingData): Promise<Booking> => {
		const response = await api.put<Booking>(`/api/bookings/${id}`, data);
		return response.data;
	},

	delete: async (id: string): Promise<void> => {
		await api.delete(`/api/bookings/${id}`);
	},
};

export const healthApi = {
	check: async (): Promise<{ status: string; timestamp: string }> => {
		const response = await api.get('/health');
		return response.data;
	},
};
