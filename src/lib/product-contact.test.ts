import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { productWhatsapp } from "./product-contact";

describe("linked product WhatsApp contact", () => {
  it("uses the updated store contact even when the product still has its old link", () => {
    const product = { whatsapp: "https://wa.me/5535999990001" };
    const store = { whatsapp: "https://wa.me/5535999990001" };
    assert.equal(productWhatsapp(product, store), store.whatsapp);
    store.whatsapp = "https://wa.me/5535999990002";
    assert.equal(productWhatsapp(product, store), "https://wa.me/5535999990002");
  });
  it("does not resurrect an outdated link if the store contact is cleared", () => {
    assert.equal(productWhatsapp({ whatsapp: "https://wa.me/5535999990001" }, { whatsapp: "" }), "");
  });
  it("retains the product contact when no store was supplied", () => {
    assert.equal(productWhatsapp({ whatsapp: "https://wa.me/5535999990001" }), "https://wa.me/5535999990001");
  });
});