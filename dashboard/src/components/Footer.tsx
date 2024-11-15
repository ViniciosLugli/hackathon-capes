import Image from 'next/image'

import govBrLogo from '@/assets/Govbr_logo.svg'
import logoAcessoInformacao from '@/assets/logo-acesso-a-informacao.png'
import logoFalaBr from '@/assets/logo-fala-br.png'

export function Footer() {
	return (
		<footer className="mt-16 bg-[#2E144D] py-8 text-white">
			<div className="container mx-auto px-4">
				<div className="flex flex-wrap justify-between items-center">
					<div className="flex items-center space-x-4">
						<Image src={govBrLogo} alt="Governo do Brasil" height={48} width={192} />
						<Image src={logoAcessoInformacao} alt="Acesso à Informação" height={32} width={32} />
						<Image src={logoFalaBr} alt="Fala BR" height={32} width={96} />
					</div>
					<div className="flex items-center space-x-4 mt-4 md:mt-0">
						<a href="#" className="text-sm hover:underline">
							Termos de Uso
						</a>
						<a href="#" className="text-sm hover:underline">
							Política de Privacidade
						</a>
					</div>
				</div>
			</div>
		</footer>
	)
}
