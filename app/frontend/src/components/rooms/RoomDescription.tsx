import React from 'react';
import type { ContentRoomType as RoomType } from '@/types/room';

interface RoomDescriptionProps {
	room: RoomType;
}

export default function RoomDescription({ room }: RoomDescriptionProps) {
	// Join description array into paragraphs
	const description = room.description || [
		'Relax in our thoughtfully designed room featuring modern decor and all the comforts of home. Whether you are traveling for business or leisure, this room provides the perfect sanctuary to unwind after a busy day.',
	];

	return (
		<div className="prose dark:prose-invert max-w-none">
			<h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">About This Room</h3>
			{description.map((paragraph, index) => (
				<p key={index} className="text-gray-600 dark:text-gray-400 leading-relaxed text-base">
					- {paragraph}
				</p>
			))}
		</div>
	);
}
