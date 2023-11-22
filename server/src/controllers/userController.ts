import { Request, Response } from "express";
import { randomUUID } from "crypto";
import { getUser } from "../index";

export const users: Record<string, any> = {};
export const userTokens: Record<string, any> = {};

export const registerUser = async (req: Request, res: Response) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username and password are required" });
  }
  if (users[username]) {
    return res.status(400).json({ message: "User already exists" });
  }
  users[username] = {
    username,
    password, // hash and salt this password for actual production code
    ethAddress: "", // This will be populated upon login
  };

  res.status(201).json({ message: "User registered successfully" });
};

export const loginUser = async (req: Request, res: Response) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username and password are required" });
  }
  const user = users[username];
  if (!user || user.password !== password) {
    return res.status(400).json({ message: "Invalid username or password" });
  }
  const uuid = randomUUID();
  userTokens[uuid] = user;
  res.status(200).json({
    message: "Login successful",
    ethAddress: user.ethAddress,
    authToken: uuid,
  });
};

export const linkWallet = async (req: Request, res: Response) => {
  try {
    const wallet = await getUser(req);
    if (!wallet) {
      return res.status(401).json({ message: "Unauthorized access." });
    }
    const { username } = req.body;

    if (!username) {
      return res.status(400).json({ message: "Username is required." });
    }
    if (!users[username]) {
      return res.status(400).json({ message: "User does not exist." });
    }
    users[username].ethAddress = wallet.address; // assuming the wallet object has an 'address' field
    res
      .status(200)
      .json({ message: "Ethereum address linked successfully to user!" });
  } catch (error) {
    console.error("An error occurred while linking wallet: ", error);
    res.status(500).json({ message: "Internal Server Error." });
  }
};
