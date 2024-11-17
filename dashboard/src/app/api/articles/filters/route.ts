import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
	try {
		const topics = await prisma.topic.findMany({
			select: {
				name: true,
			},
		})

		const languages = await prisma.article.findMany({
			select: {
				language: true,
			},
			distinct: ['language'],
		})

		const publicationTypes = await prisma.article.findMany({
			select: {
				publicationType: true,
			},
			distinct: ['publicationType'],
		})

		const statuses = await prisma.article.findMany({
			select: {
				status: true,
			},
			distinct: ['status'],
		})

		const journalNames = await prisma.article.findMany({
			select: {
				journalName: true,
			},
			distinct: ['journalName'],
		})

		const filterOptions = {
			topics: topics.map((t) => t.name),
			languages: languages.map((l) => l.language),
			publicationTypes: publicationTypes.map((pt) => pt.publicationType),
			statuses: statuses.map((s) => s.status),
			journalNames: journalNames.map((j) => j.journalName),
		}

		return NextResponse.json(filterOptions)
	} catch (error) {
		console.error('Error fetching filter options:', error)
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
	}
}
