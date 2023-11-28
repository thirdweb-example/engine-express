import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
	variant?: 'error' | 'default';
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
	({ className, type, ...props }, ref) => {
		return (
			<input
				type={type}
				className={cn(
					'border-[1.5px] ring-offset-b placeholder:text-f-200 flex w-full rounded-md px-3 py-2 text-2xl font-decorative tracking-wide',
					'focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:outline-none',
					props.variant === 'error' &&
						'border-danger-500 ring-danger-500 ring-1 focus-visible:ring-danger-500',
					className
				)}
				ref={ref}
				{...props}
			/>
		);
	}
);

Input.displayName = 'Input';

export { Input };
