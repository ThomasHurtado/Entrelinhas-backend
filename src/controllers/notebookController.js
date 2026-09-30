import mongoose from "mongoose";
import NotebookPage from "../models/NotebookPage.js";

function pageFields(body, partial = false) {
  if (!body || typeof body !== "object" || Array.isArray(body)) return null;
  const fields = {};
  for (const field of ["title", "text"]) {
    if (partial && !Object.hasOwn(body, field)) continue;
    if (typeof body[field] !== "string") return null;
    fields[field] = body[field];
  }
  return Object.keys(fields).length ? fields : null;
}

export async function listPages(req, res) {
  res.json(await NotebookPage.find().sort({createdAt: 1, _id: 1}));
}

export async function createPage(req, res) {
  const fields = pageFields(req.body);
  if (!fields) return res.status(400).json({message: "Informe title e text como strings."});
  res.status(201).json(await NotebookPage.create(fields));
}

export async function updatePage(req, res) {
  if (!mongoose.isObjectIdOrHexString(req.params.id)) return res.status(400).json({message: "Identificador inválido."});
  const fields = pageFields(req.body, true);
  if (!fields) return res.status(400).json({message: "Informe title ou text como strings."});
  const page = await NotebookPage.findByIdAndUpdate(req.params.id, fields, {new: true, runValidators: true});
  if (!page) return res.status(404).json({message: "Página não encontrada."});
  res.json(page);
}

export async function deletePage(req, res) {
  if (!mongoose.isObjectIdOrHexString(req.params.id)) return res.status(400).json({message: "Identificador inválido."});
  const page = await NotebookPage.findByIdAndDelete(req.params.id);
  if (!page) return res.status(404).json({message: "Página não encontrada."});
  res.status(204).end();
}
