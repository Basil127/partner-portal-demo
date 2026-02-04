import React from 'react';
import Card from '../common/Card';
import Input from '../form/input/InputField';
import Label from '../form/Label';
import { CloseIcon } from '@/icons';

export interface PersonName {
	givenName: string;
	surname: string;
	middleName?: string;
	isChild?: boolean;
}

interface GuestListItemProps {
	index: number;
	guest: PersonName;
	onChange: (guest: PersonName) => void;
	onRemove?: () => void;
	error?: {
		givenName?: string;
		surname?: string;
		middleName?: string;
	};
}

export default function GuestListItem({
	guest,
	index,
	onChange,
	onRemove,
	error,
}: GuestListItemProps) {
	const isPrimaryGuest = index === 0;

	return (
		<Card>
			<div className="flex items-start justify-between gap-4 border-b border-gray-100 dark:border-gray-800 pb-3">
				<div className="flex-1">
					<h3 className="text-xl font-bold text-gray-900 dark:text-white">
						{isPrimaryGuest ? 'Primary Guest Information' : `Additional Guest ${index}`}
					</h3>
				</div>
				{!isPrimaryGuest && onRemove && (
					<div className="shrink-0">
						<button
							type="button"
							onClick={onRemove}
							className="p-2 rounded-lg justify-center hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
							aria-label="Remove guest"
						>
							<CloseIcon
								width={24}
								height={24}
								className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
							/>
						</button>
					</div>
				)}
			</div>
			<div className="grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-6 w-full pt-4">
				<div>
					<Label htmlFor={`guest-${index}-givenName`}>
						First Name {isPrimaryGuest && <span className="text-red-500">*</span>}
					</Label>
					<Input
						id={`guest-${index}-givenName`}
						type="text"
						placeholder="First Name"
						defaultValue={guest.givenName || ''}
						onChange={(e) => onChange({ ...guest, givenName: e.target.value })}
						error={!!error?.givenName}
					/>
					{error?.givenName && (
						<p className="mt-1 text-sm text-red-600 dark:text-red-400">{error.givenName}</p>
					)}
				</div>
				<div>
					<Label htmlFor={`guest-${index}-middleName`}>Middle Name(s)</Label>
					<Input
						id={`guest-${index}-middleName`}
						type="text"
						placeholder="Middle Name (optional)"
						defaultValue={guest.middleName || ''}
						onChange={(e) => onChange({ ...guest, middleName: e.target.value })}
					/>
				</div>
				<div>
					<Label htmlFor={`guest-${index}-surname`}>
						Last Name {isPrimaryGuest && <span className="text-red-500">*</span>}
					</Label>
					<Input
						id={`guest-${index}-surname`}
						type="text"
						placeholder="Last Name"
						defaultValue={guest.surname || ''}
						onChange={(e) => onChange({ ...guest, surname: e.target.value })}
						error={!!error?.surname}
					/>
					{error?.surname && (
						<p className="mt-1 text-sm text-red-600 dark:text-red-400">{error.surname}</p>
					)}
				</div>
			</div>
			<div className="pt-4">
				<label className="flex items-center gap-2 cursor-pointer">
					<input
						type="checkbox"
						id={`guest-${index}-isChild`}
						checked={guest.isChild || false}
						onChange={(e) => onChange({ ...guest, isChild: e.target.checked })}
						className="w-4 h-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800"
					/>
					<span className="text-sm text-gray-700 dark:text-gray-300">This guest is a child</span>
				</label>
			</div>
		</Card>
	);
}
