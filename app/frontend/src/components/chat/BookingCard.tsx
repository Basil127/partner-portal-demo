'use client';

import React, { useState } from 'react';
import { CheckCircle, Loader2, Calendar, Users, Hotel, Edit3, Tag } from 'lucide-react';
import Button from '@/components/ui/button/Button';
import EditBookingModal from './EditBookingModal';

// ─── Types ────────────────────────────────────────────────────────────────────

interface BookingGuest {
	firstName: string;
	lastName: string;
	email?: string;
	phone?: string;
}

interface BookingInput {
	// create_reservation fields
	hotelId?: string;
	numberOfAdults?: number;
	numberOfChildren?: number;
	guaranteeType?: string;
	guests?: BookingGuest[];
	// get_room_pricing fields (overlap with create_reservation)
	hotelCode?: string;
	adults?: number;
	children?: number;
	// common fields
	arrivalDate: string;
	departureDate: string;
	roomType?: string;
	ratePlanCode?: string;
}

interface ReservationResult {
	reservations?: {
		reservation?: Array<{
			reservationIdList?: Array<{ id: string; type: string }>;
			roomStay?: {
				arrivalDate?: string;
				departureDate?: string;
				roomType?: string;
				ratePlanCode?: string;
				guestCounts?: { adults?: number; children?: number };
				total?: {
					amountBeforeTax?: number;
					amountAfterTax?: number;
					currencyCode?: string;
				};
				guarantee?: { guaranteeType?: string };
			};
			reservationGuests?: Array<{
				primary?: boolean;
				profileInfo?: {
					profile?: {
						customer?: { personName?: Array<{ givenName?: string; surname?: string }> };
						email?: string;
						phoneNumber?: string;
					};
				};
			}>;
			hotelId?: string;
			reservationStatus?: string;
		}>;
	};
}

interface PricingResult {
	offer?: {
		total?: {
			amountBeforeTax?: number;
			amountAfterTax?: number;
			currencyCode?: string;
		};
	};
}

