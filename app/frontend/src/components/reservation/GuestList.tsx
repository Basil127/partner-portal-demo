import React from 'react';
import ComponentCard from '../common/ComponentCard';
import GuestListItem, { type PersonName } from './GuestListItem';
import Button from '../ui/button/Button';
import Label from '../form/Label';
import Input from '../form/input/InputField';
import DatePicker from '../form/date-picker';
import { useBooking } from '@/context/BookingContext';

interface GuestListData {
	primaryGuest: PersonName;
	additionalGuests: PersonName[];
	email: string;
	phoneNumber: string;
	address: string;
	city: string;
	postalCode: string;
	countryCode: string;
	state: string;
}

interface GuestListCallbacks {
	onPrimaryGuestChange: (guest: PersonName) => void;
	onAdditionalGuestChange: (index: number, guest: PersonName) => void;
	onAddGuest: () => void;
	onRemoveGuest: (index: number) => void;
	onFieldChange: <K extends keyof GuestListData>(field: K, value: GuestListData[K]) => void;
}

interface GuestListErrors {
	primaryGuest?: {
		givenName?: string;
		surname?: string;
		middleName?: string;
	};
	additionalGuests?: Array<{
		givenName?: string;
		surname?: string;
		middleName?: string;
	}>;
	email?: string;
	phoneNumber?: string;
	address?: string;
	city?: string;
	postalCode?: string;
	countryCode?: string;
	state?: string;
	checkIn?: string;
	checkOut?: string;
}

interface GuestListProps {
	data: GuestListData;
	onChange: GuestListCallbacks;
	errors?: GuestListErrors;
	checkIn?: string;
	checkOut?: string;
	onCheckInChange?: (date: string) => void;
	onCheckOutChange?: (date: string) => void;
}

export default function GuestList({
	data,
	onChange,
	errors,
	checkIn: checkInProp,
	checkOut: checkOutProp,
	onCheckInChange,
	onCheckOutChange,
}: GuestListProps) {
	const bookingContext = useBooking();

	const checkIn = checkInProp ?? bookingContext.checkIn;
	const checkOut = checkOutProp ?? bookingContext.checkOut;
	const setCheckIn = onCheckInChange ?? bookingContext.setCheckIn;
	const setCheckOut = onCheckOutChange ?? bookingContext.setCheckOut;

	return (
		<ComponentCard title="Reservation Details">
			{/* Trip Details */}
			<div className="mb-6">
				<h3 className="text-lg font-medium mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
					Trip Details
				</h3>
				<div className="grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-6 w-full">
					<div>
						<Label htmlFor="checkIn">
							CheckIn <span className="text-red-500">*</span>
						</Label>
						<DatePicker
							id="check-in-date-picker"
							label=""
							placeholder="Select a date"
							defaultDate={checkIn}
							onChange={(_, currentDateString) => {
								setCheckIn(currentDateString);
							}}
						/>
						{errors?.checkIn && (
							<p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.checkIn}</p>
						)}
					</div>
					<div>
						<Label htmlFor="checkOut">
							CheckOut <span className="text-red-500">*</span>
						</Label>
						<DatePicker
							id="check-out-date-picker"
							label=""
							placeholder="Select a date"
							defaultDate={checkOut}
							onChange={(_, currentDateString) => {
								setCheckOut(currentDateString);
							}}
						/>
						{errors?.checkOut && (
							<p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.checkOut}</p>
						)}
					</div>
				</div>
			</div>
			{/* Contact Information */}
			<div className="mb-6">
				<h3 className="text-lg font-medium mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
					Contact Information
				</h3>
				<div className="grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-6 w-full">
					<div>
						<Label htmlFor="email">
							Email <span className="text-red-500">*</span>
						</Label>
						<Input
							id="email"
							type="email"
							placeholder="example@example.com"
							defaultValue={data.email}
							onChange={(e) => onChange.onFieldChange('email', e.target.value)}
							error={!!errors?.email}
						/>
						{errors?.email && (
							<p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email}</p>
						)}
					</div>
					<div>
						<Label htmlFor="phoneNumber">
							Phone Number <span className="text-red-500">*</span>
						</Label>
						<Input
							id="phoneNumber"
							type="tel"
							placeholder="+1234567890"
							defaultValue={data.phoneNumber}
							onChange={(e) => onChange.onFieldChange('phoneNumber', e.target.value)}
							error={!!errors?.phoneNumber}
						/>
						{errors?.phoneNumber && (
							<p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.phoneNumber}</p>
						)}
					</div>
					<div>
						<Label htmlFor="address">
							Address <span className="text-red-500">*</span>
						</Label>
						<Input
							id="address"
							type="text"
							placeholder="123 Main St"
							defaultValue={data.address}
							onChange={(e) => onChange.onFieldChange('address', e.target.value)}
							error={!!errors?.address}
						/>
						{errors?.address && (
							<p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.address}</p>
						)}
					</div>
					<div>
						<Label htmlFor="city">
							City <span className="text-red-500">*</span>
						</Label>
						<Input
							id="city"
							type="text"
							placeholder="New York"
							defaultValue={data.city}
							onChange={(e) => onChange.onFieldChange('city', e.target.value)}
							error={!!errors?.city}
						/>
						{errors?.city && (
							<p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.city}</p>
						)}
					</div>
					<div>
						<Label htmlFor="postalCode">
							Postal Code <span className="text-red-500">*</span>
						</Label>
						<Input
							id="postalCode"
							type="text"
							placeholder="10001"
							defaultValue={data.postalCode}
							onChange={(e) => onChange.onFieldChange('postalCode', e.target.value)}
							error={!!errors?.postalCode}
						/>
						{errors?.postalCode && (
							<p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.postalCode}</p>
						)}
					</div>
					<div>
						<Label htmlFor="countryCode">
							Country Code <span className="text-red-500">*</span>
						</Label>
						<Input
							id="countryCode"
							type="text"
							placeholder="US"
							defaultValue={data.countryCode}
							onChange={(e) =>
								onChange.onFieldChange('countryCode', e.target.value.toUpperCase().slice(0, 2))
							}
							error={!!errors?.countryCode}
						/>
						{errors?.countryCode && (
							<p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.countryCode}</p>
						)}
					</div>
					<div>
						<Label htmlFor="state">State (optional)</Label>
						<Input
							id="state"
							type="text"
							placeholder="NY"
							defaultValue={data.state || ''}
							onChange={(e) => onChange.onFieldChange('state', e.target.value)}
						/>
					</div>
				</div>
			</div>

			{/* Guest Information */}
			<div className="mb-6">
				<h3 className="text-lg font-medium mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
					Guest Information
				</h3>
				<div className="grid grid-cols-1 gap-4 w-full">
					<GuestListItem
						key="primary-guest"
						index={0}
						guest={data.primaryGuest}
						onChange={onChange.onPrimaryGuestChange}
						error={errors?.primaryGuest}
					/>
					{data.additionalGuests.map((guest, index) => (
						<GuestListItem
							key={`additional-guest-${index}`}
							index={index + 1}
							guest={guest}
							onChange={(updatedGuest) => onChange.onAdditionalGuestChange(index, updatedGuest)}
							onRemove={() => onChange.onRemoveGuest(index)}
							error={errors?.additionalGuests?.[index]}
						/>
					))}
				</div>

				<div className="mt-6 flex justify-end">
					<Button variant="primary" onClick={onChange.onAddGuest}>
						+ Add Additional Guest
					</Button>
				</div>
			</div>
		</ComponentCard>
	);
}
