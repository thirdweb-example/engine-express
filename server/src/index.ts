import express from "express";
import cors from "cors";
import { config } from "dotenv";

import { ThirdwebAuth } from "@thirdweb-dev/auth/express";
import { PrivateKeyWallet } from "@thirdweb-dev/auth/evm";

import userRoutes from "./routes/userRoutes";
import engineRoutes from "./routes/engineRoutes";

config();

const app = express();
const PORT = 8000;

const wallets: Record<string, any> = {};

export const { authRouter, authMiddleware, getUser } = ThirdwebAuth({
  domain: process.env.THIRDWEB_AUTH_DOMAIN || "",
  wallet: new PrivateKeyWallet(process.env.THIRDWEB_AUTH_PRIVATE_KEY || ""),
  callbacks: {
    onLogin: async (address) => {
      if (!wallets[address]) {
        wallets[address] = {
          created_at: Date.now(),
          last_login_at: Date.now(),
          num_log_outs: 0,
        };
      } else {
        wallets[address].last_login_at = Date.now();
      }
      return { role: ["player"] };
    },
    onUser: async (user) => {
      if (wallets[user.address]) {
        wallets[user.address].user_last_accessed = Date.now();
      }
      return wallets[user.address];
    },
    onLogout: async (user) => {
      if (wallets[user.address]) {
        wallets[user.address].num_log_outs++;
      }
    },
  },
});

app.use(authMiddleware);
app.use(cors());
app.use(express.json());

app.use("/auth", authRouter);
app.use("/user", authMiddleware, userRoutes);
app.use("/engine", engineRoutes);

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
