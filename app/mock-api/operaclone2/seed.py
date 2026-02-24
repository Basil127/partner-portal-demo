import asyncio
import logging
from typing import Any

from sqlalchemy import select
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine

from operaclone2.db.models.hotel import Hotel
from operaclone2.db.models.room_type import RoomType
from operaclone2.settings import settings

logger = logging.getLogger(__name__)


async def seed_hotel(session_factory=None) -> None:
    """Seed hotel data into the database."""
    should_dispose = False
    engine = None
    if session_factory is None:
        engine = create_async_engine(str(settings.db_url), echo=True)
        session_factory = async_sessionmaker(engine, expire_on_commit=False)
        should_dispose = True

    async with session_factory() as session:
        # Check if exists
        query = select(Hotel).where(Hotel.id == 1)
        result = await session.execute(query)
        existing_hotel = result.scalar_one_or_none()

        hotel_data = {
            "id": 1,
            "hotel_id": "MOVENPICK_ELGOUNA",
            "hotel_code": "MOV_EG_001",
            "enterprise_id": "ACCOR",
            "chain_code": "MOVENPICK",
            "cluster_code": "ELGOUNA",
            "hotel_name": "Mövenpick Resort & Spa El Gouna",
            "hotel_description": (
                "The 5 star Mövenpick Resort & Spa El Gouna is nestled on a peninsula, "
                "with its own exclusive beachfront. It offers spectacular views of the "
                "Red Sea, the tranquil lagoons and the lush gardens. The resort is fully "
                "wheelchair accessible and environmentally friendly."
            ),
            "city_name": "El Gouna",
            "country_code": "EG",
            "state_prov": "Red Sea",
            "postal_code": "84511",
            "address_lines": ["P.O. Box 72", "Hill Villas Rd", "El Gouna", "Hurghada", "Egypt"],
            "latitude": 27.3969,
            "longitude": 33.6766,
            "currency_code": "EGP",
            "primary_language": "en",
            "total_number_of_rooms": 420,
            "time_zone_name": "Africa/Cairo",
            "time_zone_offset": "UTC+02:00",
            "check_in_time": "15:00",
            "check_out_time": "12:00",
            "property_amenities": [
                {"description": "Private Beach", "hotelAmenity": "BEACH"},
                {"description": "Raa SPA", "hotelAmenity": "SPA"},
                {"description": "Lagoon-style pool", "hotelAmenity": "POOL"},
                {"description": "Free WiFi", "hotelAmenity": "WIFI"},
                {"description": "Golf Course nearby", "hotelAmenity": "GOLF"},
                {"description": "Conference space (450 sq m)", "hotelAmenity": "CONFERENCE"},
            ],
            "communications": {
                "email": [
                    {
                        "type": "General",
                        "check": "2026-01-22",
                        "address": "resort.elgouna@movenpick.com",
                    }
                ],
                "phone": [
                    {"type": "Front Desk", "check": "2026-01-22", "number": "+20 65 3544501"}
                ],
            },
        }

        action = "update" if existing_hotel else "create"
        if existing_hotel:
            for key, value in hotel_data.items():
                setattr(existing_hotel, key, value)
        else:
            session.add(Hotel(**hotel_data))

        await session.commit()

    if should_dispose and engine:
        await engine.dispose()
    logger.info(
        "Seed hotel: %s hotel_id=%s name=%r",
        action,
        hotel_data["hotel_id"],
        hotel_data["hotel_name"],
    )


