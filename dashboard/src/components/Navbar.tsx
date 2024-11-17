'use client'

import * as React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { BellDot, Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from '@/components/ui/navigation-menu'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'

import logoCapes from '@/assets/logocapes2.png'
import logoPeriodicos from '@/assets/logo_periodicos-simples2.jpg'

export function Navbar() {
	const [isOpen, setIsOpen] = React.useState(false)

	return (
		<header className="border-b bg-white shadow-sm">
			<div className="container mx-auto px-4">
				<div className="flex h-16 items-center justify-between">
					<div className="flex items-center gap-4 w-1/4">
						<Image src={logoCapes} alt="CAPES Logo" className="h-6 w-auto" />
						<div className="h-6 w-px bg-[#2E144D] hidden sm:block" />
						<Image src={logoPeriodicos} alt="Periódicos Logo" className="h-6 w-auto hidden sm:block" />
					</div>
					<NavigationMenu className="hidden md:flex flex-grow justify-center">
						<NavigationMenuList className="space-x-2">
							<NavigationMenuItem>
								<Link href="/" legacyBehavior passHref>
									<NavigationMenuLink className="text-[#2E144D] hover:bg-[#5EC5E0] hover:text-white px-3 py-2 rounded-md">Início</NavigationMenuLink>
								</Link>
							</NavigationMenuItem>
							<NavigationMenuItem>
								<Link href="/search" legacyBehavior passHref>
									<NavigationMenuLink className="text-[#2E144D] hover:bg-[#5EC5E0] hover:text-white px-3 py-2 rounded-md">Pesquisa</NavigationMenuLink>
								</Link>
							</NavigationMenuItem>
							<NavigationMenuItem>
								<Link href="/editor" legacyBehavior passHref>
									<NavigationMenuLink className="text-[#2E144D] hover:bg-[#5EC5E0] hover:text-white px-3 py-2 rounded-md">Editor de artigo</NavigationMenuLink>
								</Link>
							</NavigationMenuItem>
						</NavigationMenuList>
					</NavigationMenu>
					<div className="flex items-center gap-4 w-1/4 justify-end">
						<Button variant="ghost" size="icon" className="text-[#2E144D]">
							<BellDot className="h-5 w-5" />
							<span className="sr-only">Notificações</span>
						</Button>
						<Button variant="outline" className="border-[#2E144D] text-[#2E144D] hover:bg-[#2E144D] hover:text-white hidden sm:inline-flex">
							Meu Espaço
						</Button>
						<Sheet open={isOpen} onOpenChange={setIsOpen}>
							<SheetTrigger asChild>
								<Button variant="ghost" size="icon" className="md:hidden">
									<Menu className="h-5 w-5" />
									<span className="sr-only">Menu</span>
								</Button>
							</SheetTrigger>
							<SheetContent side="right">
								<nav className="flex flex-col space-y-4">
									<Link href="/" className="text-[#2E144D] hover:bg-[#5EC5E0] hover:text-white px-3 py-2 rounded-md" onClick={() => setIsOpen(false)}>
										Início
									</Link>
									<Link href="/search" className="text-[#2E144D] hover:bg-[#5EC5E0] hover:text-white px-3 py-2 rounded-md" onClick={() => setIsOpen(false)}>
										Pesquisa
									</Link>
									<Link href="/editor" className="text-[#2E144D] hover:bg-[#5EC5E0] hover:text-white px-3 py-2 rounded-md" onClick={() => setIsOpen(false)}>
										Editor de artigo
									</Link>
									<Button variant="outline" className="border-[#2E144D] text-[#2E144D] hover:bg-[#2E144D] hover:text-white w-full" onClick={() => setIsOpen(false)}>
										Meu Espaço
									</Button>
								</nav>
							</SheetContent>
						</Sheet>
					</div>
				</div>
			</div>
		</header>
	)
}
