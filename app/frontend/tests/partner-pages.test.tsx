import React from "react";
import { render, screen } from "@testing-library/react";
import HotelsPage from "@/app/(admin)/(others-pages)/hotels/page";
import RoomsPage from "@/app/(admin)/(others-pages)/rooms/page";
import BookingsPage from "@/app/(admin)/(others-pages)/bookings/page";

jest.mock("next/navigation", () => ({
  usePathname: () => "/",
}));

describe("Partner portal placeholder pages", () => {
  it("renders the Hotels page heading", () => {
    render(<HotelsPage />);
    expect(screen.getAllByRole("heading", { name: "Hotels" })[0]).toBeInTheDocument();
  });

  it("renders the Rooms page heading", () => {
    render(<RoomsPage />);
    expect(screen.getAllByRole("heading", { name: "Rooms" })[0]).toBeInTheDocument();
  });

  it("renders the Bookings page heading", () => {
    render(<BookingsPage />);
    expect(
      screen.getAllByRole("heading", { name: "Bookings" })[0]
    ).toBeInTheDocument();
  });
});
