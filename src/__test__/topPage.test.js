import {render, screen} from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import TopPage from "../topPage";

describe("Test topPage Component", () => {
    test("render from with 1 button", async () => {
    render(
    <MemoryRouter>
        <TopPage />
        </MemoryRouter>
        );

  expect(screen.getByRole("button")).toBeInTheDocument();
    })
});

