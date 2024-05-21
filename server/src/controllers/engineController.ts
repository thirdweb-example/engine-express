require("dotenv").config();

import { Request, Response } from "express";
import axios from "axios";
import https from "https";

import { userTokens } from "./userController";

const ENGINE_URL = process.env.THIRDWEB_ENGINE_URL;
const BACKEND_WALLET = process.env.THIRDWEB_ENGINE_BACKEND_WALLET;
const ERC20_CONTRACT = "0x9720Af115d20cD21845c7D85fd555C9711678000";
const CHAIN = 421614;

const axiosInstance = axios.create({
  // ... other options ...
  httpsAgent: new https.Agent({
    rejectUnauthorized: false,
  }),
});

export const claimERC20 = async (req: Request, res: Response) => {
  const { authToken } = req.body;
  if (!authToken || !userTokens[authToken]) {
    return res.status(400).json({ message: "Invalid auth token" });
  }
  const user = userTokens[authToken];
  try {
    const url = `${ENGINE_URL}/contract/${CHAIN}/${ERC20_CONTRACT}/erc20/claim-to`;
    const headers = {
      "x-backend-wallet-address": BACKEND_WALLET,
      Authorization: `Bearer ${process.env.THIRDWEB_API_SECRET_KEY}`,
    };
    const body = {
      recipient: user.ethAddress,
      amount: 1,
    };
    const response = await axiosInstance.post(url, body, { headers: headers });
    res.json(response.data);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: "Error claiming ERC20" });
  }
};

export const getERC20Balance = async (req: Request, res: Response) => {
  const { authToken } = req.body;
  if (!authToken || !userTokens[authToken]) {
    return res.status(400).json({ message: "Invalid auth token" });
  }
  const user = userTokens[authToken];
  try {
    const url = `${ENGINE_URL}/contract/${CHAIN}/${ERC20_CONTRACT}/erc20/balance-of?wallet_address=${user.ethAddress}`;

    const headers = {
      "x-backend-wallet-address": BACKEND_WALLET,
      Authorization: `Bearer ${process.env.THIRDWEB_API_SECRET_KEY}`,
    };
    const response = await axiosInstance.get(url, { headers: headers });
    res.json(response.data);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: "Error retrieving ERC20 balance" });
  }
};
