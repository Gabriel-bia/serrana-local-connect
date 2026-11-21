import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { orderProducts, partitionProducts, productShareMessage, providerShareMessage, publicProductUrl, publicProfileUrl, publicServiceUrl, selectedProductsMessage, serviceShareMessage, toggleProduct } from "./discovery";

const products = Array.from({ length: 24 }, (_, i) => ({ id: `p-${i}`, featured: i < 8, categoryId: `c-${i % 3}` }));
describe("product discovery rules", () => {
  it("puts only active featured products in the single featured group", () => {
    const split = partitionProducts(products, 123);
    assert.equal(split.featured.length, 8);
    assert.ok(split.featured.every((p) => p.featured));
  });
  it("keeps all common products out of the featured group without duplication", () => {
    const split = partitionProducts([...products, products[0]], 123);
    assert.equal(split.common.length, 16);
    assert.ok(split.common.every((p) => !p.featured));
    assert.equal(new Set([...split.featured, ...split.common].map((p) => p.id)).size, 24);
  });
  it("has no featured group entries when nothing is featured", () => {
    assert.equal(partitionProducts(products.map((p) => ({ ...p, featured: false })), 123).featured.length, 0);
  });
  it("keeps the same order during a document session", () => {
    assert.deepEqual(orderProducts(products, 123), orderProducts([...products].reverse(), 123));
  });
  it("changes both independent groups for a new seed without changing classification", () => {
    const a = partitionProducts(products, 123), b = partitionProducts(products, 456);
    assert.notDeepEqual(a.featured.map((p) => p.id), b.featured.map((p) => p.id));
    assert.notDeepEqual(a.common.map((p) => p.id), b.common.map((p) => p.id));
    assert.deepEqual(products.map((p) => p.featured), Array.from({ length: 24 }, (_, i) => i < 8));
  });
  it("common products never affect the order of featured products", () => {
    assert.deepEqual(partitionProducts(products, 123).featured, partitionProducts(products.filter((p) => p.featured), 123).featured);
  });
  it("tapping toggles a selection without duplicating entries", () => {
    const one = toggleProduct(new Set(), "p-1");
    const two = toggleProduct(one, "p-2");
    assert.equal(two.size, 2);
    assert.deepEqual([...toggleProduct(two, "p-1")], ["p-2"]);
    assert.equal(one.size, 1);
  });
  it("shares names and prices only from the current store and includes its public direct link", () => {
    const message = selectedProductsMessage({ id: "store-1", name: "Minha Loja" }, [
      { storeId: "store-1", name: "Camisa", price: 29.9 },
      { storeId: "store-2", name: "Outra loja", price: 1 },
    ]);
    assert.ok(message.includes("Camisa"));
    assert.ok(message.includes("29,90"));
    assert.ok(!message.includes("Outra loja"));
    assert.ok(message.endsWith("https://serrana-express.lovable.app/loja/store-1"));
  });
  it("always uses published links for stores and providers", () => {
    assert.equal(publicProfileUrl("loja", "abc"), "https://serrana-express.lovable.app/loja/abc");
    assert.equal(publicProfileUrl("prestador", "xyz"), "https://serrana-express.lovable.app/prestador/xyz");
  });
  it("product card share links to the published product page", () => {
    assert.equal(publicProductUrl("p-1"), "https://serrana-express.lovable.app/produto/p-1");
  });
  it("product card share message carries name, price and the product link", () => {
    const message = productShareMessage({ id: "p-1", name: "Camisa", price: 29.9 });
    assert.ok(message.includes("Camisa"));
    assert.ok(message.includes("29,90"));
    assert.ok(message.endsWith("https://serrana-express.lovable.app/produto/p-1"));
  });
  it("product card share message says valor a combinar when there is no price", () => {
    const message = productShareMessage({ id: "p-2", name: "Artesanato", price: 0 });
    assert.ok(message.includes("valor a combinar"));
    assert.ok(!message.includes("R$"));
  });
  it("service card share message carries name, price, provider and the service link", () => {
    const message = serviceShareMessage({ id: "s-1", name: "Instalação de ar", price: 150 }, { name: "João" });
    assert.ok(message.includes("Instalação de ar"));
    assert.ok(message.includes("150,00"));
    assert.ok(message.includes("João"));
    assert.ok(message.endsWith("https://serrana-express.lovable.app/servico/s-1"));
  });
  it("service card share message says valor a combinar when there is no price", () => {
    const message = serviceShareMessage({ id: "s-2", name: "Orçamento", price: null });
    assert.ok(message.includes("valor a combinar"));
    assert.ok(!message.includes("R$"));
  });
  it("provider card share message carries name, city and the provider link", () => {
    const message = providerShareMessage({ id: "pr-1", name: "Maria Eletricista", city: "Serrana" });
    assert.ok(message.includes("Maria Eletricista"));
    assert.ok(message.includes("Serrana"));
    assert.ok(message.endsWith("https://serrana-express.lovable.app/prestador/pr-1"));
  });
  it("service card share links to the published service page", () => {
    assert.equal(publicServiceUrl("s-1"), "https://serrana-express.lovable.app/servico/s-1");
  });
});