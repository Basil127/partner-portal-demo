from datetime import date

from pydantic import BaseModel, Field


class NumericCategorySummaryType(BaseModel):
    """
    This element has count data for each count category.

    Such as number of guests, rooms occupied, etc.
    """

    value: float | None = Field(
        None, description="The total count for the category in NumericCategoryCode."
    )
    code: str | None = Field(
        None,
        max_length=40,
        description=(
            "The representation of a numeric category such as Guests : Number of "
            "guests, RoomsOcc : Rooms occupied."
        ),
    )


class RevenueCategorySummaryType(BaseModel):
    """
    This element has revenue amount data for its revenue category.

    Such as Room Revenue, Food and Beverage Revenue.
    """

    code: str | None = Field(
        None,
        max_length=40,
        description="The representation of a revenue category.",
    )
    amount: float | None = Field(None, description="A monetary amount.")
    currencyCode: str | None = Field(
        None,
        min_length=3,
        max_length=3,
        description=(
            "Provides a currency code to reflect the currency in which an amount may be expressed."
        ),
    )


class StatisticSetType(BaseModel):
    """
    An instance of a statistic.

    It is a set containing revenue category and number category summaries.
    """

    revenue: list[RevenueCategorySummaryType] | None = Field(
        None,
        max_length=4000,
        description=(
            "Collection of RevenueCategorySummary elements. Used if revenue values reported."
        ),
    )
    inventory: list[NumericCategorySummaryType] | None = Field(
        None,
        max_length=4000,
        description=("Collection of CountCategorySummary elements. Used if count values reported."),
    )
    statisticDate: date | None = Field(
        None,
        description="Date of the statistic.",
    )
    weekendDate: bool | None = Field(
        None, description="Determines whether statistic date is a weekend date."
    )


class StatisticCodeType(BaseModel):
    """
    Defines the codes and corresponding categories.

    Data in the other elements has been gathered for these.
    """

    statisticDate: list[StatisticSetType] | None = Field(
        None,
        max_length=4000,
        description="Collection of statistic summary data.",
    )
    statCode: str | None = Field(
        None,
        max_length=20,
        description=(
            "Actual code used by the system to collect the statistics "
            "(e.g. CORP, RACK if category is Market Segment)."
        ),
    )
    statCategoryCode: str | None = Field(
        None,
        max_length=40,
        description="Category Code category of StatCode attribute (e.g. Market Segment).",
    )
    statCodeClass: str | None = Field(
        None,
        max_length=40,
        description="Class grouping of StatCode attribute.",
    )
    description: str | None = Field(
        None, max_length=2000, description="Statistic code description."
    )


class StatisticType(BaseModel):
    """Defines all details needed to create a statistical report."""

    statistics: list[StatisticCodeType] | None = Field(
        None, max_length=4000, description="Statistic Codes."
    )
    hotelName: str | None = Field(
        None,
        max_length=80,
        description="A text field used to communicate the proper name of the hotel.",
    )
    reportCode: str | None = Field(
        None,
        max_length=100,
        description=(
            "Identifies the type of statistics collected. Each ReportCode corresponds "
            "to a set of category summaries based upon a predetermined agreement."
        ),
    )
    description: str | None = Field(
        None,
        max_length=2000,
        description=(
            "This element has revenue amount data for its revenue category such "
            "as Room Revenue, Food and Beverage Revenue."
        ),
    )


InventoryStatistics = list[StatisticType]
