'use client';

import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
	useUser,
	ConnectWallet,
	useConnectionStatus,
	useLogin,
	lightTheme,
	useLogout,
} from '@thirdweb-dev/react';
import { Input } from '@/components/Input';
import { Label } from './Label';
import { Button } from './Button';
import { DynamicHeight } from './DynamicHeight';
import { AlertCircleIcon, ArrowDownIcon, UserIcon, Link2Icon } from 'lucide-react';
import { Spinner } from './Spinner/Spinner';
import { cn } from '@/lib/utils';

const SERVER_URL = `http://localhost:8000`;

interface UserData {
	username: string;
	password: string;
	ethAddress: string;
}

function CustomConnectWallet() {
	const connectionStatus = useConnectionStatus();
	return (
		<ConnectWallet
			className={cn(
				'!w-full !rounded-lg',
				connectionStatus === 'disconnected' && '!font-decorative !text-2xl',
				connectionStatus === 'connected' && '!border-[1.5px] '
			)}
			auth={{
				loginOptional: true,
			}}
			theme={lightTheme({
				colors: {
					borderColor: 'var(--border)',
				},
			})}
		/>
	);
}

export function LoginForm() {
	const [username, setUsername] = useState('');

	// user can be logged in already or not on pageload, so we start with "unknown" status
	const [screen, setScreen] = useState<'unknown' | 'main' | 'link-wallet' | 'wallet-linked'>(
		'unknown'
	);

	const { user, isLoading } = useUser();
	const userDataQuery = useGetUserDataForWalletAddress(user?.address);
	const userDataLoading = userDataQuery.isLoading;
	const userDataAddress = userDataQuery.data?.ethAddress;

	useEffect(() => {
		if (!isLoading) {
			// if user is logged in
			if (user) {
				if (!userDataLoading) {
					// if logged-in user's wallet is linked
					if (userDataAddress) {
						setScreen('wallet-linked');
					} else {
						setScreen('link-wallet');
					}
				}
			}

			// if user is not logged in
			else {
				setScreen('main');
			}
		}
	}, [user, isLoading, userDataLoading, userDataAddress]);

	return (
		<form
			autoComplete='off'
			className='rounded-[14px] border-[1.5px] bg-b-100 shadow-lg'
			style={{
				maxWidth: '480px',
			}}
			onSubmit={e => {
				e.preventDefault();
			}}
		>
			<DynamicHeight>
				{screen === 'unknown' ? (
					<div
						className='flex items-center justify-center'
						style={{
							minHeight: '500px',
						}}
					>
						<Spinner className='h-10 w-10' />
					</div>
				) : (
					<div className='p-8'>
						<div className='mb-4 flex justify-center text-accent-500'>
							<FormIcon size={70} />
						</div>

						{screen === 'main' && (
							<LoginOrSignupForm
								username={username}
								setUsername={setUsername}
								onNext={() => {
									setScreen('link-wallet');
								}}
							/>
						)}

						{screen === 'link-wallet' && (
							<LinkWallet onBack={() => setScreen('main')} username={username} />
						)}

						{screen === 'wallet-linked' && userDataAddress && (
							<WalletLinked address={userDataAddress} />
						)}
					</div>
				)}
			</DynamicHeight>
		</form>
	);
}

/**
 * login or signup with given username and password
 */
