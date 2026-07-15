/**
 * LocationPreferenceSelector tests (Part 3, 2026-07-15).
 * Verifies country default, India city multi-select, and the
 * remote toggle being independent of city selection.
 */
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import LocationPreferenceSelector from "@/components/ui/LocationPreferenceSelector";

function Harness({ initial }: { initial: string }) {
  const [value, setValue] = React.useState(initial);
  return (
    <div>
      <div data-testid="value">{value}</div>
      <LocationPreferenceSelector value={value} onChange={setValue} id="test-loc" />
    </div>
  );
}

describe("LocationPreferenceSelector", () => {
  it("defaults country to India when value is empty", () => {
    render(<Harness initial="" />);
    expect(screen.getByLabelText("Country")).toHaveValue("India");
  });

  it("shows India city chips when country is India", () => {
    render(<Harness initial="" />);
    expect(screen.getByRole("button", { name: "Bangalore" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Mumbai" })).toBeInTheDocument();
  });

  it("selecting a city emits it in the joined value", () => {
    render(<Harness initial="" />);
    fireEvent.click(screen.getByRole("button", { name: "Bangalore" }));
    expect(screen.getByTestId("value").textContent).toBe("Bangalore");
  });

  it("toggling remote adds Remote independently of selected cities", () => {
    render(<Harness initial="" />);
    fireEvent.click(screen.getByRole("button", { name: "Bangalore" }));
    fireEvent.click(screen.getByRole("switch"));
    expect(screen.getByTestId("value").textContent).toBe("Bangalore · Remote");
  });

  it("toggling remote alone (no city selected) emits just Remote", () => {
    render(<Harness initial="" />);
    fireEvent.click(screen.getByRole("switch"));
    expect(screen.getByTestId("value").textContent).toBe("Remote");
  });

  it("infers India country and pre-selects chips from an existing value", () => {
    render(<Harness initial="Bangalore · Mumbai" />);
    expect(screen.getByLabelText("Country")).toHaveValue("India");
    expect(screen.getByRole("button", { name: "Bangalore" })).toHaveClass("on");
    expect(screen.getByRole("button", { name: "Mumbai" })).toHaveClass("on");
  });

  it("deselecting a city removes it from the joined value", () => {
    render(<Harness initial="Bangalore · Mumbai" />);
    fireEvent.click(screen.getByRole("button", { name: "Bangalore" }));
    expect(screen.getByTestId("value").textContent).toBe("Mumbai");
  });
});
