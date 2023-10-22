import { ThirdwebAuth } from "@thirdweb-dev/auth/express";
import { PrivateKeyWallet } from "@thirdweb-dev/auth/evm";
import { config } from "dotenv";
import express from "express";
import cors from "cors";

config();

const app = express();
const PORT = 8000;

// NOTE: This users map is for demo purposes. Its used to show the power of
// what you can accomplish with the Auth callbacks. In a production app,
// you would want to store this data somewhere externally, like a database or
// on-chain.
const wallets: Record<string, any> = {};
const users: Record<string, any> = {};

const { authRouter, authMiddleware, getUser } = ThirdwebAuth({
  domain: process.env.THIRDWEB_AUTH_DOMAIN || "",
  wallet: new PrivateKeyWallet(process.env.THIRDWEB_AUTH_PRIVATE_KEY || ""),
  // NOTE: All these callbacks are optional! You can delete this section and
  // the Auth flow will still work.
  callbacks: {
    onLogin: async (address) => {
      // Here we can run side-effects like creating and updating user data
      // whenever a user logs in.
      if (!wallets[address]) {
        wallets[address] = {
          created_at: Date.now(),
          last_login_at: Date.now(),
          num_log_outs: 0,
        };
      } else {
        wallets[address].last_login_at = Date.now();
      }

      // We can also provide any session data to store in the user's session.
      return { role: ["player"] };
    },
    onUser: async (user) => {
      // Here we can run side-effects whenever a user is fetched from the client side
      if (wallets[user.address]) {
        wallets[user.address].user_last_accessed = Date.now();
      }

      // And we can provide any extra user data to be sent to the client
      // along with the default user object.
      return wallets[user.address];
    },
    onLogout: async (user) => {
      // Finally, we can run any side-effects whenever a user logs out.
      if (wallets[user.address]) {
        wallets[user.address].num_log_outs++;
      }
    },
  },
});

// We add the auth middleware to our app to let us access the user across our API
app.use(authMiddleware);
app.use(cors());
app.use(express.json());

// Now we add the auth router to our app to set up the necessary auth routes
app.use("/auth", authRouter);

app.get("/secret", async (req, res) => {
  const user = await getUser(req);

  if (!user) {
    return res.status(401).json({
      message: "Not authorized.",
    });
  }

  return res.status(200).json({
    message: "This is a secret... don't tell anyone.",
  });
});

// Assuming users' 'username' is unique
function findUserByUsername(username: string) {
  return users[username];
}

app.post("/link-wallet", authMiddleware, async (req, res) => {
  try {
    // Retrieve the wallet information from the user's session.
    const wallet = await getUser(req);

    if (!wallet) {
      return res.status(401).json({ message: "Unauthorized access." });
    }

    // Retrieve the username from the request body.
    const { username } = req.body;

    if (!username) {
      return res.status(400).json({ message: "Username is required." });
    }

    // Find the corresponding user in your "database" (the 'users' object).
    if (!users[username]) {
      // Error handling if the user does not exist in 'users'
      return res.status(400).json({ message: "User does not exist." });
    }

    // Link the Ethereum address from the session to the user's account.
    users[username].ethAddress = wallet.address; // assuming the wallet object has an 'address' field

    res
      .status(200)
      .json({ message: "Ethereum address linked successfully to user!" });
  } catch (error) {
    console.error("An error occurred while linking wallet: ", error);
    res.status(500).json({ message: "Internal Server Error." });
  }
});

app.post("/register", (req, res) => {
  const { username, password } = req.body;

  // Simple validation (improve for production)
  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username and password are required" });
  }

  // Check if the user already exists
  if (findUserByUsername(username)) {
    return res.status(400).json({ message: "User already exists" });
  }

  // Store the new user (use proper hashing in production)
  users[username] = {
    username,
    password, // hash and salt this password for actual production code
    ethAddress: "", // This will be populated upon login
  };

  res.status(201).json({ message: "User registered successfully" });
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  // Simple validation
  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username and password are required" });
  }

  const user = findUserByUsername(username);

  if (!user || user.password !== password) {
    // use proper password comparison for hashed passwords in production
    return res.status(400).json({ message: "Invalid username or password" });
  }

  // You might want to return a token here (e.g., a JWT) for the frontend to use and authenticate further requests
  // However, that's dependent on how authentication is managed in your overall application.

  res
    .status(200)
    .json({ message: "Login successful", ethAddress: user.ethAddress });
});

app.post("/claim-erc20", authMiddleware, async (req, res) => {
  try {
    // Retrieve the wallet information from the user's session.
    const wallet = await getUser(req);

    if (!wallet) {
      return res.status(401).json({ message: "Unauthorized access." });
    }

    // Retrieve the username from the request body.
    const { username } = req.body;

    if (!username) {
      return res.status(400).json({ message: "Username is required." });
    }

    // Find the corresponding user in your "database" (the 'users' object).
    if (!users[username]) {
      // Error handling if the user does not exist in 'users'
      return res.status(400).json({ message: "User does not exist." });
    }

    // Check if the user has already claimed the ERC20 token
    if (users[username].claimed) {
      return res
        .status(400)
        .json({ message: "User has already claimed the ERC20 token." });
    }
  } catch (error) {
    console.error("An error occurred while claiming ERC20 token: ", error);
    res.status(500).json({ message: "Internal Server Error." });
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