async def seed_room(session_factory=None) -> None:
    """Seed room type data into the database."""
    should_dispose = False
    engine = None
    if session_factory is None:
        engine = create_async_engine(str(settings.db_url), echo=True)
        session_factory = async_sessionmaker(engine, expire_on_commit=False)
        should_dispose = True

    async with session_factory() as session:
        # Find hotel id 1
        query = select(Hotel).where(Hotel.id == 1)
        result = await session.execute(query)
        hotel = result.scalar_one_or_none()

        if not hotel:
            logger.warning("Hotel with ID 1 not found. Cannot create room.")
            return

        rooms_to_seed = []

        # --- Classic King ---
        room_code_kng = "CLS_KNG"

        amenities_data_kng = {
            "Food And Beverage": [
                "Bottled water",
                "Coffee/tea making facilities",
                "Kettle",
                "Mini-refrigerator",
                "Free in Room Mineral Water",
                "Mini Bar",
            ],
            "Bathroom": [
                "Accessible bathroom",
                "Bathroom products",
                "Flexible showerhead",
                "Hair dryer in bathroom",
                "Make-up/magnifying mirror",
                "Mirror",
                "Telephone in bathroom",
                "Towel rack",
            ],
            "Media And Technology": [
                "Wireless internet in your room",
                "High speed internet",
                "Direct dial telephone",
                "Children's TV Channels",
                "Music TV channels",
                "Satellite/cable colour TV",
            ],
            "Service And Equipment": [
                "Audible smoke alarms in rooms",
                "Dead bolt in rooms",
                "Emergency info in rooms",
                "Keycard-operated door locks",
                "Safe deposit box in room",
                "Security Peephole",
                "Smoke alarm in room",
            ],
            "Comfort Features": ["Blackout curtain", "Hair dryer", "Slippers"],
            "Electric Facilities": ["220/240 V AC"],
            "Room Services": ["Operator wake up call"],
            "Temperature Air Control": [
                "Air Conditioning",
                "Individual heating and air conditioning adjustment",
            ],
            "Working Area": ["Business Desk"],
        }

        room_amenities_kng = []
        for category, items in amenities_data_kng.items():
            for item in items:
                room_amenities_kng.append(
                    {
                        "description": item,
                        "category": category,
                        "roomAmenity": item.upper().replace(" ", "_").replace("/", "_")[:20],
                    }
                )

        rooms_to_seed.append(
            {
                "hotel_id_fk": hotel.id,
                "hotel_room_type": "KNG_GV",
                "room_type": room_code_kng,
                "room_name": "Classic King",
                "room_category": "Standard",
                "description": [
                    (
                        "Classic Garden View Rooms accommodate a maximum of two adults "
                        "and one child. Accessible rooms are available."
                    ),
                    "40m²",
                    "Terrace",
                    "Walk-in shower",
                ],
                "room_view_type": "Garden View",
                "room_primary_bed_type": "King",
                "non_smoking_ind": True,
                "occupancy": {
                    "maxOccupancy": 4,
                    "adults": 2,
                    "children": 1,
                    "maxAdults": 2,
                    "maxChildren": 1,
                },
                "room_amenities": room_amenities_kng,
                "number_of_units": 10,
            }
        )

        # --- Classic Twin ---
        room_code_twn = "CLS_TWN"

        amenities_data_twn = {
            "Food And Beverage": [
                "Bottled water",
                "Coffee/tea making facilities",
                "Kettle",
                "Mini-refrigerator",
                "Free in Room Mineral Water",
                "Mini Bar",
            ],
            "Bathroom": [
                "Accessible bathroom",
                "Bathroom products",
                "Flexible showerhead",
                "Hair dryer in bathroom",
                "Make-up/magnifying mirror",
                "Mirror",
                "Telephone in bathroom",
                "Towel rack",
            ],
            "Media And Technology": [
                "Wireless internet in your room",
                "High speed internet",
                "Direct dial telephone",
                "Children's TV Channels",
                "Music TV channels",
                "Satellite/cable colour TV",
            ],
            "Service And Equipment": [
                "Audible smoke alarms in rooms",
                "Dead bolt in rooms",
                "Emergency info in rooms",
                "Keycard-operated door locks",
                "Safe deposit box in room",
                "Security Peephole",
                "Smoke alarm in room",
            ],
            "Electric Facilities": ["220/240 V AC"],
            "Room Services": ["Operator wake up call"],
            "Temperature Air Control": [
                "Air Conditioning",
                "Individual heating and air conditioning adjustment",
            ],
            "Working Area": ["Business Desk"],
        }

        room_amenities_twn = []
        for category, items in amenities_data_twn.items():
            for item in items:
                room_amenities_twn.append(
                    {
                        "description": item,
                        "category": category,
                        "roomAmenity": item.upper().replace(" ", "_").replace("/", "_")[:20],
                    }
                )

        rooms_to_seed.append(
            {
                "hotel_id_fk": hotel.id,
                "hotel_room_type": "TWN_GV",
                "room_type": room_code_twn,
                "room_name": "Classic Twin",
                "room_category": "Standard",
                "description": [
                    (
                        "In the bright and modern interiors of our Classic Garden View Rooms, "
                        "you can relax in a comfortable 40 sqm space with your choice of a "
                        "king-size bed or two single beds. Enjoy beautiful views over the "
                        "gardens from your terrace, which provides easy access t"
                    ),
                    "40m²",
                    "Terrace",
                    "Walk-in shower",
                ],
                "room_view_type": "Garden View",
                "room_primary_bed_type": "Twin",
                "non_smoking_ind": True,
                "occupancy": {
                    "maxOccupancy": 4,
                    "adults": 2,
                    "children": 1,
                    "maxAdults": 2,
                    "maxChildren": 1,  # Assuming same as king based on request (4 pers max)
                },
                "room_amenities": room_amenities_twn,
                "number_of_units": 10,
            }
        )

        # --- Helper for adding amenities ---
        def add_room_seed(
            code: str,
            name: str,
            category: str,
            desc: list[str],
            view: str,
            bed: str,
            occupancy: dict[str, Any],
            hotel_room_type: str,
            amenities: dict[str, list[str]],
            size_sqm: int = 40,
            price: float | None = None,
        ) -> None:
            # Basic amenities construction
            r_amenities = []
            for category_name, items in amenities.items():
                for item in items:
                    r_amenities.append(
                        {
                            "description": item,
                            "category": category_name,
                            "roomAmenity": item.upper()
                            .replace(" ", "_")
                            .replace("/", "_")
                            .replace("-", "_")[:20],
                        }
                    )

            rooms_to_seed.append(
                {
                    "hotel_id_fk": hotel.id,
                    "hotel_room_type": hotel_room_type,
                    "room_type": code,
                    "room_name": name,
                    "room_category": category,
                    "description": desc,
                    "room_view_type": view,
                    "room_primary_bed_type": bed,
                    "non_smoking_ind": True,
                    "occupancy": occupancy,
                    "room_amenities": r_amenities,
                    "number_of_units": 10,
                }
            )

        # 1. Deluxe King Lagoon View
        add_room_seed(
            "DLX_KNG_LV",
            "Deluxe King Lagoon View",
            "Deluxe",
            [
                (
                    "Deluxe Lagoon View Rooms offer a comfortable space of 40 sqm with a "
                    "stunning, modern design in which your choice of a king bed or twin beds "
                    "is centred, facing the lagoon. A shower and hairdryer are available in "
                    "the bathroom. F"
                ),
                "40m²",
                "Balcony or Terrace",
                "Walk-in shower",
                "High floor",
            ],
            "Lagoon View",
            "King",
            {"maxOccupancy": 4, "adults": 2, "children": 1, "maxAdults": 2, "maxChildren": 1},
            "DLX_LG_KNG",
            {
                "Food And Beverage": [
                    "Bottled water",
                    "Coffee/tea making facilities",
                    "Kettle",
                    "Mini-refrigerator",
                    "Free in Room Mineral Water",
                    "Mini Bar",
                ],
                "Bathroom": [
                    "Accessible bathroom",
                    "Bathroom products",
                    "Flexible showerhead",
                    "Hair dryer in bathroom",
                    "Make-up/magnifying mirror",
                    "Mirror",
                    "Telephone in bathroom",
                    "Towel rack",
                ],
                "Media And Technology": [
                    "Wireless internet in your room",
                    "High speed internet",
                    "Direct dial telephone",
                    "Children's TV Channels",
                    "Music TV channels",
                    "Satellite/cable colour TV",
                ],
                "Service And Equipment": [
                    "Audible smoke alarms in rooms",
                    "Dead bolt in rooms",
                    "Emergency info in rooms",
                    "Keycard-operated door locks",
                    "Safe deposit box in room",
                    "Security Peephole",
                    "Smoke alarm in room",
                ],
                "Comfort Features": ["Blackout curtain", "Hair dryer", "Slippers"],
                "Electric Facilities": ["220/240 V AC"],
                "Room Services": ["Operator wake up call"],
                "Temperature Air Control": [
                    "Air Conditioning",
                    "Individual heating and air conditioning adjustment",
                ],
                "Working Area": ["Business Desk"],
            },
        )

        # 2. Deluxe Twin Lagoon View
        add_room_seed(
            "DLX_TWN_LV",
            "Deluxe Twin Lagoon View",
            "Deluxe",
            [
                (
                    "Deluxe Lagoon View Rooms offer a comfortable space of 40 sqm with a "
                    "stunning, modern design in which your choice of a king bed or twin beds "
                    "is centred, facing the lagoon. A shower and hairdryer are available in "
                    "the bathroom."
                ),
                "40m²",
                "Balcony or Terrace",
                "Walk-in shower",
                "High floor",
            ],
            "Lagoon View",
            "Twin",
            {"maxOccupancy": 4, "adults": 2, "children": 1, "maxAdults": 2, "maxChildren": 1},
            "DLX_LG_TWN",
            {
                "Food And Beverage": [
                    "Bottled water",
                    "Coffee/tea making facilities",
                    "Kettle",
                    "Mini-refrigerator",
                    "Free in Room Mineral Water",
                    "Mini Bar",
                ],
                "Bathroom": [
                    "Accessible bathroom",
                    "Bathroom products",
                    "Flexible showerhead",
                    "Hair dryer in bathroom",
                    "Make-up/magnifying mirror",
                    "Mirror",
                    "Telephone in bathroom",
                    "Towel rack",
                ],
                "Media And Technology": [
                    "Wireless internet in your room",
                    "High speed internet",
                    "Direct dial telephone",
                    "Children's TV Channels",
                    "Music TV channels",
                    "Satellite/cable colour TV",
                ],
                "Service And Equipment": [
                    "Audible smoke alarms in rooms",
                    "Dead bolt in rooms",
                    "Emergency info in rooms",
                    "Keycard-operated door locks",
                    "Safe deposit box in room",
                    "Security Peephole",
                    "Smoke alarm in room",
                ],
                "Comfort Features": ["Blackout curtain", "Hair dryer", "Slippers"],
                "Electric Facilities": ["220/240 V AC"],
                "Room Services": ["Operator wake up call"],
                "Temperature Air Control": [
                    "Air Conditioning",
                    "Individual heating and air conditioning adjustment",
                ],
                "Working Area": ["Business Desk"],
            },
        )

        # 3. Deluxe King Sea View
        add_room_seed(
            "DLX_KNG_SV",
            "Deluxe King Sea View",
            "Deluxe",
            [
                (
                    "Deluxe Sea View Rooms accommodate a maximum of two adults and one "
                    "child in the existing bedding."
                ),
                "40m²",
                "Balcony or Terrace",
                "Walk-in shower",
                "High floor",
            ],
            "Ocean/Sea View",
            "King",
            {"maxOccupancy": 4, "adults": 2, "children": 1, "maxAdults": 2, "maxChildren": 1},
            "DLX_SV_KNG",
            {
                "Food And Beverage": [
                    "Bottled water",
                    "Coffee/tea making facilities",
                    "Kettle",
                    "Mini-refrigerator",
                    "Free in Room Mineral Water",
                    "Mini Bar",
                ],
                "Bathroom": [
                    "Accessible bathroom",
                    "Bathroom products",
                    "Flexible showerhead",
                    "Hair dryer in bathroom",
                    "Make-up/magnifying mirror",
                    "Mirror",
                    "Telephone in bathroom",
                    "Towel rack",
                ],
                "Media And Technology": [
                    "Wireless internet in your room",
                    "High speed internet",
                    "Direct dial telephone",
                    "Children's TV Channels",
                    "Music TV channels",
                    "Satellite/cable colour TV",
                ],
                "Service And Equipment": [
                    "Audible smoke alarms in rooms",
                    "Dead bolt in rooms",
                    "Emergency info in rooms",
                    "Keycard-operated door locks",
                    "Safe deposit box in room",
                    "Security Peephole",
                    "Smoke alarm in room",
                ],
                # No Comfort Features requested for this specific room
                "Electric Facilities": ["220/240 V AC"],
                "Room Services": ["Operator wake up call"],
                "Temperature Air Control": [
                    "Air Conditioning",
                    "Individual heating and air conditioning adjustment",
                ],
                "Working Area": ["Business Desk"],
            },
        )

        # 4. Deluxe Twin Sea View
        add_room_seed(
            "DLX_TWN_SV",
            "Deluxe Twin Sea View",
            "Deluxe",
            [
                (
                    "Our Deluxe Sea View Rooms welcome you into a superior 40 sqm space "
                    "which offers exquisite comfort in a prime location. Enjoy breath-taking "
                    "views over the Red Sea from your balcony or terrace."
                ),
                "40m²",
                "Balcony or Terrace",
                "Walk-in shower",
                "High floor",
            ],
            "Ocean/Sea View",
            "Twin",
            {"maxOccupancy": 4, "adults": 2, "children": 1, "maxAdults": 2, "maxChildren": 1},
            "DLX_SV_TWN",
            {
                "Food And Beverage": [
                    "Bottled water",
                    "Coffee/tea making facilities",
                    "Kettle",
                    "Mini-refrigerator",
                    "Free in Room Mineral Water",
                    "Mini Bar",
                ],
                "Bathroom": [
                    "Accessible bathroom",
                    "Bathroom products",
                    "Flexible showerhead",
                    "Hair dryer in bathroom",
                    "Make-up/magnifying mirror",
                    "Mirror",
                    "Telephone in bathroom",
                    "Towel rack",
                ],
                "Media And Technology": [
                    "Wireless internet in your room",
                    "High speed internet",
                    "Direct dial telephone",
                    "Children's TV Channels",
                    "Music TV channels",
                    "Satellite/cable colour TV",
                ],
                "Service And Equipment": [
                    "Audible smoke alarms in rooms",
                    "Dead bolt in rooms",
                    "Emergency info in rooms",
                    "Keycard-operated door locks",
                    "Safe deposit box in room",
                    "Security Peephole",
                    "Smoke alarm in room",
                ],
                "Comfort Features": ["Blackout curtain", "Slippers"],
                "Electric Facilities": ["220/240 V AC"],
                "Room Services": ["Operator wake up call"],
                "Temperature Air Control": [
                    "Air Conditioning",
                    "Individual heating and air conditioning adjustment",
                ],
                "Working Area": ["Business Desk"],
            },
        )

        # 5. Family room lagoon view
        add_room_seed(
            "FAM_LG",
            "Family room lagoon view",
            "Family",
            [
                (
                    "More space, a cool design and great views make our Family Lagoon View "
                    "Rooms an excellent choice for families. The 50 sqm duplex rooms are "
                    "spread over two floors, with the lower area featuring a king-size bed, "
                    "while an elevated sleeping area"
                ),
                "50m²",
                "Balcony or Duplex",
                "Walk-in shower",
                "High floor",
            ],
            "Lagoon View",
            "King",
            {
                "maxOccupancy": 4,
                "adults": 2,
                "children": 2,
                "maxAdults": 2,
                "maxChildren": 2,
            },  # Adjusted slightly for Family room intuition but staying close to 4 max
            "FAM_LG",
            {
                "Food And Beverage": [
                    "Bottled water",
                    "Coffee/tea making facilities",
                    "Kettle",
                    "Mini-refrigerator",
                    "Free in Room Mineral Water",
                    "Mini Bar",
                ],
                "Bathroom": [
                    "Accessible bathroom",
                    "Bathroom products",
                    "Flexible showerhead",
                    "Hair dryer in bathroom",
                    "Make-up/magnifying mirror",
                    "Mirror",
                    "Telephone in bathroom",
                    "Towel rack",
                ],
                "Media And Technology": [
                    "Wireless internet in your room",
                    "High speed internet",
                    "Direct dial telephone",
                    "Children's TV Channels",
                    "Music TV channels",
                    "Satellite/cable colour TV",
                ],
                "Service And Equipment": [
                    "Audible smoke alarms in rooms",
                    "Dead bolt in rooms",
                    "Emergency info in rooms",
                    "Keycard-operated door locks",
                    "Safe deposit box in room",
                    "Security Peephole",
                    "Smoke alarm in room",
                ],
                "Comfort Features": ["Blackout curtain", "Hair dryer"],
                "Electric Facilities": ["220/240 V AC"],
                "Room Services": ["Operator wake up call"],
                "Temperature Air Control": [
                    "Air Conditioning",
                    "Individual heating and air conditioning adjustment",
                ],
                "Working Area": ["Business Desk"],
            },
            size_sqm=50,
        )

        # 6. Deluxe Suite Sea View
        add_room_seed(
            "DLX_STE_SV",
            "Deluxe Suite Sea View",
            "Suite",
            [
                (
                    "Relax and unwind in our comfortable Deluxe Sea View Suites, which are "
                    "superb 72 sqm retreats in a great waterfront location, with lagoon or "
                    "sea views."
                ),
                "72m²",
                "Balcony or Terrace",
                "Bath",
                "Separate tub and shower",
                "High floor",
            ],
            "Ocean/Sea View",
            "King",
            {"maxOccupancy": 4, "adults": 2, "children": 2, "maxAdults": 2, "maxChildren": 2},
            "DLX_SV_STE",
            {
                "Food And Beverage": [
                    "Bottled water",
                    "Coffee/tea making facilities",
                    "Kettle",
                    "Mini-refrigerator",
                    "Free in Room Mineral Water",
                    "Mini Bar",
                ],
                "Bathroom": [
                    "Bathroom products",
                    "Bidet",
                    "Flexible showerhead",
                    "Hair dryer in bathroom",
                    "Make-up/magnifying mirror",
                    "Mirror",
                    "Telephone in bathroom",
                    "Towel rack",
                ],  # Note: "Accessible bathroom" removed per req
                "Media And Technology": [
                    "Wireless internet in your room",
                    "High speed internet",
                    "Direct dial telephone",
                    "Children's TV Channels",
                    "Music TV channels",
                    "Satellite/cable colour TV",
                ],
                "Service And Equipment": [
                    "Audible smoke alarms in rooms",
                    "Dead bolt in rooms",
                    "Emergency info in rooms",
                    "Keycard-operated door locks",
                    "Safe deposit box in room",
                    "Security Peephole",
                    "Smoke alarm in room",
                ],
                "Comfort Features": ["Blackout curtain", "Hair dryer", "Turn Down Services"],
                "Electric Facilities": ["220/240 V AC"],
                "Room Services": ["Operator wake up call"],
                "Temperature Air Control": [
                    "Air Conditioning",
                    "Individual heating and air conditioning adjustment",
                ],
                "Working Area": ["Business Desk"],
            },
            size_sqm=72,
        )

        # 7. Family Suite Sea view
        add_room_seed(
            "FAM_STE_SV",
            "Family Suite Sea view",
            "Suite",
            [
                (
                    "The Family Sea View Suite offers exquisite comfort and space for family "
                    "or friends. The 112 sqm space features a comfortable living room with "
                    "sofa corner and dining table, two separate ensuite bedrooms."
                ),
                "112m²",
                "Terrace",
                "Bath",
                "Walk-in shower",
            ],
            "Ocean/Sea View",
            "King",
            {
                "maxOccupancy": 3,
                "adults": 3,
                "children": 0,
                "maxAdults": 3,
                "maxChildren": 0,
            },  # Request says 3 pers max
            "FAM_SV_STE",
            {
                "Food And Beverage": [
                    "Bottled water",
                    "Coffee/tea making facilities",
                    "Kettle",
                    "Mini Bar",
                    "Mini bar with free soft drinks",
                    "Mini-refrigerator",
                    "Free in Room Mineral Water",
                ],
                "Bathroom": [
                    "Bathroom products",
                    "Bidet",
                    "Flexible showerhead",
                    "Hair dryer in bathroom",
                    "Make-up/magnifying mirror",
                    "Mirror",
                    "Telephone in bathroom",
                    "Towel rack",
                ],
                "Media And Technology": [
                    "Wireless internet in your room",
                    "High speed internet",
                    "Direct dial telephone",
                    "Children's TV Channels",
                    "Music TV channels",
                    "Satellite/cable colour TV",
                ],
                "Service And Equipment": [
                    "Audible smoke alarms in rooms",
                    "Dead bolt in rooms",
                    "Emergency info in rooms",
                    "Keycard-operated door locks",
                    "Safe deposit box in room",
                    "Security Peephole",
                    "Smoke alarm in room",
                ],
                # No Comfort Features
                "Electric Facilities": ["220/240 V AC"],
                "Room Services": ["Operator wake up call"],
                "Temperature Air Control": [
                    "Air Conditioning",
                    "Individual heating and air conditioning adjustment",
                ],
                "Working Area": ["Business Desk"],
            },
            size_sqm=112,
        )

        created_rooms: list[str] = []
        updated_rooms: list[str] = []

        for room_data in rooms_to_seed:
            r_code = room_data["room_type"]
            query_room = select(RoomType).where(
                RoomType.room_type == r_code, RoomType.hotel_id_fk == hotel.id
            )
            result_room = await session.execute(query_room)
            existing_room = result_room.scalar_one_or_none()

            if existing_room:
                for key, value in room_data.items():
                    setattr(existing_room, key, value)
                updated_rooms.append(r_code)
            else:
                session.add(RoomType(**room_data))
                created_rooms.append(r_code)

        await session.commit()

    if should_dispose and engine:
        await engine.dispose()
    logger.info(
        "Seed rooms (hotel_id=%d): created=%d %s, updated=%d %s",
        hotel.id,
        len(created_rooms),
        created_rooms,
        len(updated_rooms),
        updated_rooms,
    )