export interface BookingCardProps {
	toolName: string;
	state: 'call' | 'result' | 'partial-call';
	args?: BookingInput;
	result?: ReservationResult | PricingResult | unknown;
	isError?: boolean;
	sendMessage?: (msg: { text: string }) => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(dateStr?: string) {
	if (!dateStr) return '—';
	try {
		return new Date(dateStr).toLocaleDateString('en-US', {
			weekday: 'short',
			year: 'numeric',
			month: 'short',
			day: 'numeric',
		});
	} catch {
		return dateStr;
	}
}

function calcNights(arrival?: string, departure?: string) {
	if (!arrival || !departure) return 0;
	const a = new Date(arrival);
	const d = new Date(departure);
	return Math.max(0, Math.ceil((d.getTime() - a.getTime()) / (1000 * 60 * 60 * 24)));
}

function formatCurrency(amount?: number, currency?: string) {
	if (amount == null) return null;
	return `${currency || 'USD'} $${amount.toFixed(2)}`;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function DetailRow({ label, value }: { label: React.ReactNode; value: React.ReactNode }) {
	return (
		<div>
			<p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
			<p className="font-medium text-gray-900 dark:text-white text-sm">{value || '—'}</p>
		</div>
	);
}

function StatusBadge({ status }: { status?: string }) {
	const s = (status || '').toUpperCase();
	const colors: Record<string, string> = {
		RESERVED: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
		CONFIRMED: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
		PENDING: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
		CANCELLED: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
		CHECKEDIN: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
	};
	return (
		<span
			className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${colors[s] || 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'}`}
		>
			{status || 'Unknown'}
		</span>
	);
}

// ─── Pricing card ─────────────────────────────────────────────────────────────

function PricingCard({
	result,
	args,
	sendMessage,
}: {
	result: PricingResult;
	args?: BookingInput;
	sendMessage?: (msg: { text: string }) => void;
}) {
	const offer = result?.offer;
	const total = offer?.total;
	const nights = calcNights(args?.arrivalDate, args?.departureDate);

	return (
		<div className="w-full rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 p-4 shadow-sm">
			<div className="flex items-center gap-2 mb-3">
				<Tag className="size-4 text-blue-600 dark:text-blue-400" />
				<span className="font-semibold text-blue-900 dark:text-blue-100 text-sm">Room Pricing</span>
			</div>
			<div className="space-y-2">
				{args && (
					<div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm mb-3">
						<DetailRow label="Hotel" value={args.hotelCode ?? args.hotelId} />
						<DetailRow label="Room Type" value={args.roomType} />
						<DetailRow label="Check-in" value={formatDate(args.arrivalDate)} />
						<DetailRow label="Check-out" value={formatDate(args.departureDate)} />
						<DetailRow label="Nights" value={nights} />
						<DetailRow
							label="Guests"
							value={(() => {
								const numAdults = args.adults ?? args.numberOfAdults ?? 1;
								const numChildren = args.children ?? args.numberOfChildren ?? 0;
								return `${numAdults} adult${numAdults !== 1 ? 's' : ''}${numChildren ? `, ${numChildren} child${numChildren !== 1 ? 'ren' : ''}` : ''}`;
							})()}
						/>
					</div>
				)}
				{total ? (
					<div className="border-t border-blue-200 dark:border-blue-700 pt-3 space-y-1">
						{total.amountBeforeTax != null && (
							<div className="flex justify-between text-sm">
								<span className="text-gray-600 dark:text-gray-400">Before tax</span>
								<span className="text-gray-900 dark:text-white">
									{formatCurrency(total.amountBeforeTax, total.currencyCode)}
								</span>
							</div>
						)}
						{total.amountAfterTax != null && (
							<div className="flex justify-between font-bold text-base">
								<span className="text-gray-800 dark:text-gray-200">Total</span>
								<span className="text-green-700 dark:text-green-400">
									{formatCurrency(total.amountAfterTax, total.currencyCode)}
								</span>
							</div>
						)}
					</div>
				) : (
					<p className="text-sm text-gray-500 dark:text-gray-400 italic">
						Pricing information unavailable for this selection.
					</p>
				)}
				{sendMessage && (
					<div className="pt-3 border-t border-blue-200 dark:border-blue-700">
						<Button
							variant="primary"
							size="sm"
							className="w-full"
							onClick={() => sendMessage({ text: 'Yes, please confirm the booking' })}
						>
							Confirm Booking
						</Button>
					</div>
				)}
			</div>
		</div>
	);
}

// ─── Booking progress card (while gathering info / calling tool) ───────────────

function BookingProgressCard({ args }: { args?: Partial<BookingInput> }) {
	const stayFields: Array<{ key: keyof BookingInput; label: string }> = [
		{ key: 'hotelId', label: 'Hotel' },
		{ key: 'arrivalDate', label: 'Check-in' },
		{ key: 'departureDate', label: 'Check-out' },
		{ key: 'roomType', label: 'Room Type' },
		{ key: 'ratePlanCode', label: 'Rate Plan' },
		{ key: 'numberOfAdults', label: 'Adults' },
	];

	const filledStay = stayFields.filter((f) => args?.[f.key] != null);
	const guests = args?.guests ?? [];
	const totalFields = stayFields.length + 1; // +1 for at least one guest
	const filledCount = filledStay.length + (guests.length > 0 ? 1 : 0);

	return (
		<div className="w-full rounded-xl border border-brand-200 dark:border-brand-800 bg-brand-50 dark:bg-brand-900/20 p-4 shadow-sm">
			<div className="flex items-center gap-2 mb-3">
				<Loader2 className="size-4 text-brand-600 dark:text-brand-400 animate-spin" />
				<span className="font-semibold text-brand-900 dark:text-brand-100 text-sm">
					Creating Reservation…
				</span>
			</div>
			<div className="grid grid-cols-2 md:grid-cols-3 gap-2">
				{stayFields.map(({ key, label }) => {
					const val = args?.[key];
					return (
						<div key={key}>
							<p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
							<p
								className={`text-sm font-medium ${val != null ? 'text-gray-900 dark:text-white' : 'text-gray-300 dark:text-gray-600 italic'}`}
							>
								{val != null ? String(val) : 'Pending…'}
							</p>
						</div>
					);
				})}
			</div>
			{/* Guests */}
			<div className="mt-3">
				<p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Guests</p>
				{guests.length === 0 ? (
					<p className="text-sm font-medium text-gray-300 dark:text-gray-600 italic">Pending…</p>
				) : (
					<div className="flex flex-col gap-1">
						{guests.map((g, i) => (
							<p key={i} className="text-sm font-medium text-gray-900 dark:text-white">
								{g.firstName} {g.lastName}
								{i === 0 && (
									<span className="ml-1.5 text-xs text-brand-600 dark:text-brand-400">
										(primary)
									</span>
								)}
								{g.email && (
									<span className="text-xs text-gray-500 dark:text-gray-400 ml-1.5">
										· {g.email}
									</span>
								)}
							</p>
						))}
					</div>
				)}
			</div>
			{filledCount < totalFields && (
				<p className="mt-3 text-xs text-brand-700 dark:text-brand-300">
					{filledCount}/{totalFields} details collected
				</p>
			)}
		</div>
	);
}

// ─── Failed booking card ───────────────────────────────────────────────

function BookingFailedCard({ result }: { result?: unknown }) {
	// Extract a human-readable error message from the tool result
	const rawResult = result as any;
	const detail =
		typeof rawResult === 'string'
			? rawResult
			: rawResult?.detail ||
				rawResult?.error ||
				rawResult?.message ||
				'Reservation could not be created. Please check the details and try again.';

	return (
		<div className="rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-4 my-2 shadow-sm max-w-md">
			<div className="flex items-center gap-2 mb-2">
				<span className="text-red-600 dark:text-red-400 font-bold text-sm">❌ Booking Failed</span>
			</div>
			<p className="text-sm text-red-700 dark:text-red-300">{detail}</p>
		</div>
	);
}

// ─── Confirmed booking card ───────────────────────────────────────────────────

function BookingConfirmedCard({ result }: { result: ReservationResult }) {
	const [editOpen, setEditOpen] = useState(false);

	const reservation = result?.reservations?.reservation?.[0];
	if (!reservation) {
		return (
			<div className="rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-4 my-2 shadow-sm max-w-sm">
				<p className="text-sm text-red-700 dark:text-red-300">
					Reservation created but response format was unexpected.
				</p>
			</div>
		);
	}

	const confirmationId =
		reservation.reservationIdList?.find((id) => id.type === 'CONFIRMATION')?.id ||
		reservation.reservationIdList?.[0]?.id ||
		'—';
	const nights = calcNights(reservation.roomStay?.arrivalDate, reservation.roomStay?.departureDate);
	const primaryGuest =
		reservation.reservationGuests?.find((g) => g.primary) || reservation.reservationGuests?.[0];
	const profile = primaryGuest?.profileInfo?.profile;
	const personName = profile?.customer?.personName?.[0];
	const guestName = [personName?.givenName, personName?.surname].filter(Boolean).join(' ') || '—';
	const total = reservation.roomStay?.total;
	const gc = reservation.roomStay?.guestCounts;

	return (
		<>
			<div className="w-full rounded-xl border border-green-200 dark:border-green-800 bg-white dark:bg-gray-900 p-4 shadow-md">
				{/* Header */}
				<div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100 dark:border-gray-800">
					<div className="flex items-center gap-2">
						<CheckCircle className="size-5 text-green-600 dark:text-green-400" />
						<span className="font-bold text-gray-900 dark:text-white text-sm">
							Booking Confirmed
						</span>
					</div>
					<StatusBadge status={reservation.reservationStatus} />
				</div>

				{/* Confirmation number */}
				<div className="mb-4 p-2 bg-green-50 dark:bg-green-900/20 rounded-lg text-center">
					<p className="text-xs text-gray-500 dark:text-gray-400">Confirmation Number</p>
					<p className="font-mono font-bold text-green-800 dark:text-green-300 text-base">
						{confirmationId}
					</p>
				</div>

				{/* Details grid */}
				<div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mb-4">
					<DetailRow
						label={
							<span className="flex items-center gap-1">
								<Hotel className="size-3" /> Hotel
							</span>
						}
						value={reservation.hotelId}
					/>
					<DetailRow
						label={
							<span className="flex items-center gap-1">
								<Users className="size-3" /> Guest
							</span>
						}
						value={guestName}
					/>
					<DetailRow
						label={
							<span className="flex items-center gap-1">
								<Calendar className="size-3" /> Check-in
							</span>
						}
						value={formatDate(reservation.roomStay?.arrivalDate)}
					/>
					<DetailRow
						label={
							<span className="flex items-center gap-1">
								<Calendar className="size-3" /> Check-out
							</span>
						}
						value={formatDate(reservation.roomStay?.departureDate)}
					/>
					<DetailRow label="Nights" value={nights} />
					<DetailRow
						label="Guests"
						value={
							gc
								? `${gc.adults || 0} adult${(gc.adults || 0) !== 1 ? 's' : ''}${gc.children ? `, ${gc.children} child${gc.children !== 1 ? 'ren' : ''}` : ''}`
								: '—'
						}
					/>
					<DetailRow label="Room Type" value={reservation.roomStay?.roomType} />
					<DetailRow label="Rate Plan" value={reservation.roomStay?.ratePlanCode} />
				</div>

				{/* Pricing */}
				{total && (
					<div className="border-t border-gray-100 dark:border-gray-800 pt-3 mb-4 space-y-1">
						{total.amountBeforeTax != null && (
							<div className="flex justify-between text-sm">
								<span className="text-gray-500 dark:text-gray-400">Before tax</span>
								<span className="text-gray-700 dark:text-gray-300">
									{formatCurrency(total.amountBeforeTax, total.currencyCode)}
								</span>
							</div>
						)}
						{total.amountAfterTax != null && (
							<div className="flex justify-between font-bold">
								<span className="text-gray-800 dark:text-gray-200">Total</span>
								<span className="text-green-700 dark:text-green-400">
									{formatCurrency(total.amountAfterTax, total.currencyCode)}
								</span>
							</div>
						)}
					</div>
				)}

				{/* Contact info */}
				{(profile?.email || profile?.phoneNumber) && (
					<div className="border-t border-gray-100 dark:border-gray-800 pt-3 mb-4 space-y-1">
						{profile.email && (
							<p className="text-xs text-gray-600 dark:text-gray-400">✉ {profile.email}</p>
						)}
						{profile.phoneNumber && (
							<p className="text-xs text-gray-600 dark:text-gray-400">📞 {profile.phoneNumber}</p>
						)}
					</div>
				)}

				{/* Edit button */}
				<div className="flex justify-end">
					<Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
						<Edit3 className="size-3 mr-1.5" />
						Edit Booking
					</Button>
				</div>
			</div>

			{editOpen && (
				<EditBookingModal
					isOpen={editOpen}
					onClose={() => setEditOpen(false)}
					reservation={reservation}
					hotelId={reservation.hotelId || ''}
				/>
			)}
		</>
	);
}

// ─── Main export ─────────────────────────────────────────────────────────────

export function BookingCard({
	toolName,
	state,
	args,
	result,
	isError,
	sendMessage,
}: BookingCardProps) {
	// Pricing tool card
	if (toolName === 'get_room_pricing') {
		if (state === 'call' || state === 'partial-call') {
			return (
				<div className="w-full rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 p-4 shadow-sm">
					<div className="flex items-center gap-2">
						<Loader2 className="size-4 text-blue-600 dark:text-blue-400 animate-spin" />
						<span className="text-sm text-blue-700 dark:text-blue-300">Fetching room pricing…</span>
					</div>
				</div>
			);
		}
		return <PricingCard result={result as PricingResult} args={args} sendMessage={sendMessage} />;
	}

	// Create reservation card
	if (toolName === 'create_reservation') {
		if (state === 'call' || state === 'partial-call') {
			return <BookingProgressCard args={args} />;
		}
		// Show failure card if SDK flagged an error OR if the result contains an error payload
		const resultAny = result as any;
		const hasErrorPayload =
			resultAny?.detail ||
			resultAny?.error ||
			(typeof resultAny === 'string' && resultAny.length > 0 && !resultAny.startsWith('{'));
		if (isError || hasErrorPayload) {
			return <BookingFailedCard result={result} />;
		}
		return <BookingConfirmedCard result={result as ReservationResult} />;
	}

	return null;
}
