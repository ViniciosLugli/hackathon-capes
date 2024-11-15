import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Search } from 'lucide-react'

import logoCapes from '@/assets/logocapes2.png'

export default function NotFound() {
	return (
		<div className="flex flex-col items-center justify-center min-h-screen bg-[#F1F1F1] px-4">
			<div className="text-center">
				<Image src={logoCapes} alt="CAPES Logo" width={150} height={50} className="mx-auto mb-8" />
				<h1 className="text-4xl font-bold text-[#2E144D] mb-4">Página não encontrada</h1>
				<p className="text-xl text-[#2E144D]/80 mb-8">Desculpe, não conseguimos encontrar a página que você está procurando.</p>
				<div className="flex flex-col sm:flex-row justify-center gap-4">
					<Button asChild className="bg-[#5EC5E0] hover:bg-[#5EC5E0]/90 text-white">
						<Link href="/">
							<ArrowLeft className="mr-2 h-4 w-4" /> Voltar para a página inicial
						</Link>
					</Button>
				</div>
			</div>
			<footer className="mt-16 text-center text-[#2E144D]/60">
				<p>
					Se você acredita que isso é um erro, por favor{' '}
					<a href="/contato" className="text-[#5EC5E0] hover:underline">
						entre em contato conosco
					</a>
					.
				</p>
			</footer>
		</div>
	)
}