async def seed_casacook_hotel(session_factory=None) -> None:
    """Seed Casa Cook El Gouna hotel data into the database."""
    should_dispose = False
    engine = None
    if session_factory is None:
        engine = create_async_engine(str(settings.db_url), echo=True)
        session_factory = async_sessionmaker(engine, expire_on_commit=False)
        should_dispose = True

    async with session_factory() as session:
        query = select(Hotel).where(Hotel.id == 2)
        result = await session.execute(query)
        existing_hotel = result.scalar_one_or_none()

        hotel_data = {
            "id": 2,
            "hotel_id": "CASACOOK_ELGOUNA",
            "hotel_code": "CCK_EG_001",
            "enterprise_id": "CASACOOK",
            "chain_code": "CASACOOK",
            "cluster_code": "ELGOUNA",
            "hotel_name": "Casa Cook El Gouna",
            "hotel_description": (
                "Set between golden dunes and the crystal-clear waters of the Red Sea, "
                "Casa Cook El Gouna is a secluded escape where modern design meets the raw beauty "
                "of Egypt's coastline. Located just a short ride from El Gouna's marina and "
                "vibrant downtown, this adults-only retreat offers a perfect balance of serene "
                "relaxation and lively exploration. Our 100-room sanctuary is designed for those "
                "who crave laid-back luxury, with a curated selection of rooms, suites and private "
                "villas. Spend sun-drenched days lounging by the beachside pool, sipping refreshing "
                "cocktails to the sounds of a mellow DJ set, or soaring over the Red Sea on a "
                "kiteboard. Evenings invite slow, social dining at the Kitchen Club, where Middle "
                "Eastern flavours and fresh local ingredients take center stage."
            ),
            "city_name": "El Gouna",
            "country_code": "EG",
            "state_prov": "Red Sea",
            "postal_code": "84511",
            "address_lines": [
                "Casa Cook El Gouna",
                "Qesm Hurghada",
                "Red Sea Governorate",
                "Egypt",
            ],
            "latitude": 27.3950,
            "longitude": 33.6750,
            "currency_code": "USD",
            "primary_language": "en",
            "total_number_of_rooms": 100,
            "time_zone_name": "Africa/Cairo",
            "time_zone_offset": "UTC+02:00",
            "check_in_time": "15:00",
            "check_out_time": "12:00",
            "property_amenities": [
                {"description": "Beachside Pool", "hotelAmenity": "POOL"},
                {"description": "The Kitchen Club Restaurant", "hotelAmenity": "RESTAURANT"},
                {"description": "Spa & Wellness", "hotelAmenity": "SPA"},
                {"description": "Kiteboarding & Watersports", "hotelAmenity": "WATERSPORTS"},
                {"description": "Free Wi-Fi", "hotelAmenity": "WIFI"},
                {"description": "Adults Only (18+)", "hotelAmenity": "ADULTS_ONLY"},
                {"description": "DJ Pool Sessions", "hotelAmenity": "ENTERTAINMENT"},
            ],
            "communications": {
                "email": [
                    {
                        "type": "General",
                        "check": "2026-01-22",
                        "address": "elgouna@casacook.com",
                    }
                ],
                "phone": [
                    {"type": "Front Desk", "check": "2026-01-22", "number": "+20 65 3580700"}
                ],
            },
            "transportations": [
                {"description": "El Gouna Marina", "distance": "3 km", "type": "Marina"},
                {
                    "description": "Hurghada International Airport",
                    "distance": "42 km",
                    "type": "Airport",
                },
            ],
            "location_info": (
                "Casa Cook El Gouna, Qesm Hurghada, Red Sea Governorate, Egypt. "
                "El Gouna Marina – 3 km. Hurghada International Airport – 42 km."
            ),
        }

        action = "update" if existing_hotel else "create"
        if existing_hotel:
            for key, value in hotel_data.items():
                setattr(existing_hotel, key, value)
        else:
            session.add(Hotel(**hotel_data))

        await session.commit()

    if should_dispose and engine:
        await engine.dispose()
    logger.info(
        "Seed hotel: %s hotel_id=%s name=%r",
        action,
        hotel_data["hotel_id"],
        hotel_data["hotel_name"],
    )


