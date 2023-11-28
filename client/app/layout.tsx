import { Inter, Bebas_Neue } from 'next/font/google';
import './global.css';
import { ConfiguredThirdwebProvider } from '../components/ThirdwebProvider';

const sansFont = Inter({
	subsets: ['latin'],
	variable: '--font-sans',
	weight: 'variable',
});

const decorativeFont = Bebas_Neue({
	subsets: ['latin'],
	variable: '--font-decorative',
	weight: '400',
});

export default function Layout(props: { children: React.ReactNode }) {
	return (
		<html lang='en'>
			<body className={`${sansFont.variable} ${decorativeFont.variable} font-sans`}>
				<ConfiguredThirdwebProvider>{props.children}</ConfiguredThirdwebProvider>
			</body>
		</html>
	);
}
