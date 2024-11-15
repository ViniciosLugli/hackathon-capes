'use client'

import * as React from 'react'
import Image from 'next/image'
import { BellDot } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from '@/components/ui/navigation-menu'

import logoCapes from '@/assets/logocapes2.png'
import logoPeriodicos from '@/assets/logo_periodicos-simples2.jpg'

export function Navbar() {
	return (
		<header className="border-b bg-white shadow-sm">
			<div className="container mx-auto px-4">
				<div className="flex h-16 items-center justify-between">
					<div className="flex items-center gap-4 w-1/4">
						<Image src={logoCapes} alt="CAPES Logo" className="h-6 w-auto" />
						<div className="h-6 w-px bg-[#2E144D]" />
						<Image src={logoPeriodicos} alt="Periódicos Logo" className="h-6 w-auto" />
					</div>
					<NavigationMenu className="flex-grow flex justify-center">
						<NavigationMenuList className="space-x-2">
							<NavigationMenuItem>
								<NavigationMenuTrigger className="text-[#2E144D]">Acervo</NavigationMenuTrigger>
								<NavigationMenuContent>
									<div className="grid gap-3 p-4 w-[400px]">
										<NavigationMenuLink asChild>
											<a className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-[#5EC5E0] hover:text-white focus:bg-[#5EC5E0] focus:text-white">
												<div className="text-sm font-medium leading-none">Bases de Dados</div>
												<p className="line-clamp-2 text-sm leading-snug text-muted-foreground">Acesse bases de dados científicas nacionais e internacionais</p>
											</a>
										</NavigationMenuLink>
										<NavigationMenuLink asChild>
											<a className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-[#5EC5E0] hover:text-white focus:bg-[#5EC5E0] focus:text-white">
												<div className="text-sm font-medium leading-none">Periódicos</div>
												<p className="line-clamp-2 text-sm leading-snug text-muted-foreground">Explore revistas científicas em diversas áreas do conhecimento</p>
											</a>
										</NavigationMenuLink>
									</div>
								</NavigationMenuContent>
							</NavigationMenuItem>
							<NavigationMenuItem>
								<NavigationMenuTrigger className="text-[#2E144D]">Treinamentos</NavigationMenuTrigger>
								<NavigationMenuContent>
									<div className="grid gap-3 p-4 w-[400px]">
										<NavigationMenuLink asChild>
											<a className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-[#5EC5E0] hover:text-white focus:bg-[#5EC5E0] focus:text-white">
												<div className="text-sm font-medium leading-none">Agenda</div>
												<p className="line-clamp-2 text-sm leading-snug text-muted-foreground">Confira os próximos treinamentos disponíveis</p>
											</a>
										</NavigationMenuLink>
									</div>
								</NavigationMenuContent>
							</NavigationMenuItem>
							<NavigationMenuItem>
								<Button variant="ghost" size="sm" className="text-[#2E144D]">
									Informativos
								</Button>
							</NavigationMenuItem>
							<NavigationMenuItem>
								<Button variant="ghost" size="sm" className="text-[#2E144D]">
									Ajuda
								</Button>
							</NavigationMenuItem>
						</NavigationMenuList>
					</NavigationMenu>
					<div className="flex items-center gap-4 w-1/4 justify-end">
						<Button variant="ghost" size="icon" className="text-[#2E144D]">
							<BellDot className="h-5 w-5" />
							<span className="sr-only">Notificações</span>
						</Button>
						<Button variant="outline" className="border-[#2E144D] text-[#2E144D] hover:bg-[#2E144D] hover:text-white">
							Meu Espaço
						</Button>
					</div>
				</div>
			</div>
		</header>
	)
}
