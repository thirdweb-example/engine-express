import express from "express";
import { claimERC20, getERC20Balance } from "../controllers/engineController";

const router = express.Router();

router.post("/claim-erc20", claimERC20);
router.post("/get-erc20-balance", getERC20Balance);

export default router;
