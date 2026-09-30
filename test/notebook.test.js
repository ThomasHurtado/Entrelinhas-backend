import assert from "node:assert/strict";
import {test} from "node:test";
import app from "../src/app.js";
import NotebookPage from "../src/models/NotebookPage.js";

test("notebook HTTP contracts (database operations mocked)", async (t) => {
  const id = "507f1f77bcf86cd799439011";
  const missingId = "507f1f77bcf86cd799439012";
  let saved = null;
  t.mock.method(NotebookPage, "find", () => ({sort: () => Promise.resolve(saved ? [saved] : [])}));
  t.mock.method(NotebookPage, "create", async (data) => {
    assert.deepEqual(Object.keys(data).sort(), ["text", "title"]);
    saved = new NotebookPage({_id: id, ...data});
    await saved.validate();
    return saved;
  });
  t.mock.method(NotebookPage, "findByIdAndUpdate", async (requestedId, updates, options) => {
    assert.deepEqual(options, {new: true, runValidators: true});
    assert.ok(Object.keys(updates).every(key => ["title", "text"].includes(key)));
    if (requestedId !== id || !saved) return null;
    Object.assign(saved, updates);
    await saved.validate();
    return saved;
  });
  t.mock.method(NotebookPage, "findByIdAndDelete", async (requestedId) => {
    if (requestedId !== id) return null;
    const page = saved;
    saved = null;
    return page;
  });

  const server = app.listen(0, "127.0.0.1");
  await new Promise(resolve => server.once("listening", resolve));
  t.after(() => new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve())));
  const base = `http://127.0.0.1:${server.address().port}/api/notebook/pages`;
  async function request(method, body, suffix = "") {
    const response = await fetch(base + suffix, {
      method, headers: {"Content-Type": "application/json"},
      body: body === undefined ? undefined : JSON.stringify(body)
    });
    const raw = await response.text();
    return {status: response.status, body: raw ? JSON.parse(raw) : null};
  }
  function checkPage(result, status, title, text) {
    assert.equal(result.status, status);
    assert.equal(result.body._id, id);
    assert.equal(result.body.title, title);
    assert.equal(result.body.text, text);
  }

  assert.deepEqual(await request("GET"), {status: 200, body: []});
  checkPage(await request("POST", {title: "", text: ""}), 201, "", "");
  const content = "  Primeiro parágrafo\n\nSegundo parágrafo  ";
  checkPage(await request("POST", {title: "Leituras", text: content, _id: missingId}), 201, "Leituras", content);
  const listed = await request("GET");
  assert.equal(listed.body.length, 1);
  checkPage({status: listed.status, body: listed.body[0]}, 200, "Leituras", content);
  checkPage(await request("PATCH", {title: "Novo título"}, `/${id}`), 200, "Novo título", content);
  checkPage(await request("PATCH", {text: "Revisado", _id: missingId}, `/${id}`), 200, "Novo título", "Revisado");
  checkPage(await request("PATCH", {title: "", text: ""}, `/${id}`), 200, "", "");

  for (const method of ["POST", "PATCH"]) {
    for (const body of [undefined, {}, [], {unknown: "value"}, {title: null, text: ""}, {title: 123, text: ""}, {title: "", text: {}}, {title: "", text: []}]) {
      assert.equal((await request(method, body, method === "PATCH" ? `/${id}` : "")).status, 400);
    }
  }
  assert.equal((await request("POST", {title: "Falta texto"})).status, 400);
  assert.equal((await request("POST", {text: "Falta título"})).status, 400);
  for (const method of ["PATCH", "DELETE"]) {
    const body = method === "PATCH" ? {title: "Teste"} : undefined;
    assert.equal((await request(method, body, "/invalid-id")).status, 400);
    assert.equal((await request(method, body, `/${missingId}`)).status, 404);
  }
  assert.deepEqual(await request("DELETE", undefined, `/${id}`), {status: 204, body: null});
  assert.deepEqual(await request("GET"), {status: 200, body: []});
  assert.equal((await request("DELETE", undefined, `/${id}`)).status, 404);
});
