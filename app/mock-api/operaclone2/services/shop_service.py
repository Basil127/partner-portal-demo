from datetime import date
from types import SimpleNamespace
from typing import Any

from fastapi import Depends

from operaclone2.db.dao.hotel_dao import HotelDAO
from operaclone2.web.api.shop.schema import (
    Address,
    BlockInformation,
    HotelAvailabilityStatus,
    Offer,
    OfferDetailsPropertyInfo,
    OfferDetailsRatePlan,
    OfferDetailsResponse,
    OfferDetailsRoomType,
    OfferMinMaxTotalType,
    OfferOverallRateInformation,
    OfferRateInformation,
    OfferRateMode,
    OfferRatePlanCommission,
    OfferTotalType,
    OfferTotalTypeWithTaxes,
    PropertyOffersPropertyInfo,
    PropertyOffersRatePlan,
    PropertyOffersResponse,
    PropertyOffersRoomStay,
    PropertyOffersRoomType,
    PropertySearchPropertyInfo,
    PropertySearchRatePlan,
    PropertySearchResponse,
    PropertySearchRoomStay,
)

# ---------------------------------------------------------------------------
# Per-hotel room types: (booking_code, display_name, description, nightly_base_USD)
# ---------------------------------------------------------------------------
_HOTEL_ROOM_TYPES: dict[str, list[tuple[str, str, str, float]]] = {
    "MOV_EG_001": [
        (
            "CLSTW",
            "Classic Twin",
            "In the bright and modern interiors of our Classic Garden View Rooms, you can relax "
            "in a comfortable 40 sqm space with twin beds. Enjoy beautiful views over the gardens "
            "from your terrace.",
            189.00,
        ),
        (
            "CLSKG",
            "Classic King",
            "Classic Garden View Rooms accommodate a maximum of two adults and one child. "
            "Accessible rooms are available.",
            189.00,
        ),
        (
            "DLXLG",
            "Deluxe King Lagoon View",
            "Deluxe Lagoon View Rooms offer a comfortable space of 40 sqm with a stunning, modern "
            "design, centred on a king bed facing the lagoon.",
            249.00,
        ),
        (
            "DLXTL",
            "Deluxe Twin Lagoon View",
            "Deluxe Lagoon View Rooms offer a comfortable space of 40 sqm with a stunning, modern "
            "design, twin beds facing the lagoon. A shower and hairdryer are available.",
            249.00,
        ),
        (
            "DLXSV",
            "Deluxe King Sea View",
            "Deluxe Sea View Rooms accommodate a maximum of two adults and one child. "
            "Breathtaking Red Sea views from your balcony.",
            299.00,
        ),
        (
            "DLXTS",
            "Deluxe Twin Sea View",
            "Our Deluxe Sea View Rooms welcome you into a superior 40 sqm space offering "
            "exquisite comfort. Enjoy breathtaking views over the Red Sea from your terrace.",
            299.00,
        ),
        (
            "FAMLG",
            "Family room lagoon view",
            "More space, a cool design and great lagoon views make our Family Lagoon View Rooms "
            "an excellent choice for families. The 50 sqm duplex rooms span two floors.",
            369.00,
        ),
        (
            "SUISV",
            "Deluxe Suite Sea View",
            "Relax and unwind in our comfortable Deluxe Sea View Suites — superb 72 sqm retreats "
            "in a great waterfront location, with lagoon or sea views.",
            549.00,
        ),
        (
            "FAMSV",
            "Family Suite Sea view",
            "The Family Sea View Suite offers exquisite comfort and space for family or friends. "
            "112 sqm featuring a living room, dining area, and two separate ensuite bedrooms.",
            659.00,
        ),
        (
            "PRSTV",
            "Presidential Suite Sea View",
            "The Presidential Suite offers ultimate space with a bedroom, living room, and "
            "private balcony pool. A separate guest entrance allows private entertaining.",
            1800.00,
        ),
    ],
    "CCK_EG_001": [
        (
            "CCDLXGV",
            "Deluxe Room Garden View",
            "A peaceful hideaway designed with earthy tones and hand-picked accessories, evoking "
            "the charm of the Egyptian desert. A king-size bed, cosy sofa and patio invite you "
            "to relax, while views of the lush garden landscape add a touch of nature's calm. 39m².",
            329.00,
        ),
        (
            "CCDLXSV",
            "Deluxe Sea View",
            "Wake up to the glint of the Red Sea in this thoughtfully designed retreat. "
            "Floor-to-ceiling glass doors open to a patio with plush seating. Inside, a king-size "
            "bed, boho-style and natural furnishings create a space for pure relaxation. 39m².",
            379.00,
        ),
        (
            "CCPRKTSV",
            "Premium King Terrace Sea View",
            "With a sprawling private roof terrace, this space is tailor-made for sunny days. "
            "Lounge on outdoor seating, sway in a hammock or take in sweeping sea views. Inside, "
            "a king-size bed and handpicked furnishings make you feel at home. 48m².",
            449.00,
        ),
        (
            "CCPRTMV",
            "Premium Room Twin",
            "Framed by never-ending desert and garden views, this rooftop room is an inviting "
            "space. A hammock and cushioned seating on the terrace provide the ultimate spot to "
            "unwind, while twin beds, rustic wooden finishes and stone details create a calming "
            "indoor retreat. 48m².",
            399.00,
        ),
        (
            "CCJSKPV",
            "Junior Suite King Pool View",
            "Designed for indoor-outdoor living, this suite offers direct access to a shared pool, "
            "with loungers and plush seating. Inside, a king-size bed, soft sofa and earthy "
            "furnishings provide a comfortable haven. 42m².",
            479.00,
        ),
        (
            "CCJSTPV",
            "Junior Suite Twin Pool View",
            "With cool waters lapping at your feet, this suite is all about connection to nature. "
            "The veranda is furnished with sun loungers and cushioned seating, while inside twin "
            "beds, organic materials and warm textures create a relaxing oasis. 42m².",
            479.00,
        ),
        (
            "CCJSKSV",
            "Junior Suite King Sea View",
            "Perched beside the Red Sea, this suite offers endless sea views and direct access to "
            "a shared pool. A veranda with sun loungers and plush seating is the perfect spot "
            "to unwind. 42m².",
            529.00,
        ),
        (
            "CCJSTSV",
            "Junior Suite Twin Sea View",
            "With the Red Sea stretching out before you, this suite offers complete relaxation. "
            "A decked veranda with loungers provides the perfect place to pause before stepping "
            "into the serene shared pool. 42m².",
            529.00,
        ),
        (
            "CC2BVPV",
            "Two Bedroom Villa Pool View",
            "Designed for spacious living, this elegantly crafted villa features two private "
            "bedrooms, a generous living area and a private veranda overlooking the pool. "
            "Ideal for couples travelling together or those wanting extra space. 83m².",
            779.00,
        ),
        (
            "CC2BVSV",
            "Two Bedroom Villa Sea View",
            "Wake up to sweeping Red Sea views in this elegantly designed villa, featuring two "
            "private bedrooms, a spacious living area and a private sun-soaked veranda. "
            "The ultimate adults-only retreat. 83m².",
            849.00,
        ),
    ],
}

