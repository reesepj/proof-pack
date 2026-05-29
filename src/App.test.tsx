import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { App } from "./App";
import { STORE_KEY } from "./lib/storage";

describe("Proof Pack app", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("saves a client-ready proof packet locally", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.clear(screen.getByLabelText("Title"));
    await user.type(screen.getByLabelText("Title"), "Launch proof packet");
    await user.clear(screen.getByLabelText("Client or project"));
    await user.type(screen.getByLabelText("Client or project"), "Acropolis Ops");
    await user.click(screen.getByRole("button", { name: "Save" }));

    const raw = localStorage.getItem(STORE_KEY);
    expect(raw).toBeTruthy();
    expect(JSON.parse(raw || "{}").packets[0].title).toBe("Launch proof packet");
  });
});
