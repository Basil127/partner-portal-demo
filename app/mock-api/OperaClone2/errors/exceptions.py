class HotelNotFoundError(Exception):
    """Exception raised when a hotel is not found."""

    def __init__(self, message: str = "Hotel not found") -> None:
        self.message = message
        super().__init__(self.message)
