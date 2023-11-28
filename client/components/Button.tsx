import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import clsx from 'clsx';

const buttonVariants = cva(
	clsx(
		'flex items-center justify-center gap-3 rounded-md font-decorative text-2xl leading-none  transition-colors duration-300',
		'ring-offset-b-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 '
	),
	{
		variants: {
			variant: {
				default: 'bg-f-900 tracking-wider text-b-100',
				link: 'inline !p-0 font-sans text-base font-semibold text-accent-500 hover:text-accent-600',
			},
			size: {
				default: 'px-5 py-4',
			},
		},
		defaultVariants: {
			variant: 'default',
			size: 'default',
		},
	}
);

export interface ButtonProps
	extends React.ButtonHTMLAttributes<HTMLButtonElement>,
		VariantProps<typeof buttonVariants> {
	asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
	({ className, variant, size, asChild = false, ...props }, ref) => {
		const Comp = asChild ? Slot : 'button';
		return (
			<Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
		);
	}
);

Button.displayName = 'Button';

export { Button, buttonVariants };
