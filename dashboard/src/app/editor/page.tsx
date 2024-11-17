'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import Editor, { EditorRef } from '@/components/Editor'
import NormChecker from '@/components/NormChecker'
import DiffViewer from '@/components/DiffViewer'
import RecommendedArticles from '@/components/RecommendedArticles'
import { useToast } from '@/hooks/use-toast'

const STORAGE_KEY = 'scientific-article-editor-content'

export default function Home() {
	const [content, setContent] = useState('')
	const [checkResults, setCheckResults] = useState(null)
	const [highlightIssues, setHighlightIssues] = useState([])
	const [recommendedArticles, setRecommendedArticles] = useState([])
	const editorRef = useRef<EditorRef>(null)
	const { toast } = useToast()

	useEffect(() => {
		const savedContent = localStorage.getItem(STORAGE_KEY)
		if (savedContent) {
			setContent(savedContent)
		}
	}, [])

	const handleContentChange = useCallback((newContent: string) => {
		setContent(newContent)
		localStorage.setItem(STORAGE_KEY, newContent)
	}, [])

	const handleExport = useCallback((data: string) => {
		setContent(data)
	}, [])

	const handleCheck = useCallback((results: any) => {
		setCheckResults(results)
	}, [])

	const handleHighlight = useCallback((issues) => {
		setHighlightIssues(issues)
	}, [])

	const handleRequestAICorrection = useCallback(
		async (issue: { id: string; lines: number[]; description: string; suggestion: string }, content: string) => {
			if (editorRef.current) {
				await editorRef.current.requestAICorrection(issue, content)
			}
		},
		[editorRef]
	)

	const handleRemoveIssue = useCallback((issueId: string) => {
		setCheckResults((prevResults) =>
			prevResults.map((result) => ({
				...result,
				issues: result.issues.filter((issue) => issue.id !== issueId),
			}))
		)
	}, [])

	const handleAddReference = useCallback((reference: string) => {
		if (editorRef.current) {
			editorRef.current.addReference(reference)
		}
	}, [])

	return (
		<main className="container mx-auto py-6 px-4">
			<div className="flex flex-col lg:flex-row gap-6">
				<div className="lg:w-1/4">
					<RecommendedArticles initialArticles={recommendedArticles} currentContent={content} onAddReference={handleAddReference} />
				</div>
				<div className="lg:w-1/2">
					<Editor
						ref={editorRef}
						onExport={handleExport}
						onChange={handleContentChange}
						initialContent={content}
						highlightIssues={highlightIssues}
						onRequestAICorrection={handleRequestAICorrection}
						onRemoveIssue={handleRemoveIssue}
					/>
				</div>
				<div className="lg:w-1/4 space-y-6">
					<NormChecker content={content} onCheck={handleCheck} editorRef={editorRef} />
					{checkResults && (
						<DiffViewer
							results={checkResults}
							onHighlight={handleHighlight}
							onRequestAICorrection={(issue) => handleRequestAICorrection(issue, content)}
							onRemoveIssue={handleRemoveIssue}
						/>
					)}
				</div>
			</div>
		</main>
	)
}
