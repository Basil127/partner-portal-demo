import asyncio
import logging
from typing import Any

from sqlalchemy import select
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine

from operaclone2.db.models.hotel import Hotel
from operaclone2.db.models.room_type import RoomType
from operaclone2.settings import settings

logger = logging.getLogger(__name__)


async def seed_hotel() -> None:
    """Seed hotel data into the database."""
    engine = create_async_engine(str(settings.db_url), echo=True)
    session_factory = async_sessionmaker(engine, expire_on_commit=False)

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

        if existing_hotel:
            logger.info("Updating existing hotel %s", hotel_data["id"])
            for key, value in hotel_data.items():
                setattr(existing_hotel, key, value)
        else:
            logger.info("Creating new hotel %s", hotel_data["id"])
            hotel = Hotel(**hotel_data)
            session.add(hotel)

        await session.commit()

    await engine.dispose()
    logger.info("Seed hotel completed successfully.")


async def seed_room() -> None:
    """Seed room type data into the database."""
    engine = create_async_engine(str(settings.db_url), echo=True)
    session_factory = async_sessionmaker(engine, expire_on_commit=False)

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

        for room_data in rooms_to_seed:
            r_code = room_data["room_type"]
            # Check if room exists
            query_room = select(RoomType).where(
                RoomType.room_type == r_code, RoomType.hotel_id_fk == hotel.id
            )
            result_room = await session.execute(query_room)
            existing_room = result_room.scalar_one_or_none()

            if existing_room:
                logger.info("Updating existing room %s", r_code)
                for key, value in room_data.items():
                    setattr(existing_room, key, value)
            else:
                logger.info("Creating new room %s", r_code)
                new_room = RoomType(**room_data)
                session.add(new_room)

        await session.commit()

    await engine.dispose()
    logger.info("Seed room completed successfully.")


if __name__ == "__main__":
    asyncio.run(seed_hotel())
    asyncio.run(seed_room())
