import React, { useState, useEffect } from "react";
import {
  useAddress,
  useUser,
  useLogin,
  useLogout,
  useMetamask,
  ConnectWallet,
} from "@thirdweb-dev/react";
import type { NextPage } from "next";

interface UserData {
  username: string;
  password: string;
  ethAddress?: string;
}

const Home: NextPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [userMessage, setUserMessage] = useState("");
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);

  const { login } = useLogin();
  const { logout } = useLogout();
  const { user, isLoggedIn } = useUser();

  useEffect(() => {
    if (isLoggedIn) {
      // Check if the user's Ethereum address is already linked
      const userData = user?.data as unknown as UserData;
      if (!userData?.ethAddress) {
        setUserMessage("Please link your Ethereum wallet.");
      } else {
        setUserMessage("");
      }
    }
  }, [isLoggedIn, user]);

  const handleLogin = async () => {
    try {
      // Attempt to login or register the user
      const res = await fetch("http://localhost:8000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(
          data.message || "Something went wrong during login/registration."
        );
      }
      setUserMessage(data.message);
      setIsUserLoggedIn(true); // Set user as logged in for Web2
    } catch (error: any) {
      setUserMessage(error.message);
    }
  };

  const handleLogout = async (event: React.MouseEvent) => {
    event.preventDefault();
    await logout();
    setIsUserLoggedIn(false);
  };

  const handleLinkWallet = async () => {
    try {
      await connect();
      const token: string = await login();

      // Sending a request to the backend to link the wallet with the username
      const res = await fetch("http://localhost:8000/link-wallet", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ username }), // you are passing the username here
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.message || "Something went wrong while linking the wallet."
        );
      }

      setUserMessage("Wallet linked successfully!");
    } catch (error: any) {
      setUserMessage(error.message);
    }
  };

  const handleRegister = async () => {
    try {
      // Send request to the server to register the user
      const res = await fetch("http://localhost:8000/register", {
        // Assuming you'll create a "/register" endpoint
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }), // sending username and password
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.message || "Something went wrong during registration."
        );
      }

      setUserMessage("Registration successful! You may now log in.");
      // Here, you might want to follow up with automatic login or clear the input fields, etc.
      setIsUserLoggedIn(true); // Set user as logged in for Web2
    } catch (error: any) {
      setUserMessage(error.message);
    }
  };

  return (
    <div>
      {!isUserLoggedIn ? (
        <>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
          />
          <button onClick={handleLogin}>Login</button>
          <button onClick={handleRegister}>Register</button>
          {userMessage && <div>{userMessage}</div>}
        </>
      ) : (
        <>
          <button onClick={handleLogout}>Logout</button>
          {/* Here, check if the wallet is linked instead of the user being logged in */}
          {user?.data && (user.data as unknown as UserData).ethAddress ? (
            <pre>
              Wallet Linked: {(user.data as unknown as UserData).ethAddress}
            </pre>
          ) : (
            <ConnectWallet
              btnTitle="Link Wallet"
              auth={{
                loginOptional: false,
              }}
            />
          )}
          <pre>User: {JSON.stringify(user, null, 2)}</pre>
        </>
      )}
    </div>
  );
};

export default Home;