async def seed_casacook_rooms(session_factory=None) -> None:
    """Seed Casa Cook El Gouna room types into the database."""
    should_dispose = False
    engine = None
    if session_factory is None:
        engine = create_async_engine(str(settings.db_url), echo=True)
        session_factory = async_sessionmaker(engine, expire_on_commit=False)
        should_dispose = True

    async with session_factory() as session:
        query = select(Hotel).where(Hotel.id == 2)
        result = await session.execute(query)
        hotel = result.scalar_one_or_none()

        if not hotel:
            logger.warning("Casa Cook hotel (ID 2) not found. Cannot create rooms.")
            return

        # Standard amenities shared across all Casa Cook room tiers
        _CC_BASE: dict[str, list[str]] = {
            "Food And Beverage": [
                "Bottled water",
                "Coffee/espresso machine",
                "Mini Bar",
                "Mini-refrigerator",
                "Complimentary soft drinks",
            ],
            "Bathroom": [
                "Artisanal bathroom products",
                "Rain shower",
                "Hair dryer",
                "Luxury bathrobes",
                "Towel rack",
                "Make-up/magnifying mirror",
            ],
            "Media And Technology": [
                "Smart TV",
                "Streaming services",
                "High speed Wi-Fi",
                "Bluetooth speaker",
            ],
            "Service And Equipment": [
                "Safe deposit box in room",
                "Keycard-operated door locks",
                "Smoke alarm in room",
                "Security Peephole",
            ],
            "Comfort Features": [
                "Air Conditioning",
                "Ceiling fan",
                "Organic cotton linens",
                "Blackout curtains",
            ],
            "Room Services": ["Operator wake up call"],
        }

        _CC_TERRACE_EXTRAS: list[str] = ["Hammock", "Outdoor cushioned seating", "Sun loungers"]
        _CC_POOL_ACCESS: list[str] = ["Direct shared pool access", "Pool towels provided"]
        _CC_VILLA_EXTRAS: list[str] = [
            "Separate living area",
            "Dining area",
            "Private veranda",
            "Extra storage",
        ]

        def _cc_amenities(extras: dict[str, list[str]] | None = None) -> dict[str, list[str]]:
            """Merge base amenities with tier-specific extras."""
            merged: dict[str, list[str]] = {k: list(v) for k, v in _CC_BASE.items()}
            if extras:
                for cat, items in extras.items():
                    merged.setdefault(cat, []).extend(items)
            return merged

        adults_only_occ = {
            "maxOccupancy": 2,
            "adults": 2,
            "children": 0,
            "maxAdults": 2,
            "maxChildren": 0,
        }
        villa_occ = {
            "maxOccupancy": 4,
            "adults": 4,
            "children": 0,
            "maxAdults": 4,
            "maxChildren": 0,
        }

        rooms_to_seed: list[dict[str, Any]] = []

        def _add(
            code: str,
            hotel_room_type: str,
            name: str,
            category: str,
            desc: list[str],
            view: str,
            bed: str,
            occupancy: dict[str, Any],
            amenities: dict[str, list[str]],
            units: int = 10,
        ) -> None:
            r_amenities = [
                {
                    "description": item,
                    "category": cat,
                    "roomAmenity": item.upper()
                    .replace(" ", "_")
                    .replace("/", "_")
                    .replace("-", "_")[:20],
                }
                for cat, items in amenities.items()
                for item in items
            ]
            rooms_to_seed.append(
                {
                    "hotel_id_fk": hotel.id,
                    "hotel_room_type": hotel_room_type,
                    "room_type": code,
                    "room_name": name,
                    "room_category": category,
                    "description": desc,
                    "room_view_type": view,
                    "room_primary_bed_type": bed,
                    "non_smoking_ind": True,
                    "occupancy": occupancy,
                    "room_amenities": r_amenities,
                    "number_of_units": units,
                }
            )

        # 1. Deluxe Room Garden View — 39m²
        _add(
            "CC_DLX_GV",
            "CC_DLX_GV",
            "Deluxe Room Garden View",
            "Deluxe",
            [
                "A peaceful hideaway designed with earthy tones and hand-picked accessories, "
                "evoking the charm of the Egyptian desert. A king-size bed, a cosy sofa and "
                "a patio invite you to relax, while views of the lush garden landscape add "
                "a touch of nature's calm.",
                "39m²",
                "Private patio",
                "Garden views",
            ],
            "Garden View",
            "King",
            adults_only_occ,
            _cc_amenities({"Outdoor": ["Private patio", "Outdoor lounge seating"]}),
        )

        # 2. Deluxe Sea View — 39m²
        _add(
            "CC_DLX_SV",
            "CC_DLX_SV",
            "Deluxe Sea View",
            "Deluxe",
            [
                "Wake up to the glint of the Red Sea in this thoughtfully designed retreat. "
                "Floor-to-ceiling glass doors lead to a patio with plush seating, perfect for "
                "soaking up the breathtaking coastal views. Inside, a king-size bed, boho-style "
                "and natural furnishings create a space for pure relaxation.",
                "39m²",
                "Sea-view patio",
                "Floor-to-ceiling glass doors",
            ],
            "Sea View",
            "King",
            adults_only_occ,
            _cc_amenities({"Outdoor": ["Sea-view private patio", "Plush outdoor seating"]}),
        )

        # 3. Premium King Terrace Sea View — 48m²
        _add(
            "CC_PRE_KNG_TV",
            "CC_PRE_KNG_TV",
            "Premium King Terrace Sea View",
            "Premium",
            [
                "With a sprawling private roof terrace, this space is tailor-made for sunny days. "
                "Lounge on outdoor seating, sway in a hammock or simply take in the sweeping sea "
                "views. Inside, a king-size bed, a comfy sofa and handpicked furnishings make "
                "you feel at home.",
                "48m²",
                "Private roof terrace",
                "Hammock",
                "Sea views",
            ],
            "Sea View",
            "King",
            adults_only_occ,
            _cc_amenities({"Outdoor": _CC_TERRACE_EXTRAS + ["Private roof terrace"]}),
        )

        # 4. Premium Room Twin — 48m² Mountain/Garden View
        _add(
            "CC_PRE_TWN_MV",
            "CC_PRE_TWN_MV",
            "Premium Room Twin",
            "Premium",
            [
                "Framed by never-ending desert and garden views, this rooftop room is an inviting "
                "space. A hammock and cushioned seating on the terrace provide the ultimate spot to "
                "unwind, while twin beds, rustic wooden finishes and stone details create a calming "
                "indoor retreat.",
                "48m²",
                "Private roof terrace",
                "Hammock",
                "Desert & garden views",
            ],
            "Mountain View",
            "Twin",
            adults_only_occ,
            _cc_amenities({"Outdoor": _CC_TERRACE_EXTRAS + ["Private roof terrace"]}),
        )

        # 5. Junior Suite King Pool View — 42m²
        _add(
            "CC_JS_K_PV",
            "CC_JS_K_PV",
            "Junior Suite King Pool View",
            "Suite",
            [
                "Designed for indoor-outdoor living, this suite offers direct access to a shared "
                "pool, with loungers and plush seating creating the perfect sun-soaked retreat. "
                "Inside, a king-size bed, soft sofa and earthy furnishings provide a comfortable haven.",
                "42m²",
                "Pool access veranda",
                "Sun loungers",
            ],
            "Pool View",
            "King",
            adults_only_occ,
            _cc_amenities({"Outdoor": _CC_POOL_ACCESS + ["Veranda with sun loungers"]}),
        )

        # 6. Junior Suite Twin Pool View — 42m²
        _add(
            "CC_JS_T_PV",
            "CC_JS_T_PV",
            "Junior Suite Twin Pool View",
            "Suite",
            [
                "With cool waters lapping at your feet, this suite is all about connection to nature. "
                "The veranda is furnished with sumptuous loungers and cushioned seating, while inside "
                "twin beds, organic materials and warm textures create a relaxing oasis.",
                "42m²",
                "Pool access veranda",
                "Sun loungers",
            ],
            "Pool View",
            "Twin",
            adults_only_occ,
            _cc_amenities({"Outdoor": _CC_POOL_ACCESS + ["Veranda with sun loungers"]}),
        )

        # 7. Junior Suite King Sea View — 42m²
        _add(
            "CC_JS_K_SV",
            "CC_JS_K_SV",
            "Junior Suite King Sea View",
            "Suite",
            [
                "Perched beside the Red Sea, this suite offers endless sea views and direct access "
                "to a shared pool. A veranda with sun loungers and plush seating is the perfect spot "
                "to unwind.",
                "42m²",
                "Sea-view veranda",
                "Shared pool access",
            ],
            "Sea View",
            "King",
            adults_only_occ,
            _cc_amenities({"Outdoor": _CC_POOL_ACCESS + ["Sea-view veranda", "Sun loungers"]}),
        )

        # 8. Junior Suite Twin Sea View — 42m²
        _add(
            "CC_JS_T_SV",
            "CC_JS_T_SV",
            "Junior Suite Twin Sea View",
            "Suite",
            [
                "With the Red Sea stretching out before you, this suite offers complete relaxation. "
                "A decked veranda with loungers and soft seating provides the perfect place to pause "
                "before stepping straight into the serene shared pool.",
                "42m²",
                "Decked sea-view veranda",
                "Shared pool access",
            ],
            "Sea View",
            "Twin",
            adults_only_occ,
            _cc_amenities({"Outdoor": _CC_POOL_ACCESS + ["Decked veranda", "Sun loungers"]}),
        )

        # 9. Two Bedroom Villa Pool View — 83m², sleeps 4
        _add(
            "CC_2BR_VL_PV",
            "CC_2BR_VL_PV",
            "Two Bedroom Villa Pool View",
            "Villa",
            [
                "Designed for spacious living, this elegantly crafted villa features two private "
                "bedrooms, a generous living area and a private veranda overlooking the pool. "
                "Ideal for two couples or those wanting ultimate space.",
                "83m²",
                "Private pool-view veranda",
                "Separate living area",
                "Two bedrooms",
            ],
            "Pool View",
            "King",
            villa_occ,
            _cc_amenities({"Outdoor": _CC_POOL_ACCESS + _CC_VILLA_EXTRAS}),
            units=5,
        )

        # 10. Two Bedroom Villa Sea View — 83m², sleeps 4
        _add(
            "CC_2BR_VL_SV",
            "CC_2BR_VL_SV",
            "Two Bedroom Villa Sea View",
            "Villa",
            [
                "Wake up to sweeping Red Sea views in this elegantly designed villa, featuring "
                "two private bedrooms, a spacious living area and a private sun-soaked veranda. "
                "The ultimate adults-only retreat.",
                "83m²",
                "Private sea-view veranda",
                "Separate living area",
                "Two bedrooms",
            ],
            "Sea View",
            "King",
            villa_occ,
            _cc_amenities(
                {"Outdoor": ["Private sea-view veranda", "Sun loungers"] + _CC_VILLA_EXTRAS}
            ),
            units=5,
        )

        created_rooms: list[str] = []
        updated_rooms: list[str] = []

        for room_data in rooms_to_seed:
            r_code = room_data["room_type"]
            query_room = select(RoomType).where(
                RoomType.room_type == r_code, RoomType.hotel_id_fk == hotel.id
            )
            result_room = await session.execute(query_room)
            existing_room = result_room.scalar_one_or_none()

            if existing_room:
                for key, value in room_data.items():
                    setattr(existing_room, key, value)
                updated_rooms.append(r_code)
            else:
                session.add(RoomType(**room_data))
                created_rooms.append(r_code)

        await session.commit()

    if should_dispose and engine:
        await engine.dispose()
    logger.info(
        "Seed rooms (hotel_id=%d): created=%d %s, updated=%d %s",
        hotel.id,
        len(created_rooms),
        created_rooms,
        len(updated_rooms),
        updated_rooms,
    )


if __name__ == "__main__":
    asyncio.run(seed_hotel())
    asyncio.run(seed_room())
    asyncio.run(seed_casacook_hotel())
    asyncio.run(seed_casacook_rooms())
