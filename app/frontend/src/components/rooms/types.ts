import type { ContentRoomType } from '@/types/room';
import { HotelInfo } from '../hotels/types';

export interface RoomDetailsProps {
	room: ContentRoomType;
	hotelInfo: HotelInfo;
}

export type { ContentRoomType as RoomType, HotelInfo };
