'use client';

import React from 'react';
import { LoginForm } from '@/components/LoginForm';
import splashImage from './_assets/splash.png';
import peopleImage from './_assets/people.png';
import Image from 'next/image';

export default function Page() {
	return (
		<main
			className='container relative'
			style={{
				maxWidth: '2000px',
			}}
		>
			<Image
				src={splashImage}
				alt=''
				aria-hidden
				className='absolute inset-x-0 top-[50%] -z-10 translate-y-[-50%]'
			/>

			<Image
				src={peopleImage}
				alt=''
				aria-hidden
				className='absolute bottom-0 right-0 -z-10 w-[45%]'
				height={850}
			/>

			<div className='container relative z-10 min-h-screen py-10'>
				<span className='font-decorative text-4xl tracking-wide text-accent-600'>By thirdweb</span>
				<h1 className='font-decorative text-[150px] leading-none'>SPEED RACER.</h1>
				<div className='h-10' />
				<LoginForm />
			</div>
		</main>
	);
}
