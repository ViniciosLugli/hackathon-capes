'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { EditorRef } from '@/components/Editor'

interface NormCheckerProps {
	content: string
	onCheck: (results: any) => void
	editorRef: React.RefObject<EditorRef>
}

export default function NormChecker({ content, onCheck, editorRef }: NormCheckerProps) {
	const [selectedNorms, setSelectedNorms] = useState({
		nbr10719: true,
		nbr10520: true,
		nbr6023: true,
		nbr6028: true,
	})
	const [isChecking, setIsChecking] = useState(false)
	const { toast } = useToast()

	const handleCheckboxChange = (norm: keyof typeof selectedNorms) => {
		setSelectedNorms((prev) => ({ ...prev, [norm]: !prev[norm] }))
	}

	const handleVerifyNorms = async () => {
		if (!content.trim()) {
			toast({
				title: 'Conteúdo vazio',
				description: 'Por favor, adicione algum conteúdo ao editor antes de verificar as normas.',
				variant: 'destructive',
			})
			return
		}

		const selectedNormsList = Object.entries(selectedNorms)
			.filter(([_, isSelected]) => isSelected)
			.map(([norm]) => norm)

		if (selectedNormsList.length === 0) {
			toast({
				title: 'Nenhuma norma selecionada',
				description: 'Por favor, selecione pelo menos uma norma para verificar.',
				variant: 'destructive',
			})
			return
		}

		setIsChecking(true)
		try {
			const contentWithLineNumbers = editorRef.current?.getContentWithLineNumbers() || ''
			const response = await fetch('/api/verify-norms', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ content: contentWithLineNumbers, norms: selectedNormsList }),
			})

			if (!response.ok) {
				throw new Error('Falha na verificação das normas')
			}

			const results = await response.json()
			results.normResults.forEach((normResult) => {
				normResult.issues.forEach((issue) => {
					issue.id = Math.random().toString(8)
				})
			})
			onCheck(results.normResults)
		} catch (error) {
			console.error('Error verifying norms:', error)
			toast({
				title: 'Erro na verificação',
				description: 'Ocorreu um erro ao verificar as normas. Por favor, tente novamente.',
				variant: 'destructive',
			})
		} finally {
			setIsChecking(false)
		}
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle>Verificador de Normas</CardTitle>
				<CardDescription>Selecione as normas que deseja verificar</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="flex flex-col space-y-2">
					<div className="flex items-center space-x-2">
						<Checkbox id="nbr10719" className="text-white" checked={selectedNorms.nbr10719} onCheckedChange={() => handleCheckboxChange('nbr10719')} />
						<label htmlFor="nbr10719">NBR 10719</label>
					</div>
					<div className="flex items-center space-x-2">
						<Checkbox id="nbr10520" className="text-white" checked={selectedNorms.nbr10520} onCheckedChange={() => handleCheckboxChange('nbr10520')} />
						<label htmlFor="nbr10520">NBR 10520</label>
					</div>
					<div className="flex items-center space-x-2">
						<Checkbox id="nbr6023" className="text-white" checked={selectedNorms.nbr6023} onCheckedChange={() => handleCheckboxChange('nbr6023')} />
						<label htmlFor="nbr6023">NBR 6023</label>
					</div>
					<div className="flex items-center space-x-2">
						<Checkbox id="nbr6028" className="text-white" checked={selectedNorms.nbr6028} onCheckedChange={() => handleCheckboxChange('nbr6028')} />
						<label htmlFor="nbr6028">NBR 6028</label>
					</div>
				</div>
			</CardContent>
			<CardFooter>
				<Button onClick={handleVerifyNorms} disabled={isChecking} className="text-white">
					{isChecking ? 'Verificando...' : 'Verificar Normas'}
				</Button>
			</CardFooter>
		</Card>
	)
}
