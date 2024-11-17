'use client'

import React, { useEffect, useRef, useState, forwardRef, useImperativeHandle, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { editor } from 'monaco-editor'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import CodeComparison from '@/components/ui/code-comparison'
import { Trash2 } from 'lucide-react'

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false })

interface EditorProps {
	onExport: (data: string) => void
	onChange: (content: string) => void
	initialContent?: string
	highlightIssues?: { id: string; lines: number[]; description: string; suggestion: string; priority: 'low' | 'medium' | 'high' }[]
	onRequestAICorrection: (issue: { id: string; lines: number[]; description: string; suggestion: string }, content: string) => Promise<void>
	onRemoveIssue: (issueId: string) => void
}

export interface EditorRef {
	save: () => Promise<string>
	highlightLines: (issues: { id: string; lines: number[]; description: string; suggestion: string; priority: 'low' | 'medium' | 'high' }[]) => void
	getContentWithLineNumbers: () => string
	requestAICorrection: (issue: { id: string; lines: number[]; description: string; suggestion: string }, content: string) => void
}

const STORAGE_KEY = 'scientific-article-editor-content'

const Editor = forwardRef<EditorRef, EditorProps>(({ onExport, onChange, initialContent, highlightIssues, onRequestAICorrection, onRemoveIssue }, ref) => {
	const [content, setContent] = useState(initialContent || '')
	const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null)
	const monacoRef = useRef<any>(null)
	const fileInputRef = useRef<HTMLInputElement>(null)
	const [isExporting, setIsExporting] = useState(false)
	const [showDiffModal, setShowDiffModal] = useState(false)
	const [diffContent, setDiffContent] = useState({ original: '', corrected: '', issueId: '' })
	const decorationsRef = useRef<string[]>([])

	const createDecorations = useCallback((issues: typeof highlightIssues) => {
		if (!editorRef.current || !monacoRef.current || !issues) return []

		return issues.flatMap((issue) =>
			issue.lines.map((line) => ({
				range: new monacoRef.current.Range(line, 1, line, 1),
				options: {
					isWholeLine: true,
					className: `editor-${issue.priority}-issue`,
					marginClassName: `editor-${issue.priority}-margin`,
					hoverMessage: { value: `${issue.description}\n\nSugestão: ${issue.suggestion}` },
				},
			}))
		)
	}, [])

	const updateDecorations = useCallback(
		(issues: typeof highlightIssues) => {
			if (!editorRef.current || !issues) return

			const decorations = createDecorations(issues)
			const newDecorations = editorRef.current.deltaDecorations(decorationsRef.current, decorations)
			decorationsRef.current = newDecorations
		},
		[createDecorations]
	)

	const getAffectedLines = useCallback((content: string, lines: number[]) => {
		const contentLines = content.split('\n')
		return lines.map((lineNumber) => contentLines[lineNumber - 1]).join('\n')
	}, [])

	useImperativeHandle(
		ref,
		() => ({
			save: async () => {
				const currentContent = editorRef.current?.getValue() || ''
				localStorage.setItem(STORAGE_KEY, currentContent)
				return currentContent
			},
			highlightLines: updateDecorations,
			getContentWithLineNumbers: () => {
				const currentContent = editorRef.current?.getValue() || ''
				return currentContent
					.split('\n')
					.map((line, index) => `${index + 1}. ${line}`)
					.join('\n')
			},
			requestAICorrection: async (issue, content) => {
				try {
					const affectedContent = getAffectedLines(content, issue.lines)
					const response = await fetch('/api/correct-issue', {
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify({ content: affectedContent, issue }),
					})

					if (!response.ok) {
						throw new Error('Failed to get AI correction')
					}

					const { correctedContent } = await response.json()
					setDiffContent({ original: affectedContent, corrected: correctedContent, issueId: issue.id })
					setShowDiffModal(true)
				} catch (error) {
					console.error('Error requesting AI correction:', error)
				}
			},
		}),
		[updateDecorations, getAffectedLines]
	)

	useEffect(() => {
		const savedContent = localStorage.getItem(STORAGE_KEY)
		if (savedContent) {
			setContent(savedContent)
		}
	}, [])

	useEffect(() => {
		if (highlightIssues) {
			updateDecorations(highlightIssues)
		} else {
			if (editorRef.current) {
				const newDecorations = editorRef.current.deltaDecorations(decorationsRef.current, [])
				decorationsRef.current = newDecorations
			}
		}
	}, [highlightIssues, updateDecorations])

	const handleEditorDidMount = useCallback(
		(editor: editor.IStandaloneCodeEditor, monaco: any) => {
			editorRef.current = editor
			monacoRef.current = monaco

			editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
				if (ref && 'current' in ref) {
					;(ref as React.MutableRefObject<EditorRef>).current.save()
				}
			})

			const style = document.createElement('style')
			style.textContent = `
      .editor-high-issue { background-color: rgba(255, 0, 0, 0.2); }
      .editor-medium-issue { background-color: rgba(255, 255, 0, 0.2); }
      .editor-low-issue { background-color: rgba(0, 0, 255, 0.2); }
      .editor-high-margin { border-left: 3px solid rgba(255, 0, 0, 0.5); }
      .editor-medium-margin { border-left: 3px solid rgba(255, 255, 0, 0.5); }
      .editor-low-margin { border-left: 3px solid rgba(0, 0, 255, 0.5); }
      .cm-editor .cm-line { white-space: pre-wrap; }
    `
			document.head.appendChild(style)

			return () => {
				style.remove()
			}
		},
		[ref]
	)

	const handleEditorChange = useCallback(
		(value: string | undefined) => {
			if (value !== undefined) {
				setContent(value)
				onChange(value)
				localStorage.setItem(STORAGE_KEY, value)
			}
		},
		[onChange]
	)

	const handleAcceptCorrection = useCallback(() => {
		if (editorRef.current && diffContent.corrected) {
			const currentContent = editorRef.current.getValue()
			const contentLines = currentContent.split('\n')
			const originalLines = diffContent.original.split('\n')
			const correctedLines = diffContent.corrected.split('\n')

			const startLine = contentLines.findIndex((line) => line === originalLines[0])

			if (startLine !== -1) {
				contentLines.splice(startLine, originalLines.length, ...correctedLines)

				const updatedContent = contentLines.join('\n')
				editorRef.current.setValue(updatedContent)
				setContent(updatedContent)
				onChange(updatedContent)
				localStorage.setItem(STORAGE_KEY, updatedContent)
			}

			onRemoveIssue(diffContent.issueId)
			setShowDiffModal(false)
		}
	}, [diffContent, onChange, onRemoveIssue])

	const handleRejectCorrection = useCallback(() => {
		setShowDiffModal(false)
	}, [])

	const handleExport = useCallback(async () => {
		setIsExporting(true)
		try {
			const currentContent = editorRef.current?.getValue() || ''
			const blob = new Blob([currentContent], { type: 'text/plain' })
			const url = URL.createObjectURL(blob)
			const link = document.createElement('a')
			link.href = url
			link.download = 'article.txt'
			document.body.appendChild(link)
			link.click()
			document.body.removeChild(link)
			URL.revokeObjectURL(url)

			onExport(currentContent)
		} catch (error) {
			console.error('Export failed:', error)
			alert('Falha ao exportar o arquivo. Por favor, tente novamente.')
		} finally {
			setIsExporting(false)
		}
	}, [onExport])

	const handleImport = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0]
		if (file) {
			const reader = new FileReader()
			reader.onload = async (e) => {
				const content = e.target?.result
				if (typeof content === 'string') {
					setContent(content)
					if (editorRef.current) {
						editorRef.current.setValue(content)
					}
					localStorage.setItem(STORAGE_KEY, content)
				}
			}
			reader.readAsText(file)
		}
	}, [])

	return (
		<div className="bg-white shadow-md rounded-lg overflow-hidden">
			<h1 className="text-3xl font-bold mb-6 text-center">Editor de Artigos Científicos</h1>
			<div className="h-[calc(100vh-200px)] border border-gray-300 rounded-md">
				<MonacoEditor
					language="markdown"
					theme="vs-light"
					value={content}
					options={{
						minimap: { enabled: false },
						lineNumbers: 'on',
						roundedSelection: false,
						scrollBeyondLastLine: false,
						readOnly: false,
						fontSize: 14,
						wordWrap: 'on',
					}}
					onChange={handleEditorChange}
					onMount={handleEditorDidMount}
				/>
			</div>
			<div className="flex justify-between items-center p-4 bg-gray-50 border-t">
				<div>
					<Input type="file" accept=".txt" onChange={handleImport} ref={fileInputRef} className="hidden" />
					<Button onClick={() => fileInputRef.current?.click()} className="bg-blue-600 text-white hover:bg-blue-700">
						Importar
					</Button>
				</div>
				<div className="space-x-4">
					<Button onClick={handleExport} className="bg-purple-600 text-white hover:bg-purple-700">
						{isExporting ? 'Exportando...' : 'Exportar'}
					</Button>
				</div>
			</div>
			<Dialog open={showDiffModal} onOpenChange={setShowDiffModal}>
				<DialogContent className="max-w-5xl max-h-[80vh] overflow-hidden flex flex-col">
					<DialogHeader>
						<DialogTitle>Correção Sugerida pela IA</DialogTitle>
					</DialogHeader>
					<div className="mt-4 flex-grow overflow-auto">
						<CodeComparison
							beforeCode={diffContent.original}
							afterCode={diffContent.corrected}
							language="markdown"
							filename="article.md"
							lightTheme="github-light"
							darkTheme="github-dark"
						/>
					</div>
					<DialogFooter>
						<Button onClick={handleRejectCorrection} variant="outline">
							Rejeitar
						</Button>
						<Button onClick={handleAcceptCorrection} className="text-white">
							Aceitar
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	)
})

Editor.displayName = 'Editor'

export default Editor
