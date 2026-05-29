import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
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

  it("does not crash when importing malformed packet JSON", async () => {
    render(<App />);
    const input = document.querySelector('input[type="file"]');
    const file = new File([JSON.stringify({ packets: [{}, { title: { nested: true }, evidence: ["valid", 12] }] })], "bad.json", {
      type: "application/json"
    });

    fireEvent.change(input as HTMLInputElement, { target: { files: [file] } });

    await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent("Imported 1 packet"));
    expect(screen.getByText("Untitled proof packet")).toBeInTheDocument();
  });

  it("reports clipboard failure instead of throwing", async () => {
    const user = userEvent.setup();
    vi.spyOn(navigator.clipboard, "writeText").mockRejectedValueOnce(new Error("denied"));
    render(<App />);

    await user.click(screen.getByRole("button", { name: "Copy" }));

    await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent("Copy failed"));
  });
});
