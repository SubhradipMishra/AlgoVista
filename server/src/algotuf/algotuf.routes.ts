// @ts-nocheck
import express from "express";
import { getAlgoTufProgramDetails, getUserAlgoTufStatus } from "./algotuf.controller";
import { UserGuard } from "../middleware/gaurd.middleware";

const AlgoTufRouter = express.Router();

AlgoTufRouter.get("/details", getAlgoTufProgramDetails);
AlgoTufRouter.get("/status", UserGuard, getUserAlgoTufStatus);

export default AlgoTufRouter;
