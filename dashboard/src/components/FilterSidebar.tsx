'use client'

import React from 'react'
import { BookOpen, FileText, Book, Mail } from 'lucide-react'
import { Switch } from '@/components/ui/switch'

const resourceTypes = [
	{ id: 'article', icon: BookOpen, label: 'Artigo', count: 36237 },
	{ id: 'editorial', icon: FileText, label: 'Editorial', count: 136 },
	{ id: 'review', icon: Book, label: 'Revisão', count: 108 },
	{ id: 'letter', icon: Mail, label: 'Carta', count: 24 },
]

export function FilterSidebar() {
	const [filters, setFilters] = React.useState({
		openAccess: false,
		type: {
			article: true,
			review: true,
			book: true,
			letter: true,
		},
	})

	return (
		<div className="space-y-6">
			<div className="bg-white rounded-lg p-4 space-y-4">
				<h3 className="font-semibold">Filtros</h3>
				<div className="space-y-2">
					<div className="flex items-center justify-between">
						<label htmlFor="open-access" className="text-sm">
							Acesso Aberto
						</label>
						<Switch id="open-access" checked={filters.openAccess} onCheckedChange={(checked) => setFilters((prev) => ({ ...prev, openAccess: checked }))} />
					</div>
				</div>
				<div className="space-y-2">
					<h4 className="text-sm font-medium">Tipo de Recurso</h4>
					<div className="space-y-1">
						{resourceTypes.map((item) => (
							<div key={item.id} className="flex items-center gap-2">
								<item.icon className="h-4 w-4 text-muted-foreground" />
								<span className="text-sm">{item.label}</span>
								<span className="text-sm text-muted-foreground ml-auto">{item.count}</span>
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	)
}
