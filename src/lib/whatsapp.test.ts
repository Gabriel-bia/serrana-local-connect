import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { buildWhatsappLink, itemContactMessage } from "./whatsapp";

describe("WhatsApp contact messages", () => {
  const saved = "https://wa.me/5535999990001?text=Mensagem%20cadastrada";
  it("product contacts replace saved text with the selected product, price and public link", () => {
    const message = itemContactMessage("produto", { id: "p-1", name: "Camisa", price: 29.9 });
    const url = new URL(buildWhatsappLink(saved, message, true));
    assert.equal(url.searchParams.get("text"), message);
    assert.ok(message.includes("Camisa — R$ 29,90"));
    assert.ok(message.endsWith("https://serrana-express.lovable.app/produto/p-1"));
    assert.equal(url.pathname, "/5535999990001");
  });
  it("service contacts share only the chosen service and its provider's public link", () => {
    const message = itemContactMessage("servico", { id: "s-1", providerId: "provider-1", name: "Pintura", price: null });
    assert.equal(new URL(buildWhatsappLink(saved, message, true)).searchParams.get("text"), message);
    assert.ok(message.includes("Pintura — valor a combinar"));
    assert.ok(message.endsWith("https://serrana-express.lovable.app/prestador/provider-1"));
  });
  it("general store and provider contacts preserve the message registered in the link", () => {
    assert.equal(new URL(buildWhatsappLink(saved, "Mensagem geral de fallback")).searchParams.get("text"), "Mensagem cadastrada");
  });
  it("general contacts without registered text use their ordinary fallback", () => {
    assert.equal(new URL(buildWhatsappLink("https://wa.me/5535999990001", "Olá, encontrei a loja.")).searchParams.get("text"), "Olá, encontrei a loja.");
  });
  it("product contact includes the selected photo together with the product link", () => {
    const image = "https://serranaexpress.com/catalog/camisa.jpg";
    const message = itemContactMessage("produto", { id: "p-1", name: "Camisa", price: 29.9, image });
    assert.ok(message.includes(image));
    assert.ok(message.endsWith("https://serrana-express.lovable.app/produto/p-1"));
    assert.equal(new URL(buildWhatsappLink(saved, message, true)).searchParams.get("text"), message);
  });
  it("does not put embedded or invalid photos into WhatsApp messages", () => {
    for (const image of ["data:image/png;base64,abc", "/photo.jpg", "javascript:alert(1)"]) {
      const message = itemContactMessage("produto", { id: "p-1", name: "Camisa", image });
      assert.ok(!message.includes(image));
    }
  });
});