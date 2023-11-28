import { Request, Response } from 'express';
import { randomUUID } from 'crypto';
import { getUser } from '../index';

interface UserData {
	username: string;
	password: string;
	ethAddress: string;
}

/**
 * Maps username to user data
 */
export const userNametoUser: Record<string, UserData> = {};

/**
 * Maps wallet address to user data
 */
export const walletAddressToUser: Record<string, UserData> = {};

/**
 * Maps username to auth token
 */
export const userTokens: Record<string, UserData> = {};

export const registerUser = async (req: Request, res: Response) => {
	const { username, password } = req.body;
	if (!username || !password) {
		return res.status(400).json({ message: 'Username and password are required' });
	}
	if (userNametoUser[username]) {
		return res.status(400).json({ message: 'User already exists' });
	}

	const newUser = {
		username,
		password, // hash and salt this password for actual production code
		ethAddress: '', // This will be populated upon login
	};

	userNametoUser[username] = newUser;

	res.status(201).json({ message: 'User registered successfully' });
};

export const loginUser = async (req: Request, res: Response) => {
	const { username, password } = req.body;
	if (!username || !password) {
		return res.status(400).json({ message: 'Username and password are required' });
	}
	const user = userNametoUser[username];
	if (!user || user.password !== password) {
		return res.status(400).json({ message: 'Invalid username or password' });
	}
	const uuid = randomUUID();
	userTokens[uuid] = user;
	res.status(200).json({
		message: 'Login successful',
		ethAddress: user.ethAddress,
		authToken: uuid,
	});
};

export const linkWallet = async (req: Request, res: Response) => {
	try {
		const wallet = await getUser(req);
		if (!wallet) {
			return res.status(401).json({ message: 'Unauthorized access.' });
		}
		const { username } = req.body;

		if (!username) {
			return res.status(400).json({ message: 'Username is required.' });
		}
		if (!userNametoUser[username]) {
			return res.status(400).json({ message: 'User does not exist.' });
		}
		userNametoUser[username].ethAddress = wallet.address; // assuming the wallet object has an 'address' field
		walletAddressToUser[wallet.address] = userNametoUser[username];

		res.status(200).json({ message: 'Ethereum address linked successfully to user!' });
	} catch (error) {
		console.error('An error occurred while linking wallet: ', error);
		res.status(500).json({ message: 'Internal Server Error.' });
	}
};

export const getUserData = async (req: Request, res: Response) => {
	try {
		const walletAddress = req.body.walletAddress;
		if (!walletAddress) {
			return res.status(400).json({ message: 'Wallet address is required.' });
		}
		const user = walletAddressToUser[walletAddress];
		if (!user) {
			return res.status(400).json({ message: 'User does not exist.' });
		}
		res.status(200).json({ message: 'User data retrieved.', user });
	} catch (error) {
		console.error('An error occurred while getting user data: ', error);
		res.status(500).json({ message: 'Internal Server Error.' });
	}
};