# Minimum and maximum nightly base rates (USD) per hotel code
_HOTEL_MIN_MAX: dict[str, tuple[float, float]] = {
    "MOV_EG_001": (189.00, 1800.00),
    "CCK_EG_001": (329.00, 849.00),
}
_DEFAULT_MIN_MAX: tuple[float, float] = (189.00, 1800.00)


class ShopService:
    """Service for shop domain logic."""

    def __init__(self, hotel_dao: HotelDAO = Depends()) -> None:
        self.hotel_dao = hotel_dao

    async def search_properties(
        self,
        hotel_codes: list[str],
        arrival_date: date,
        departure_date: date,
    ) -> PropertySearchResponse:
        """Search for properties."""
        hotels = await self.hotel_dao.get_hotels_by_codes(hotel_codes)
        nights = max((departure_date - arrival_date).days, 1)

        room_stays = []
        for hotel in hotels:
            room_stays.append(
                PropertySearchRoomStay(
                    propertyInfo=PropertySearchPropertyInfo(
                        hotelCode=hotel.hotel_code,
                        hotelName=hotel.hotel_name,
                        chainCode=hotel.chain_code,
                        isAlternate=False,
                    ),
                    availability=HotelAvailabilityStatus.AvailableForSale,
                    ratePlans=[
                        PropertySearchRatePlan(
                            ratePlanCode="XDAILY",
                            ratePlanName="Daily Rate",
                            ratePlanType="10",
                            identificationRequired=False,
                            availabilityStatus="AvailableForSale",
                        )
                    ],
                    minRate=OfferMinMaxTotalType(
                        amountBeforeTax=_HOTEL_MIN_MAX.get(hotel.hotel_code, _DEFAULT_MIN_MAX)[0]
                        * nights,
                        amountAfterTax=round(
                            _HOTEL_MIN_MAX.get(hotel.hotel_code, _DEFAULT_MIN_MAX)[0]
                            * nights
                            * 1.14,
                            2,
                        ),
                        currencyCode="USD",
                        rateMode=OfferRateMode(type="Highest"),
                        isCommissionable=True,
                        hasRateChange=False,
                    ),
                    maxRate=OfferMinMaxTotalType(
                        amountBeforeTax=_HOTEL_MIN_MAX.get(hotel.hotel_code, _DEFAULT_MIN_MAX)[1]
                        * nights,
                        amountAfterTax=round(
                            _HOTEL_MIN_MAX.get(hotel.hotel_code, _DEFAULT_MIN_MAX)[1]
                            * nights
                            * 1.14,
                            2,
                        ),
                        currencyCode="USD",
                        rateMode=OfferRateMode(type="Highest"),
                        isCommissionable=True,
                        hasRateChange=False,
                    ),
                )
            )

        return PropertySearchResponse(roomStays=room_stays)

    async def get_property_offers(
        self,
        hotel_code: str,
        arrival_date: date,
        departure_date: date,
    ) -> PropertyOffersResponse:
        """Get property offers."""
        hotel: Any = await self.hotel_dao.get_hotel_by_code(hotel_code)
        nights = max((departure_date - arrival_date).days, 1)

        if not hotel:
            hotel = SimpleNamespace(
                hotel_code=hotel_code or "ELGOUNA",
                hotel_name="Movenpick Resort & Spa El Gouna",
                chain_code="MOVENPICK",
                city_name="El Gouna",
                country_code="EG",
                postal_code="84513",
                state_prov="Red Sea",
                address_lines=["El Gouna"],
            )

        room_stays = []
        if hotel:
            room_types_data = _HOTEL_ROOM_TYPES.get(hotel_code, _HOTEL_ROOM_TYPES["MOV_EG_001"])
            room_types_objs = []
            offers_objs = []

            for code, name, desc, base_price in room_types_data:
                total_base = base_price * nights
                total_with_tax = round(total_base * 1.14, 2)
                room_types_objs.append(
                    PropertyOffersRoomType(
                        roomTypeCode=code,
                        roomTypeName=name,
                        description=desc,
                        availabilityStatus="AvailableForSale",
                    )
                )
                offers_objs.append(
                    Offer(
                        bookingCode=f"{code}BAR",
                        offerName=f"{name} Best Available Rate",
                        availabilityStatus="AvailableForSale",
                        roomType=code,
                        ratePlanCode="BAR",
                        total=OfferTotalTypeWithTaxes(
                            amountBeforeTax=total_base,
                            amountAfterTax=total_with_tax,
                            currencyCode="USD",
                        ),
                        rateInformation=OfferRateInformation(
                            rate=OfferOverallRateInformation(
                                rateMode=OfferRateMode(type="Highest"),
                                rateModeAmount=OfferTotalType(
                                    amountBeforeTax=total_base,
                                    amountAfterTax=total_with_tax,
                                    currencyCode="USD",
                                ),
                            ),
                        ),
                    )
                )

            room_stays.append(
                PropertyOffersRoomStay(
                    propertyInfo=PropertyOffersPropertyInfo(
                        hotelCode=hotel.hotel_code,
                        hotelName=hotel.hotel_name,
                        chainCode=hotel.chain_code,
                        address=Address(
                            city=hotel.city_name,
                            countryCode=hotel.country_code,
                            postalCode=hotel.postal_code,
                            state=hotel.state_prov,
                            addressLine=hotel.address_lines or [],
                        ),
                    ),
                    availability=HotelAvailabilityStatus.AvailableForSale,
                    roomTypes=room_types_objs,
                    ratePlans=[
                        PropertyOffersRatePlan(
                            ratePlanCode="BAR",
                            ratePlanName="Best Available Rate",
                            ratePlanType="1",
                            commission=OfferRatePlanCommission(percent=0.0, currencyCode="USD"),
                            packages=[],
                        )
                    ],
                    offers=offers_objs,
                )
            )

        return PropertyOffersResponse(roomStays=room_stays)

    async def get_offer_details(
        self,
        hotel_code: str,
        arrival_date: date,
        departure_date: date,
    ) -> OfferDetailsResponse:
        """Get offer details."""
        hotel: Any = await self.hotel_dao.get_hotel_by_code(hotel_code)
        nights = max((departure_date - arrival_date).days, 1)

        if not hotel:
            hotel = SimpleNamespace(
                hotel_code=hotel_code or "ELGOUNA",
                hotel_name="Movenpick Resort & Spa El Gouna",
                chain_code="MOVENPICK",
                city_name="El Gouna",
                country_code="EG",
                postal_code="84513",
                state_prov="Red Sea",
                address_lines=["El Gouna"],
            )

        # Use the first (cheapest) room for this hotel as the offer detail default
        hotel_rooms = _HOTEL_ROOM_TYPES.get(hotel_code, _HOTEL_ROOM_TYPES["MOV_EG_001"])
        first_code, first_name, first_desc, base_price = hotel_rooms[0]
        total_base = base_price * nights
        total_with_tax = round(total_base * 1.14, 2)

        return OfferDetailsResponse(
            propertyInfo=OfferDetailsPropertyInfo(
                hotelCode=hotel.hotel_code,
                hotelName=hotel.hotel_name,
                chainCode=hotel.chain_code,
                address=Address(
                    city=hotel.city_name,
                    countryCode=hotel.country_code,
                    postalCode=hotel.postal_code,
                    state=hotel.state_prov,
                    addressLine=hotel.address_lines or [],
                ),
            ),
            availability=HotelAvailabilityStatus.AvailableForSale,
            roomType=OfferDetailsRoomType(
                roomTypeCode=first_code,
                roomTypeName=first_name,
                description=first_desc,
                availabilityStatus="AvailableForSale",
            ),
            ratePlan=OfferDetailsRatePlan(
                ratePlanCode="BAR",
                ratePlanName="Best Available Rate",
                ratePlanType="1",
            ),
            offer=Offer(
                bookingCode=f"{first_code}BAR",
                offerName=f"{first_name} Best Available Rate",
                availabilityStatus="AvailableForSale",
                roomType=first_code,
                ratePlanCode="BAR",
                total=OfferTotalTypeWithTaxes(
                    amountBeforeTax=total_base,
                    amountAfterTax=total_with_tax,
                    currencyCode="USD",
                ),
                blockInformation=BlockInformation(blockCode="BLK1"),
            ),
        )
