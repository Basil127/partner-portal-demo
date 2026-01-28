import type {
	CancelReservationDetails,
	CancelReservationRequest,
	CheckDistributionReservationsSummary,
	CreateReservationRequest,
	GetHotelReservationsQuery,
	GetReservationStatisticsQuery,
	GetReservationsSummaryQuery,
	HotelReservationsRequestHeaders,
	ReservationListResponse,
	ReservationSummaryResponse,
} from '@partner-portal/shared';
import { z } from 'zod';
import { createClient } from '../external-client/client/index.js';
import {
	cancelReservationApiRsvV1HotelsHotelIdReservationsReservationIdCancellationsPost,
	createReservationApiRsvV1HotelsHotelIdReservationsPost,
	getHotelReservationsApiRsvV1HotelsHotelIdReservationsGet,
	getReservationsSummaryApiRsvV1HotelsHotelIdReservationsSummaryGet,
	getReservationStatisticsApiRsvV1HotelsHotelIdReservationsStatisticsGet,
	updateReservationApiRsvV1HotelsHotelIdReservationsReservationIdPut,
} from '../external-client/sdk.gen.js';
import {
	zCancelReservationDetails,
	// zCancelReservationRequest,
	zCheckDistributionReservationsSummary,
	// zCreateReservationRequest,
	zReservationSummaryResponse,
} from '../external-client/zod.gen.js';
import { config } from '../../../config/config.js';

/**
 * Lenient Zod schema for ReservationListResponse that accepts datetime strings
 * without requiring strict ISO 8601 format with timezone offset.
 * The external mock-opera API returns datetime strings like "2026-01-28T06:10:20.083795"
 * without timezone, which z.iso.datetime() rejects.
 */
const zLenientReservationListResponse = z.object({
	reservations: z.optional(
		z.union([
			z.object({
				reservation: z.optional(z.union([z.array(z.record(z.string(), z.unknown())), z.null()])),
			}),
			z.null(),
		]),
	),
});

const externalClient = createClient({
	baseUrl: config.externalClient.baseUrl,
	responseStyle: 'data',
	throwOnError: true,
});

const buildHeaders = (headers: HotelReservationsRequestHeaders): Record<string, string> => {
	const outgoing: Record<string, string> = {
		'x-channelCode': headers.channelCode,
	};

	if (headers.authorization) {
		outgoing.authorization = headers.authorization;
	}
	if (headers.appKey) {
		outgoing['x-app-key'] = headers.appKey;
	}
	if (headers.requestId) {
		outgoing['x-request-id'] = headers.requestId;
	}
	if (headers.originatingApplication) {
		outgoing['x-originating-application'] = headers.originatingApplication;
	}

	return outgoing;
};

export const fetchHotelReservations = async (
	hotelId: string,
	query: GetHotelReservationsQuery,
	headers: HotelReservationsRequestHeaders,
): Promise<ReservationListResponse> => {
	const response = await getHotelReservationsApiRsvV1HotelsHotelIdReservationsGet({
		client: externalClient,
		throwOnError: true,
		responseStyle: 'data',
		path: { hotelId },
		query: {
			surname: query.surname ?? undefined,
			givenName: query.givenName ?? undefined,
			arrivalStartDate: query.arrivalStartDate ?? undefined,
			arrivalEndDate: query.arrivalEndDate ?? undefined,
			confirmationNumberList: query.confirmationNumberList ?? undefined,
			limit: query.limit,
			offset: query.offset,
		},
		headers: buildHeaders(headers) as any,
		responseValidator: async (data: unknown) => {
			zLenientReservationListResponse.parse(data);
		},
	});

	return response as ReservationListResponse;
};

export const postCreateReservation = async (
	hotelId: string,
	body: CreateReservationRequest,
	headers: HotelReservationsRequestHeaders,
): Promise<ReservationListResponse> => {
	const response = await createReservationApiRsvV1HotelsHotelIdReservationsPost({
		client: externalClient,
		throwOnError: true,
		responseStyle: 'data',
		path: { hotelId },
		body: body as any,
		headers: buildHeaders(headers) as any,
		responseValidator: async (data: unknown) => {
			zLenientReservationListResponse.parse(data);
		},
	});

	return response as ReservationListResponse;
};

export const fetchReservationsSummary = async (
	hotelId: string,
	query: GetReservationsSummaryQuery,
	headers: HotelReservationsRequestHeaders,
): Promise<ReservationSummaryResponse> => {
	const response = await getReservationsSummaryApiRsvV1HotelsHotelIdReservationsSummaryGet({
		client: externalClient,
		throwOnError: true,
		responseStyle: 'data',
		path: { hotelId },
		query: {
			arrivalDate: query.arrivalDate ?? undefined,
			lastName: query.lastName ?? undefined,
			limit: query.limit,
			offset: query.offset,
		},
		headers: buildHeaders(headers) as any,
		responseValidator: async (data: unknown) => {
			zReservationSummaryResponse.parse(data);
		},
	});

	return response as ReservationSummaryResponse;
};

export const fetchReservationStatistics = async (
	hotelId: string,
	query: GetReservationStatisticsQuery,
	headers: HotelReservationsRequestHeaders,
): Promise<CheckDistributionReservationsSummary> => {
	const response = await getReservationStatisticsApiRsvV1HotelsHotelIdReservationsStatisticsGet({
		client: externalClient,
		throwOnError: true,
		responseStyle: 'data',
		path: { hotelId },
		query: {
			startDate: query.startDate ?? undefined,
			endDate: query.endDate ?? undefined,
			limit: query.limit,
			offset: query.offset,
		},
		headers: buildHeaders(headers) as any,
		responseValidator: async (data: unknown) => {
			zCheckDistributionReservationsSummary.parse(data);
		},
	});

	return response as CheckDistributionReservationsSummary;
};

export const putUpdateReservation = async (
	hotelId: string,
	reservationId: string,
	body: CreateReservationRequest,
	headers: HotelReservationsRequestHeaders,
): Promise<ReservationListResponse> => {
	const response = await updateReservationApiRsvV1HotelsHotelIdReservationsReservationIdPut({
		client: externalClient,
		throwOnError: true,
		responseStyle: 'data',
		path: { hotelId, reservationId },
		body: body as any,
		headers: buildHeaders(headers) as any,
		responseValidator: async (data: unknown) => {
			zLenientReservationListResponse.parse(data);
		},
	});

	return response as ReservationListResponse;
};

export const postCancelReservation = async (
	hotelId: string,
	reservationId: string,
	body: CancelReservationRequest,
	headers: HotelReservationsRequestHeaders,
): Promise<CancelReservationDetails> => {
	const response =
		await cancelReservationApiRsvV1HotelsHotelIdReservationsReservationIdCancellationsPost({
			client: externalClient,
			throwOnError: true,
			responseStyle: 'data',
			path: { hotelId, reservationId },
			body: body as any,
			headers: buildHeaders(headers) as any,
			responseValidator: async (data: unknown) => {
				zCancelReservationDetails.parse(data);
			},
		});

	return response as CancelReservationDetails;
};
