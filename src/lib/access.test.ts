import { describe, expect, it } from "vitest";
import { canBuy, canSell, roleLabel } from "./access";

describe("marketplace role access", () => {
  it("keeps buyer and seller capabilities separate", () => {
    expect(canBuy("BUYER")).toBe(true);
    expect(canSell("BUYER")).toBe(false);
    expect(canBuy("CREATOR")).toBe(false);
    expect(canSell("CREATOR")).toBe(true);
  });

  it("allows an administrator to operate platform workspaces", () => {
    expect(canBuy("ADMIN")).toBe(true);
    expect(canSell("ADMIN")).toBe(true);
    expect(roleLabel("ADMIN")).toBe("Administrator");
  });

  it("keeps the legacy combined role usable for existing accounts", () => {
    expect(canBuy("BOTH")).toBe(true);
    expect(canSell("BOTH")).toBe(true);
    expect(roleLabel("CREATOR")).toBe("Seller");
  });
});
