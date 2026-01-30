// Import from backend OpenAPI generated types
import type { ContentRoomType } from '@partner-portal/backend/api-types';
import { HotelInfo } from '../hotels/types';

export interface RoomDetailsProps {
    room: ContentRoomType;
    hotelInfo: HotelInfo;
}

export type { ContentRoomType as RoomType, HotelInfo };
