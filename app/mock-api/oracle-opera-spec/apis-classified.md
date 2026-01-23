## Needed:
<!-- Addded -->
- **Property Search (Multi-property)**: [distributionshop.json](opera-api-spec/rest-api-specs/distribution/distributionshop.json#L24) - `GET /hotels`: Lists availability and rate ranges across multiple properties.
- **Room/Rate Availability/Offers**: [distributionshop.json](opera-api-spec/rest-api-specs/distribution/distributionshop.json#L196) - `GET /hotels/{hotelCode}/offers`: Lists available room and rate offers for a specific hotel based on dates.
- **Specific Offer Details (Room Details)**: [distributionshop.json](opera-api-spec/rest-api-specs/distribution/distributionshop.json#L383) - `GET /hotels/{hotelCode}/offer`: Summary for a single room-rate combination, used for final room selection.


<!-- Added -->
- **Properties Summary (Hotel List)**: [distributioncontent.json](opera-api-spec/rest-api-specs/distribution/distributioncontent.json#L24) - `GET /hotels`: Retrieves a list of all properties mapped to a channel (useful for hotel list view).
- **Property Information (Hotel Details)**: [distributioncontent.json](opera-api-spec/rest-api-specs/distribution/distributioncontent.json#L157) - `GET /hotels/{hotelCode}`: Detailed descriptive content for a specific hotel, including location and amenities.
- **Room Types Descriptive Info**: [distributioncontent.json](opera-api-spec/rest-api-specs/distribution/distributioncontent.json#L275) - `GET /hotels/{hotelCode}/roomTypes`: Detailed descriptions of room types at a property.


<!-- Cannot find these api's -->
- **Retrieve Physical Room Info**: [rmcfg.json](opera-api-spec/rest-api-specs/property/rmcfg.json#L11219) - `GET /hotels/{hotelId}/rooms/{roomsId}`: Configuration and details for a single physical room (extra room details).
- **Room Features (Amenities)**: [rmcfg.json](opera-api-spec/rest-api-specs/property/rmcfg.json#L14066) - `GET /roomFeatures`: Lists configured room amenities and features.



- **Booking Search/List**: [rsv.json](opera-api-spec/rest-api-specs/property/rsv.json#L6020) - `GET /hotels/{hotelId}/reservations`: Search for reservations by guest name, date, or status.
- **Booking Brief Summary**: [rsv.json](opera-api-spec/rest-api-specs/property/rsv.json#L9693) - `GET /hotels/{hotelId}/reservations/summary`: Quick high-level summary list of reservations.
- **Create Reservation**: [rsv.json](opera-api-spec/rest-api-specs/property/rsv.json#L6020) - `POST /hotels/{hotelId}/reservations`: Endpoint to create a new booking.
- **Update Reservation**: [rsv.json](opera-api-spec/rest-api-specs/property/rsv.json#L10501) - `PUT /hotels/{hotelId}/reservations/{reservationId}`: Modify existing booking details (dates, room type).
- **Cancel Reservation**: [rsv.json](opera-api-spec/rest-api-specs/property/rsv.json#L12790) - `POST /hotels/{hotelId}/reservations/{reservationId}/cancellations`: Cancel an existing booking with a reason.


- **Dashboard: Inventory Stats**: [inv.json](opera-api-spec/rest-api-specs/property/inv.json#L867) - `GET /hotels/{hotelId}/inventoryStatistics`: Occupancy and availability data for the dashboard.
- **Dashboard: Booking/Revenue Stats**: [rsv.json](opera-api-spec/rest-api-specs/property/rsv.json#L9531) - `GET /hotels/{hotelId}/reservations/statistics`: Metrics on bookings and cancellations, with channel filter support.


## Most Likely Needed:
- **Profiles Search/Details**: [crm.json](opera-api-spec/rest-api-specs/property/crm.json#L11987) - Required to manage guest information and track who made specific bookings.
- **List of Values (LOV)**: [lov.json](opera-api-spec/rest-api-specs/property/lov.json#L24) - Essential for fetching descriptive names for code-based data like countries or amenity types.
- **Rate Plan Configuration**: [rtp.json](opera-api-spec/rest-api-specs/property/rtp.json#L24) - Provides detailed configuration for different pricing strategies used in the property.

## Unlikely Needed:
- **Activities Management**: [act.json](opera-api-spec/rest-api-specs/property/act.json#L24) - Only needed if the clone includes booking hotel activities/excursions.
<!-- - **Housekeeping Management**: [hsk.json](opera-api-spec/rest-api-specs/property/hsk.json#L24) - Generally too operational for a customer-facing booking clone. -->
<!-- - **Block Management**: [blk.json](opera-api-spec/rest-api-specs/property/blk.json#L24) - Primarily used for group sales and conventions, not individual guest bookings. -->

## Not Needed:
<!-- - **External CRM Outbound**: [crmoutbound.json](opera-api-spec/rest-api-specs/property/outbound/crmoutbound.json) - External synchronization logic is outside the scope of a functional clone.
- **Token Exchange Plumbing**: [tokenexchange.json](opera-api-spec/rest-api-specs/property/tokenexchange.json) - Low-level authorization mechanism usually handled by infrastructure. -->

