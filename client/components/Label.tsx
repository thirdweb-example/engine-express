export function Label(props: { children: React.ReactNode; for?: string }) {
	return (
		<label
			className='mb-2 block font-decorative text-2xl leading-none tracking-wide'
			htmlFor={props.for}
		>
			{props.children}
		</label>
	);
}
