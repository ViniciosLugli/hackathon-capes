import type { Metadata } from 'next'
import './globals.css'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { Toaster } from '@/components/ui/toaster'

export const metadata: Metadata = {
	title: 'Portal periodicos CAPES',
	description: 'Portal de periódicos da CAPES',
}

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	return (
		<html lang="pt-br">
			<body className="min-h-screen bg-[#F1F1F1] flex flex-col">
				<Navbar />
				<main>{children}</main>
				<Toaster />
				<Footer />
			</body>
		</html>
	)
}
