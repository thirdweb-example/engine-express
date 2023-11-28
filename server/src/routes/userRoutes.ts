import express from "express";
import {
  registerUser,
  loginUser,
  linkWallet,
  getUserData,
} from "../controllers/userController";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/link-wallet", linkWallet);
router.post("/get-user-data", getUserData);

export default router;
