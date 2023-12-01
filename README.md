## Unreal Engine x thirdweb Engine Architecture

This guide will show you how to have a production style setup for your Unreal Engine game.

To do so, we’ll use a template to deploy a client/server compatible with Engine, and a template game.

Here’s an overview of the overall architecture for this example:

![Untitled](https://github.com/thirdweb-example/engine-express/assets/43042585/e9347658-2b9b-4988-a6bd-fffaeac1e79c)

## Demo

You can try out our live [Speed Racer](placeholder) demo to see all parts working together, it is deployed on arbitrum-sepolia.

## Setting up Engine

This example makes use of thirdweb Engine, a backend HTTP server that calls smart contracts using your managed backend wallets.

You’ll need an instance running for your server to interact with the blockchain.

Documentation can be found [here](https://portal.thirdweb.com/engine).

## Setting up your website and backend

We’ll need a website for users to sign up and link their wallets, and a backend to handle wallet authentication, user registration and interaction with engine.

Here’s a step by step guide to deploy your client/server:

1. Clone https://github.com/thirdweb-example/engine-express/
2. Install client dependencies `cd client` and `yarn`
3. Install server dependencies `cd server` and `yarn`
4. Head back into the root folder and `yarn`
5. Replace the `.env.example` in the client/server folders with your own [api key](http://thirdweb.com/create-api-key) values and engine url - make sure your api key can be used to authenticate with your deployed engine
6. You can now run the client and server in two terminals using `yarn client` and `yarn server`
7. Go ahead and create a user on your website, and link a wallet
8. You are now ready to head into Unreal!

## Setting up Unreal Engine

This part is simple, we have a template for you with a simple script to interact with your server as per the architecture above. A level blueprint instantiates the UI, which has its own blueprint to interact with your server.

Go ahead and clone https://github.com/thirdweb-example/unreal_demo and head to `_Thirdweb/Scenes/Scene_Game` and start the level.

At this point, you can update your server url in ThirdwebManager.cpp, and website url in the Canvas_Main blueprint graph to match your deployed frontend/backend in the previous step.

You should now be able to login and see the output as the game polls and updates your balance whenever you collect an item while driving.

All thirdweb related assets are under the `_Thirdweb` folder in your Content Browser.
