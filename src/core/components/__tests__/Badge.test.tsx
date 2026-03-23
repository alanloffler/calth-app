import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Badge } from "../Badge";

describe("Badge", () => {
  it("renders its children", () => {
    render(<Badge>Activo</Badge>);
    expect(screen.getByText("Activo")).toBeInTheDocument();
  });

  it("applies default size and variant when no props are provided", () => {
    render(<Badge>Default</Badge>);
    const badge = screen.getByText("Default");
    expect(badge).toHaveClass("px-3", "py-1.5", "text-xs");
    expect(badge).toHaveClass("bg-neutral-100", "text-neutral-600");
  });

  it("forwards extra HTML attributes", () => {
    render(<Badge data-testid="my-badge">Attributes</Badge>);
    expect(screen.getByTestId("my-badge")).toBeInTheDocument();
  });
});
