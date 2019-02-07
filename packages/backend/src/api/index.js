import { version } from "../../package.json";
import { Router } from "express";
import suggestions from "./suggestions";

export default ({ config }) => {
  let api = Router();

  api.post("/suggestions", suggestions);

  api.get("/", (req, res) => {
    res.json({ version });
  });

  return api;
};
