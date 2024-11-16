import { PrismaClient, ArticleStatus } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
	const topicAI = await prisma.topic.create({
		data: {
			name: 'Artificial Intelligence',
			description: 'Study of intelligent agents and systems.',
		},
	})

	const topicML = await prisma.topic.create({
		data: {
			name: 'Machine Learning',
			description: 'Subset of AI focused on learning from data.',
			parentTopic: { connect: { id: topicAI.id } },
		},
	})

	const fieldAreaCS = await prisma.fieldArea.create({
		data: {
			name: 'Computer Science',
			description: 'Study of computation and information.',
		},
	})

	const keywordDL = await prisma.keyword.create({
		data: {
			name: 'Deep Learning',
		},
	})

	const keywordNN = await prisma.keyword.create({
		data: {
			name: 'Neural Networks',
		},
	})

	const article1 = await prisma.article.create({
		data: {
			title: 'Advancements in Neural Networks',
			abstract: 'An in-depth look into neural network architectures.',
			language: 'English',
			authors: ['Alice Johnson', 'Bob Smith'],
			institutions: ['University of Examples'],
			journalName: 'Journal of AI Research',
			publisherName: 'Science Publishers',
			status: ArticleStatus.PUBLISHED,
			isOpenAccess: true,
			peerReviewed: true,
			topics: { connect: [{ id: topicML.id }] },
			keywords: { connect: [{ id: keywordNN.id }] },
			fieldArea: { connect: [{ id: fieldAreaCS.id }] },
			metrics: {
				create: {
					citations: 25,
					views: 500,
					downloads: 150,
					altmetricScore: 75.5,
				},
			},
		},
	})

	const article2 = await prisma.article.create({
		data: {
			title: 'Exploring Deep Learning Techniques',
			abstract: 'A comprehensive guide to deep learning methods.',
			language: 'English',
			authors: ['Carol Williams'],
			institutions: ['Institute of Technology'],
			journalName: 'International Journal of Computer Science',
			publisherName: 'Tech Publishers',
			status: ArticleStatus.PUBLISHED,
			isOpenAccess: false,
			peerReviewed: true,
			topics: { connect: [{ id: topicML.id }] },
			keywords: { connect: [{ id: keywordDL.id }, { id: keywordNN.id }] },
			fieldArea: { connect: [{ id: fieldAreaCS.id }] },
			metrics: {
				create: {
					citations: 40,
					views: 800,
					downloads: 300,
					altmetricScore: 88.0,
				},
			},
		},
	})

	await prisma.citation.create({
		data: {
			citingArticleId: article2.id,
			citedArticleId: article1.id,
			citationText: 'Referenced for foundational concepts in neural networks.',
		},
	})

	await prisma.metrics.update({
		where: { articleId: article1.id },
		data: { citations: 26 },
	})

	console.log('Database has been seeded. 🌱')
}

main()
	.catch((e) => {
		console.error(`Seeding error: ${e}`)
		process.exit(1)
	})
	.finally(async () => {
		await prisma.$disconnect()
	})
