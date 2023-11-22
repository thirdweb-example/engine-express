import express from "express";
import { authMiddleware } from "../index";
import {
  registerUser,
  loginUser,
  linkWallet,
} from "../controllers/userController";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/link-wallet", linkWallet);

export default router;
