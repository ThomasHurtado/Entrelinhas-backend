import assert from "node:assert/strict";
import {test} from "node:test";
import app from "../src/app.js";
import Participant from "../src/models/Participant.js";
import {isValidBirthDate} from "../src/utils/birthDate.js";

test("calendar dates, leap years, strict types and future dates", () => {
  for (const value of [null, "1995-09-29", "2000-02-29", "2024-02-29", "2026-09-29"])
    assert.equal(isValidBirthDate(value, "2026-09-29"), true, String(value));
  for (const value of ["1900-02-29", "2025-02-29", "2026-04-31", "2026-00-01", "2026-13-01", "2026-01-00", "0000-01-01", "2026-09-30", "", "1995-9-29", "1995-09-29T00:00:00Z", 19950929, {}, [], undefined])
    assert.equal(isValidBirthDate(value, "2026-09-29"), false, String(value));
});

test("model defaults for legacy records and validation", async () => {
  const legacy = Participant.hydrate({_id: "507f1f77bcf86cd799439011", name: "Ana"});
  assert.equal(legacy.toJSON().birthDate, null);
  await new Participant({name: "Ana", birthDate: "2000-02-29"}).validate();
  await assert.rejects(new Participant({name: "Ana", birthDate: "1900-02-29"}).validate(), /Data de nascimento inválida/);
});

test("participant HTTP contracts (database operations mocked)", async (t) => {
  const id = "507f1f77bcf86cd799439011";
  let saved = Participant.hydrate({_id: id, name: "Ana", joined: new Date("2026-01-01T12:00:00Z")});
  t.mock.method(Participant, "find", () => ({sort: () => Promise.resolve([saved])}));
  t.mock.method(Participant, "create", async (data) => {
    saved = new Participant({_id: id, ...data});
    await saved.validate();
    return saved;
  });
  t.mock.method(Participant, "findByIdAndUpdate", async (requestedId, updates, options) => {
    assert.deepEqual(options, {new: true, runValidators: true});
    if (requestedId !== id) return null;
    Object.assign(saved, updates);
    await saved.validate();
    return saved;
  });
  const server = app.listen(0, "127.0.0.1");
  await new Promise(resolve => server.once("listening", resolve));
  t.after(() => new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve())));
  const base = `http://127.0.0.1:${server.address().port}/api/participants`;
  async function request(method, body, suffix = "") {
    const response = await fetch(base + suffix, {method, headers: {"Content-Type": "application/json"}, body: body === undefined ? undefined : JSON.stringify(body)});
    return {status: response.status, body: await response.json()};
  }
  let result = await request("GET");
  assert.equal(result.status, 200);
  assert.equal(result.body[0].birthDate, null);
  for (const body of [{name: "Ana"}, {name: "Ana", birthDate: null}, {name: "Ana", birthDate: "1995-09-29"}]) {
    result = await request("POST", body);
    assert.equal(result.status, 201);
    assert.equal(result.body.birthDate, body.birthDate ?? null);
    assert.equal(result.body._id, id);
    assert.ok(result.body.joined);
  }
  result = await request("PATCH", {name: " Ana Silva "}, `/${id}`);
  assert.equal(result.status, 200);
  assert.equal(result.body.name, "Ana Silva");
  assert.equal(result.body.birthDate, "1995-09-29");
  result = await request("PATCH", {birthDate: "2000-02-29"}, `/${id}`);
  assert.equal(result.status, 200);
  assert.equal(result.body.name, "Ana Silva");
  assert.equal(result.body.birthDate, "2000-02-29");
  result = await request("PATCH", {name: "Ana", birthDate: null}, `/${id}`);
  assert.equal(result.status, 200);
  assert.equal(result.body.birthDate, null);
  for (const method of ["POST", "PATCH"]) {
    for (const birthDate of ["2025-02-29", "9999-12-31", "", 123, {}, "2020-01-01T00:00:00Z"]) {
      result = await request(method, {name: "Ana", birthDate}, method === "PATCH" ? `/${id}` : "");
      assert.equal(result.status, 400);
      assert.deepEqual(result.body, {message: "Data de nascimento inválida."});
    }
  }
  assert.equal((await request("PATCH", {birthDate: null}, "/507f1f77bcf86cd799439012")).status, 404);
  assert.equal((await request("PATCH", {name: " "}, `/${id}`)).status, 400);
  assert.equal((await request("PATCH", {}, `/${id}`)).status, 400);
});
