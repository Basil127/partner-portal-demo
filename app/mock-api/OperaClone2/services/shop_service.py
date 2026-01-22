from datetime import date
from types import SimpleNamespace
from typing import Any

from fastapi import Depends

from operaclone2.db.dao.hotel_dao import HotelDAO
from operaclone2.web.api.shop.schema import (
    Address,
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
                        amountBeforeTax=150.00 * nights,
                        amountAfterTax=round(150.00 * nights * 1.14, 2),
                        currencyCode="USD",
                        rateMode=OfferRateMode(type="Highest"),
                        isCommissionable=True,
                        hasRateChange=False,
                    ),
                    maxRate=OfferMinMaxTotalType(
                        amountBeforeTax=1500.00 * nights,
                        amountAfterTax=round(1500.00 * nights * 1.14, 2),
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
            room_types_data = [
                (
                    "CLSTW",
                    "Classic Twin",
                    "In the bright and modern interiors of our Classic Garden View Rooms, "
                    "you can relax in a comfortable 40 sqm space with your choice of a "
                    "king-size bed or two single beds. Enjoy beautiful views over the "
                    "gardens from your terrace, which provides easy access t",
                    150.00,
                ),
                (
                    "CLSKG",
                    "Classic King",
                    "Classic Garden View Rooms accommodate a maximum of two adults and one child. "
                    "Accessible rooms are available.",
                    150.00,
                ),
                (
                    "DLXLG",
                    "Deluxe King Lagoon View",
                    "Deluxe Lagoon View Rooms offer a comfortable space of 40 sqm with "
                    "a stunning, modern design in which your choice of a kind bed "
                    "or twin beds is centred, facing the lagoon. A shower and hairdryer "
                    "are available in the bathroom. F",
                    200.00,
                ),
                (
                    "DLXTL",
                    "Deluxe Twin Lagoon View",
                    "Deluxe Lagoon View Rooms offer a comfortable space of 40 sqm with "
                    "a stunning, modern design in which your choice of a king bed "
                    "or twin beds is centred, facing the lagoon. A shower and hairdryer "
                    "are available in the bathroom.",
                    200.00,
                ),
                (
                    "DLXSV",
                    "Deluxe King Sea View",
                    "Deluxe Sea View Rooms accommodate a maximum of two adults and one child "
                    "in the existing bedding.",
                    250.00,
                ),
                (
                    "DLXTS",
                    "Deluxe Twin Sea View",
                    "Our Deluxe Sea View Rooms welcome you into a superior 40 sqm space "
                    "which offers exquisite comfort in a prime location. Enjoy breath-taking views "
                    "over the Red Sea from your balcony or terrace.",
                    250.00,
                ),
                (
                    "FAMLG",
                    "Family room lagoon view",
                    "More space, a cool design and great views make our Family Lagoon View Rooms "
                    "an excellent choice for families. The 50 sqm duplex rooms are spread over "
                    "two floors, with the lower area featuring a king-size bed, "
                    "while an elevated sleeping area",
                    300.00,
                ),
                (
                    "SUISV",
                    "Deluxe Suite Sea View",
                    "Relax and unwind in our comfortable Deluxe Sea View Suites, "
                    "which are superb 72 sqm retreats in a great waterfront location, "
                    "with lagoon or sea views.",
                    450.00,
                ),
                (
                    "FAMSV",
                    "Family Suite Sea view",
                    "The Family Sea View Suite offers exquisite comfort and space for "
                    "family or friends. The 112 sqm space features a comfortable living "
                    "room with sofa corner and dining table, two separate ensuite bedrooms.",
                    550.00,
                ),
                (
                    "PRSTV",
                    "Presidential Suite Sea View",
                    "The Presidential Suite offers ultimate space with bedroom, living room, "
                    "balcony with private pool. An additional room with separate entrance allows "
                    "to welcome and entertain guests.",
                    1500.00,
                ),
            ]

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

        base_price = 150.00
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
                roomTypeCode="CLSKG",
                roomTypeName="Classic King",
                description="Classic Garden View Rooms accommodate a maximum of two adults "
                "and one child. Accessible rooms are available.",
                availabilityStatus="AvailableForSale",
            ),
            ratePlan=OfferDetailsRatePlan(
                ratePlanCode="BAR",
                ratePlanName="Best Available Rate",
                ratePlanType="1",
            ),
            offer=Offer(
                bookingCode="CLSKGBAR",
                offerName="Classic King Best Available Rate",
                availabilityStatus="AvailableForSale",
                roomType="CLSKG",
                ratePlanCode="BAR",
                total=OfferTotalTypeWithTaxes(
                    amountBeforeTax=total_base,
                    amountAfterTax=total_with_tax,
                    currencyCode="USD",
                ),
                blockInformation={"blockCode": "BLK1"},
            ),
        )
