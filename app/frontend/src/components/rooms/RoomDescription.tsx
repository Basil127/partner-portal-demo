import React from 'react';
import { RoomType } from './types';

interface RoomDescriptionProps {
	room: RoomType;
}

export default function RoomDescription({ room }: RoomDescriptionProps) {
	return (
		<div className="prose dark:prose-invert max-w-none">
			<h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
				About This Room
			</h3>
			<p className="text-gray-600 dark:text-gray-400 leading-relaxed text-base">
				{room.roomDescription ||
					'Relax in our thoughtfully designed room featuring modern decor and all the comforts of home. Whether you are traveling for business or leisure, this room provides the perfect sanctuary to unwind after a busy day.'}
			</p>
		</div>
	);
}
