'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { AdvancedSearch } from '@/components/AdvancedSearch'
import { useSearch } from '@/contexts/SearchContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel'

import Placeholder from '@/assets/placeholder.svg'
import acessoAberto from '@/assets/Acesso_Aberto_Publicaes.png'
import treinamentos from '@/assets/treinamentos.png'
import acessoRemoto from '@/assets/Acesso_remoto.png'

export function HomePage() {
	const { isExpanded } = useSearch()

	return (
		<AnimatePresence>
			{!isExpanded && (
				<motion.div className="container mx-auto px-4 py-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
					<div className="mx-auto max-w-3xl text-center">
						<h1 className="text-4xl font-bold tracking-tight text-[#2E144D]">Bem-vindo ao Portal de Periódicos</h1>
						<p className="mt-4 text-lg text-[#2E144D]/80">Explore milhões de artigos científicos usando linguagem natural</p>
						<div className="mt-8">
							<AdvancedSearch />
						</div>
					</div>

					<div className="mt-16">
						<h2 className="text-2xl font-semibold mb-6 text-[#2E144D]">Destaques</h2>
						<Carousel className="mx-auto max-w-5xl">
							<CarouselContent>
								<CarouselItem>
									<Card>
										<CardContent className="flex aspect-[2/1] items-center justify-center p-6">
											<Image src={Placeholder} alt="Em Pauta - 22 de novembro" layout="fill" objectFit="cover" />
										</CardContent>
									</Card>
								</CarouselItem>
							</CarouselContent>
							<CarouselPrevious />
							<CarouselNext />
						</Carousel>
					</div>

					<div className="mt-16 grid gap-6 md:grid-cols-3">
						<Card className="bg-white">
							<CardContent className="flex flex-col items-center gap-4 p-6">
								<Image src={acessoAberto} alt="Acesso Aberto" width={512} height={256} />
								<h3 className="text-xl font-semibold text-[#2E144D]">Acesso Aberto</h3>
								<p className="text-center text-muted-foreground">Explore publicações de acesso aberto</p>
								<Button variant="ghost" className="text-[#5EC5E0] hover:bg-[#5EC5E0] hover:text-white">
									Saiba mais
								</Button>
							</CardContent>
						</Card>
						<Card className="bg-white">
							<CardContent className="flex flex-col items-center gap-4 p-6">
								<Image src={treinamentos} alt="Treinamentos" width={256} height={256} />
								<h3 className="text-xl font-semibold text-[#2E144D]">Treinamentos</h3>
								<p className="text-center text-muted-foreground">Aprenda a utilizar o Portal de Periódicos</p>
								<Button variant="ghost" className="text-[#5EC5E0] hover:bg-[#5EC5E0] hover:text-white">
									Ver agenda
								</Button>
							</CardContent>
						</Card>
						<Card className="bg-white">
							<CardContent className="flex flex-col items-center gap-4 p-6">
								<Image src={acessoRemoto} alt="Acesso Remoto" width={512} height={256} />
								<h3 className="text-xl font-semibold text-[#2E144D]">Acesso Remoto</h3>
								<p className="text-center text-muted-foreground">Acesse o Portal de qualquer lugar</p>
								<Button variant="ghost" className="text-[#5EC5E0] hover:bg-[#5EC5E0] hover:text-white">
									Como acessar
								</Button>
							</CardContent>
						</Card>
					</div>
				</motion.div>
			)}
		</AnimatePresence>
	)
}
