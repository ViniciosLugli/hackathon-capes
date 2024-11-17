'use client'

import React, { useState, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { AlertTriangle, Info, AlertCircle, ChevronDown, ChevronUp, CheckCircle2, Wand2, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface DiffViewerProps {
	results: {
		norm: string
		issues: {
			id: string
			description: string
			suggestion: string
			lines: number[]
			priority: 'low' | 'medium' | 'high'
			category: string
		}[]
	}[]
	onHighlight: (issues: { lines: number[]; description: string; suggestion: string }[]) => void
	onRequestAICorrection: (issue: { id: string; lines: number[]; description: string; suggestion: string }) => void
	onRemoveIssue: (issueId: string) => void
}

const priorityConfig = {
	low: { color: 'bg-blue-100 border-blue-200 text-blue-800', icon: Info },
	medium: { color: 'bg-yellow-100 border-yellow-200 text-yellow-800', icon: AlertTriangle },
	high: { color: 'bg-red-100 border-red-200 text-red-800', icon: AlertCircle },
}

export default function DiffViewer({ results, onHighlight, onRequestAICorrection, onRemoveIssue }: DiffViewerProps) {
	const [selectedIssue, setSelectedIssue] = useState<string | null>(null)
	const [expandedNorms, setExpandedNorms] = useState<string[]>([])

	const flattenedIssues = useMemo(() => results.flatMap((r) => r.issues), [results])

	const handleIssueClick = useCallback((id: string) => {
		setSelectedIssue((prevSelected) => (prevSelected === id ? null : id))
	}, [])

	const toggleNormExpansion = useCallback((norm: string) => {
		setExpandedNorms((prev) => (prev.includes(norm) ? prev.filter((n) => n !== norm) : [...prev, norm]))
	}, [])

	const handleRemoveIssue = useCallback(
		(issueId: string, e: React.MouseEvent) => {
			e.stopPropagation()
			onRemoveIssue(issueId)
		},
		[onRemoveIssue]
	)

	const renderIssue = useCallback(
		(issue: (typeof flattenedIssues)[0]) => {
			const { color, icon: PriorityIcon } = priorityConfig[issue.priority]
			return (
				<motion.div key={issue.id} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
					<div
						className={`p-4 rounded-md mb-3 cursor-pointer border ${color} ${selectedIssue === issue.id ? 'ring-2 ring-offset-2 ring-blue-500' : ''}`}
						onClick={() => handleIssueClick(issue.id)}
					>
						<div className="flex items-start">
							<PriorityIcon className="w-5 h-5 mr-3 mt-1 flex-shrink-0" />
							<div className="flex-grow">
								<div className="flex items-center justify-between mb-2">
									<p className="font-medium">{issue.description}</p>
									<Badge variant="secondary" className="ml-2">
										{issue.category}
									</Badge>
								</div>
								<p className="text-sm mb-2">
									<span className="font-semibold">Sugestão da IA:</span> {issue.suggestion}
								</p>
								<div className="flex items-center text-xs text-gray-500">
									<span className="mr-2">Linhas afetadas: {issue.lines.join(', ')}</span>
									<Badge
										variant="outline"
										className={`${
											issue.priority === 'high' ? 'bg-red-100 text-red-800' : issue.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'
										}`}
									>
										{issue.priority}
									</Badge>
								</div>
							</div>
						</div>
						<div className="mt-2 flex justify-end space-x-2">
							<Button
								size="sm"
								variant="outline"
								onClick={(e) => {
									e.stopPropagation()
									onRequestAICorrection(issue)
								}}
							>
								<Wand2 className="w-4 h-4 mr-2" />
								Corrigir com IA
							</Button>
							<Button size="sm" variant="outline" onClick={(e) => handleRemoveIssue(issue.id, e)}>
								<Trash2 className="w-4 h-4" />
							</Button>
						</div>
					</div>
				</motion.div>
			)
		},
		[handleIssueClick, onRequestAICorrection, selectedIssue, handleRemoveIssue]
	)

	React.useEffect(() => {
		if (selectedIssue !== null) {
			const issue = flattenedIssues.find((i) => i.id === selectedIssue)
			if (issue) {
				onHighlight([issue])
			}
		} else {
			onHighlight([])
		}
	}, [selectedIssue, flattenedIssues, onHighlight])

	return (
		<Card className="w-full">
			<CardHeader>
				<CardTitle className="flex items-center justify-between">
					<span>Resultados da Verificação</span>
					<Badge variant="outline" className="text-sm font-normal">
						Sugestões geradas por IA
					</Badge>
				</CardTitle>
			</CardHeader>
			<CardContent>
				<ScrollArea className="h-[calc(100vh-300px)] pr-4">
					{results.map((result) => (
						<Collapsible key={result.norm} open={expandedNorms.includes(result.norm)} onOpenChange={() => toggleNormExpansion(result.norm)} className="mb-6">
							<CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-gray-100 rounded-t-md hover:bg-gray-200 transition-colors">
								<h3 className="text-lg font-semibold">{result.norm}</h3>
								{expandedNorms.includes(result.norm) ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
							</CollapsibleTrigger>
							<CollapsibleContent>
								<AnimatePresence>{result.issues.map((issue) => renderIssue(issue))}</AnimatePresence>
								{result.issues.length === 0 && (
									<div className="flex items-center justify-center p-4 bg-green-100 text-green-800 rounded-md">
										<CheckCircle2 className="w-5 h-5 mr-2" />
										<span>Nenhum problema encontrado para esta norma.</span>
									</div>
								)}
							</CollapsibleContent>
						</Collapsible>
					))}
				</ScrollArea>
			</CardContent>
		</Card>
	)
}
