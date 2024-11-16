import { Article, scrapeArticleById } from '@/clients/capes/articleScraper'
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'

function replaceUnsupportedCharacters(text: string, font: any): string {
	const supportedText = Array.from(text).map((char) => {
		try {
			font.encodeText(char)
			return char
		} catch {
			return char === 'Ł' ? 'L' : '?'
		}
	})
	return supportedText.join('')
}

export async function createPDFFileFromArticle(article: Article): Promise<{ buffer: Uint8Array; mimeType: string; blob: Blob; fileName: string }> {
	const pdfDoc = await PDFDocument.create()
	const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
	const fontSize = 12
	const pageWidth = 600
	const pageHeight = 800
	const margin = 50
	const lineHeight = fontSize + 4
	let currentPage = pdfDoc.addPage([pageWidth, pageHeight])
	let yPosition = pageHeight - margin

	const content = `
    Article Details:
    ----------------
    ID: ${article.id}
    Title: ${article.title}
    Abstract: ${article.abstract || ''}
    Publication Type: ${article.publicationType || ''}
    Publication Year: ${article.publicationYear || ''}
    Institutions: ${article.institutions.join(', ')}
    Volume: ${article.volume || ''}, Issue: ${article.issue || ''}
    Language: ${article.language || ''}
    DOI: ${article.doi || ''}
    ISSN: ${article.issn || ''}
    Authors: ${article.authors.join(', ')}
    Topics: ${article.topics.join(', ')}
    Open Access: ${article.isOpenAccess ? 'Yes' : 'No'}
    Peer Reviewed: ${article.isPeerReviewed ? 'Yes' : 'No'}
    Citations:
    ${article.citations
		.map(
			(citation, index) => `
    ${index + 1}. ${citation.title || ''} by ${citation.authors.join(', ')}
       (${citation.year || 'N/A'})
       Publisher: ${citation.publisher || ''}
       DOI: ${citation.doi || 'N/A'}
       URL: ${citation.url || 'N/A'}
    `
		)
		.join('\n')}
    `

	const lines = content.split('\n')

	lines.forEach((line) => {
		const sanitizedLine = replaceUnsupportedCharacters(line, font)
		const textWidth = font.widthOfTextAtSize(sanitizedLine, fontSize)

		const maxCharsPerLine = Math.floor((pageWidth - 2 * margin) / (textWidth / sanitizedLine.length))
		const wrappedLines = sanitizedLine.match(new RegExp(`.{1,${maxCharsPerLine}}`, 'g')) || []

		wrappedLines.forEach((wrappedLine) => {
			if (yPosition <= margin) {
				currentPage = pdfDoc.addPage([pageWidth, pageHeight])
				yPosition = pageHeight - margin
			}
			currentPage.drawText(wrappedLine, { x: margin, y: yPosition, font, size: fontSize, color: rgb(0, 0, 0) })
			yPosition -= lineHeight
		})
	})

	const pdfBytes = await pdfDoc.save()
	return {
		buffer: pdfBytes,
		mimeType: 'application/pdf',
		blob: new Blob([pdfBytes], { type: 'application/pdf' }),
		fileName: `${article.id}.pdf`,
	}
}
