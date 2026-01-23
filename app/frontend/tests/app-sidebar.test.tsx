import React from "react";
import { render, screen } from "@testing-library/react";
import ChatPage from "@/app/(admin)/(others-pages)/chat/page";

jest.mock("next/navigation", () => ({
	usePathname: () => "/",
}));

describe("Chat page", () => {
	it("renders the Chat heading", () => {
		render(<ChatPage />);
		const headings = screen.getAllByRole("heading", { name: "Chat" });
		expect(headings[0]).toBeInTheDocument();
	});
});