function LoginOrSignupForm(props: {
	username: string;
	setUsername: (username: string) => void;
	onNext: () => void;
}) {
	const [password, setPassword] = useState('');
	const [loginMode, setLoginMode] = useState<'login' | 'signup'>('signup');
	const [status, setStatus] = useState<'idle' | 'loading' | { error: string }>('idle');
	const { username, setUsername } = props;

	const handleLogin = async () => {
		setStatus('loading');
		try {
			// Attempt to login or register the user
			const res = await fetch(`${SERVER_URL}/user/login`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ username, password }),
			});

			const data = await res.json();
			if (!res.ok) {
				throw new Error(data.message || 'Something went wrong during login/registration.');
			}
			// setUserMessage(data.message);
			props.onNext();
		} catch (error: any) {
			setStatus({ error: error.message });
		}
	};

	const handleSignup = async () => {
		setStatus('loading');
		// fake extra time
		// await new Promise(resolve => setTimeout(resolve, 5000));

		try {
			// Send request to the server to register the user
			const res = await fetch(`${SERVER_URL}/user/register`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ username, password }), // sending username and password
			});

			const data = await res.json();

			if (!res.ok) {
				throw new Error(data.message || 'Something went wrong during registration.');
			}

			// setUserMessage('Registration successful! You may now log in.');
			props.onNext();
		} catch (error: any) {
			setStatus({ error: error.message });
			// setUserMessage(error.message);
		}
	};

	return (
		<div>
			<FormTitle>{loginMode === 'login' ? 'Login' : 'Sign up'}</FormTitle>
			<div className='h-10' />

			<div>
				<Label for='username'>Username</Label>
				<Input
					required
					type='text'
					id='username'
					value={username}
					onChange={e => {
						setStatus('idle');
						setUsername(e.target.value);
					}}
					placeholder='Enter Username'
					variant={typeof status === 'object' ? 'error' : 'default'}
				/>
			</div>

			<div className='h-8' />

			<div>
				<Label for='password'>Password</Label>
				<Input
					variant={typeof status === 'object' ? 'error' : 'default'}
					id='password'
					type='password'
					value={password}
					required
					onChange={e => {
						setStatus('idle');
						setPassword(e.target.value);
					}}
					placeholder='Enter Password'
				/>
			</div>

			<div className='h-12' />

			{loginMode === 'login' && (
				<Button onClick={handleLogin} className='w-full'>
					{status === 'loading' ? <Spinner className='h-6 w-6' /> : <FlagIcon size={24} />}
					{status === 'loading' ? 'Logging in' : 'Login'}
				</Button>
			)}

			{loginMode === 'signup' && (
				<Button onClick={handleSignup} className='w-full'>
					{status === 'loading' ? <Spinner className='h-6 w-6' /> : <FlagIcon size={24} />}
					{status === 'loading' ? 'Signing up' : 'Sign up'}
				</Button>
			)}

			{typeof status === 'object' && status.error ? (
				<div>
					<div className='my-8 flex items-center justify-center gap-2 text-center text-base font-semibold text-danger-500 duration-300 fade-in-0'>
						<AlertCircleIcon className='h-5 w-5 shrink-0' />
						{status.error}
					</div>
				</div>
			) : (
				<div className='h-5' />
			)}

			<div className='px-5'>
				<p className='text-center'>
					<span className='mr-1 text-base font-semibold text-f-500'>
						{loginMode === 'login' ? `Don't have an account? ` : 'Already have an account? '}
					</span>
					<Button
						type='button'
						variant='link'
						onClick={() => {
							setLoginMode(loginMode === 'login' ? 'signup' : 'login');
						}}
					>
						{loginMode === 'login' ? 'Sign up' : 'Login'}
					</Button>
				</p>
			</div>
		</div>
	);
}

/**
 * link wallet to given username
 */
function LinkWallet(props: { onBack: () => void; username: string }) {
	const { isLoading: loginLoading, login } = useLogin();
	const { username } = props;
	const connectionStatus = useConnectionStatus();

	const handleLinkWallet = async (token: string) => {
		try {
			// Sending a request to the backend to link the wallet with the username
			const res = await fetch(`${SERVER_URL}/user/link-wallet`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({ username }),
			});
			const data = await res.json();
			if (!res.ok) {
				throw new Error(data.message || 'Something went wrong while linking the wallet.');
			}
			// setUserMessage('Wallet linked successfully!');
		} catch (error: any) {
			console.error(error);
			// setStatus({ error: error.message });
		}
	};

	return (
		<div>
			<FormTitle>Link a Web3 Wallet</FormTitle>
			<div className='h-2' />
			<p className='text-center font-medium text-f-500'>
				This wallet will receive distributed game rewards.
			</p>

			<div className='h-10' />

			{connectionStatus === 'connected' && (
				<>
					<div className='flex items-center gap-3 rounded-lg border-[1.5px] px-4 py-3'>
						<UserIcon className='h-6 w-6' />
						<div>
							<p className='font-decorative font-semibold tracking-wider text-f-500'>Username</p>
							<p className='font-decorative text-lg font-semibold tracking-wider text-f-900'>
								{username}
							</p>
						</div>
					</div>
					<div className='h-4' />
					<div className='flex justify-center'>
						<ArrowDownIcon className='h-6 w-6' />
					</div>
					<div className='h-4' />
				</>
			)}

			<CustomConnectWallet />

			{connectionStatus === 'connected' && (
				<>
					<div className='h-10' />

					<Button
						className='w-full'
						onClick={async () => {
							const token = await login();
							if (typeof token === 'string') {
								await handleLinkWallet(token);
							} else {
								console.error('Token is not a string');
								console.log(token);
							}
						}}
					>
						{loginLoading ? (
							<Spinner className='h-6 w-6' />
						) : (
							<Link2Icon className='h-6 w-6 rotate-90' />
						)}
						{loginLoading ? 'Linking Wallet' : 'Link Wallet'}
					</Button>
				</>
			)}

			<div className='h-4' />

			<Button className='w-full border-2 bg-b-100 text-f-900' onClick={props.onBack}>
				Back
			</Button>
		</div>
	);
}

/**
 * link a wallet to username
 *
 * we need to fetch username from walletAddress by querying backend because this component may also be rendered directly on page load
 * in that case, we get the walletAddress from logged-in user object and fetch the associated user from backend
 */
function WalletLinked(props: { address: string }) {
	const { logout } = useLogout();
	const userDataQuery = useGetUserDataForWalletAddress(props.address);

	const handleLogout = async (event: React.MouseEvent) => {
		event.preventDefault();
		await logout();
	};

	return (
		<div>
			<FormTitle>{userDataQuery.data?.username || ''}</FormTitle>
			<div className='h-3' />
			<div className='flex justify-center'>
				<Button variant='link' onClick={handleLogout} className='font-semibold'>
					Sign out
				</Button>
			</div>

			<div className='h-10' />

			<p className='rounded-lg border-[1.5px] p-4 text-center font-decorative text-xl'>
				{props.address}
			</p>
		</div>
	);
}

