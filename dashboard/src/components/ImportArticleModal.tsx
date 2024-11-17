'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'

interface ImportArticleModalProps {
	isOpen: boolean
	onClose: () => void
	onImport: (siteId: string) => void
}

export function ImportArticleModal({ isOpen, onClose, onImport }: ImportArticleModalProps) {
	const [input, setInput] = useState('')
	const { toast } = useToast()

	const handleImport = () => {
		const siteId = input.trim()
		if (siteId) {
			if (siteId.startsWith('https://www.periodicos.capes.gov.br/')) {
				const urlParams = new URLSearchParams(new URL(siteId).search)
				const id = urlParams.get('id')
				if (id) {
					onImport(id)
					toast({
						title: 'Importando',
						description: 'O artigo está sendo importado.',
					})
				} else {
					toast({
						title: 'Erro ao importar',
						description: 'Não foi possível importar o artigo. Por favor, verifique o link e tente novamente.',
						variant: 'destructive',
					})
				}
			} else {
				onImport(siteId)
			}
		}
	}

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="sm:max-w-[825px]">
				<DialogHeader>
					<DialogTitle>Importar artigo</DialogTitle>
				</DialogHeader>
				<div className="grid gap-4 py-4">
					<p className="text-sm text-gray-600">Insira o link ou ID do artigo que deseja importar.</p>
					<div className="grid grid-cols-4 items-center gap-4">
						<Input
							id="article-input"
							className="col-span-4"
							placeholder="Ex: https://www.periodicos.capes.gov.br/index.php/acervo/buscador.html?task=detalhes&source=&id=W4319081857"
							value={input}
							onChange={(e) => setInput(e.target.value)}
						/>
					</div>
				</div>
				<Button onClick={handleImport} className="text-white">
					Importar
				</Button>
			</DialogContent>
		</Dialog>
	)
}
