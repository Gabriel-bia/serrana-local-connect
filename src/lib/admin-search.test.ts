import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { matchesAdminSearch, isProductActive } from "./admin-search";
const filters = { query: "", category: "", status: "" };
describe("administrative search", () => {
  it("matches product names and codes without accents", () => {
    assert.equal(matchesAdminSearch(["Calça Azul", "p123"], { ...filters, query: "calca" }), true);
    assert.equal(matchesAdminSearch(["Calça Azul", "p123"], { ...filters, query: "p123" }), true);
    assert.equal(matchesAdminSearch(["Calça Azul", "p123"], { ...filters, query: "p999" }), false);
  });
  it("combines category and status instead of ignoring either filter", () => {
    const f = { ...filters, category: "moda", status: "inactive" };
    assert.equal(matchesAdminSearch(["Calça"], f, ["moda"], false), true);
    assert.equal(matchesAdminSearch(["Calça"], f, ["casa"], false), false);
    assert.equal(matchesAdminSearch(["Calça"], f, ["moda"], true), false);
  });
  it("finds phone numbers with or without formatting and locations", () => {
    assert.equal(matchesAdminSearch(["(35) 99999-0001", "Rua São João"], { ...filters, query: "35999990001" }), true);
    assert.equal(matchesAdminSearch(["(35) 99999-0001", "Rua São João"], { ...filters, query: "sao joao" }), true);
    assert.equal(matchesAdminSearch(["Rua São João"], { ...filters, query: "outra rua" }), false);
  });
  it("finds providers by linked service and multiple categories", () => {
    assert.equal(matchesAdminSearch(["José", "Instalação elétrica"], { ...filters, query: "eletrica", category: "c2" }, ["c1", "c2"], true), true);
    assert.equal(matchesAdminSearch(["José", "Instalação elétrica"], { ...filters, category: "c3" }, ["c1", "c2"], true), false);
  });
  it("cleared filters return existing records", () => {
    assert.equal(matchesAdminSearch(["Loja"], filters, ["c1"], false), true);
  });
  it("inactive products are hidden while legacy products remain active", () => {
    assert.equal(isProductActive({ active: false }), false);
    assert.equal(isProductActive({ active: true }), true);
    assert.equal(isProductActive({}), true);
  });
});