function FormTitle(props: { children: React.ReactNode }) {
	return (
		<h2 className='text-center font-decorative text-3xl leading-none text-f-900'>
			{props.children}
		</h2>
	);
}

function FormIcon(props: { size: number }) {
	return (
		<svg
			width={props.size}
			height={props.size}
			viewBox='0 0 70 70'
			fill='none'
			xmlns='http://www.w3.org/2000/svg'
		>
			<path
				d='M52.3999 26.9999C51.7999 27.7999 50.9999 28.3999 50.9999 28.9999C50.9999 29.5999 51.5999 30.1999 52.1999 30.9999C53.1999 31.9999 54.1999 32.7999 53.9999 33.7999C53.9999 34.7999 52.9999 35.7999 51.9999 36.7999L43.7999 44.9999L40.9999 42.3999L49.3999 33.9999L47.3999 31.9999L44.5999 34.7999L36.9999 27.1999L44.9999 19.5999C45.7999 18.7999 46.9999 18.7999 47.7999 19.5999L52.3999 24.1999C53.1999 24.9999 53.1999 26.3999 52.3999 26.9999ZM16.9999 47.3999L36.1999 28.1999L43.5999 35.7999L24.5999 54.9999H16.9999V47.3999ZM18.7599 17.9199L22.9999 22.1799L27.2399 17.9199L30.0799 20.7599L25.8199 24.9999L30.0799 29.2399L27.2399 32.0799L22.9999 27.8199L18.7599 32.0799L15.9199 29.2399L20.1799 24.9999L15.9199 20.7599L18.7599 17.9199Z'
				fill='currentColor'
			/>
			<path
				d='M17.6255 26.58C18.2255 27.38 19.0255 27.98 19.0255 28.58C19.0255 29.18 18.4255 29.78 17.8255 30.58C16.8255 31.58 15.8255 32.38 16.0255 33.38C16.0255 34.38 17.0255 35.38 18.0255 36.38L26.2255 44.58L29.0255 41.98L20.6255 33.58L22.6255 31.58L25.4255 34.38L33.0255 26.78L25.0255 19.18C24.2255 18.38 23.0255 18.38 22.2255 19.18L17.6255 23.78C16.8255 24.58 16.8255 25.98 17.6255 26.58ZM53.0255 46.98L33.8255 27.78L26.4255 35.38L45.4255 54.58H53.0255V46.98ZM51.2655 17.5L47.0255 21.76L42.7855 17.5L39.9455 20.34L44.2055 24.58L39.9455 28.82L42.7855 31.66L47.0255 27.4L51.2655 31.66L54.1055 28.82L49.8455 24.58L54.1055 20.34L51.2655 17.5Z'
				fill='currentColor'
			/>
			<circle cx='35' cy='35' r='33' stroke='currentColor' strokeWidth='4' />
		</svg>
	);
}

function FlagIcon(props: { size: number }) {
	return (
		<svg
			width={props.size}
			height={props.size}
			viewBox='0 0 23 25'
			fill='none'
			xmlns='http://www.w3.org/2000/svg'
		>
			<g clipPath='url(#clip0_710_305)'>
				<path
					d='M3.91071 1.87528C3.91071 1.03571 3.23242 0.357422 2.39286 0.357422C1.55329 0.357422 0.875 1.03571 0.875 1.87528V23.1253C0.875 23.9648 1.55329 24.6431 2.39286 24.6431C3.23242 24.6431 3.91071 23.9648 3.91071 23.1253V17.0539L6.96066 16.2902C8.91016 15.8016 10.9735 16.0293 12.7712 16.9258C14.8677 17.9741 17.3011 18.1021 19.4925 17.2768L21.1384 16.6602C21.7313 16.4372 22.125 15.8728 22.125 15.2372V3.49275C22.125 2.40179 20.9771 1.69029 20 2.17885L19.5446 2.40653C17.3485 3.50698 14.7634 3.50698 12.5672 2.40653C10.9023 1.57171 8.99079 1.363 7.18359 1.81362L3.91071 2.63421V1.87528Z'
					fill='currentColor'
				/>
			</g>
			<defs>
				<clipPath id='clip0_710_305'>
					<rect
						width='21.25'
						height='24.2857'
						fill='currentColor'
						transform='translate(0.875 0.357422)'
					/>
				</clipPath>
			</defs>
		</svg>
	);
}

function useGetUserDataForWalletAddress(walletAddress?: string) {
	return useQuery({
		queryKey: ['username', walletAddress],
		queryFn: async () => {
			if (!walletAddress) {
				throw new Error('No wallet address provided');
			}
			return fetchUserData(walletAddress);
		},
		enabled: !!walletAddress,
	});
}

export async function fetchUserData(walletAddress: string) {
	const res = await fetch(`${SERVER_URL}/user/get-user-data`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({ walletAddress: walletAddress }),
	});
	const user = (await res.json()).user as UserData | undefined;
	if (user) {
		return user;
	}
	return null;
}
