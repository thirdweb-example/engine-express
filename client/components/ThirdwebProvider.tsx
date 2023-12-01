"use client";

import {
  ThirdwebProvider,
  coinbaseWallet,
  metamaskWallet,
  okxWallet,
  phantomWallet,
  rainbowWallet,
  trustWallet,
  walletConnect,
  zerionWallet,
} from "@thirdweb-dev/react";

// This is the chainId your dApp will work on.
const activeChain = "goerli";

export function ConfiguredThirdwebProvider(props: {
  children: React.ReactNode;
}) {
  return (
    <ThirdwebProvider
      activeChain={activeChain}
      clientId={process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID || ""}
      authConfig={{
        domain: process.env.NEXT_PUBLIC_THIRDWEB_AUTH_DOMAIN || "",
        authUrl: "/api/auth",
      }}
      supportedWallets={[
        metamaskWallet(),
        coinbaseWallet(),
        walletConnect(),
        trustWallet(),
        rainbowWallet(),
        zerionWallet(),
        okxWallet(),
        phantomWallet(),
      ]}
    >
      {props.children}
    </ThirdwebProvider>
  );
}
