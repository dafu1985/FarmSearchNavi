import { Routes, Route, MemoryRouter } from "react-router-dom";
import { render, screen } from "@testing-library/react";
import App from "../App";

test("renders topPage text", () => {
  render(
    <MemoryRouter>
      <App />
    </MemoryRouter>
  );
  // const topPageElement = screen.getByText(/topPage/i);
  expect(screen.getByText(/農/i)).toBeInTheDocument();
});
