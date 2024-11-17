import { Article } from '@/types'

export const handlePrint = (article: Article, toast: any) => {
	const printContent = document.createElement('div')
	printContent.innerHTML = `
    <h1>${article.title}</h1>
    <p>${article.authors.join(', ')}</p>
    <p>${article.publicationYear}${article.institutions.length > 0 ? ` - ${article.institutions.join(', ')}` : ''}${article.publisherName ? ` - ${article.publisherName}` : ''}${
		article.journalName ? ` - ${article.journalName}` : ''
	}${article.language ? ` - ${article.language}` : ''}</p>
    <h2>Resumo</h2>
    <p>${article.abstract}</p>
  `

	const printWindow = window.open('', '_blank')
	printWindow.document.write('<html><head><title>Print</title></head><body>')
	printWindow.document.write(printContent.innerHTML)
	printWindow.document.write('</body></html>')
	printWindow.document.close()
	printWindow.print()

	toast({
		title: 'Imprimindo',
		description: 'O artigo está sendo preparado para impressão.',
	})
}

export const handleDownload = async (article: Article, toast: any) => {
	try {
		const response = await fetch(`/api/articles/pdf/${article.id}`)
		if (!response.ok) {
			throw new Error('Failed to download PDF')
		}
		const blob = await response.blob()
		const url = window.URL.createObjectURL(blob)
		const a = document.createElement('a')
		a.style.display = 'none'
		a.href = url
		a.download = `${article.title}.pdf`
		document.body.appendChild(a)
		a.click()
		window.URL.revokeObjectURL(url)
		toast({
			title: 'Download concluído',
			description: 'O PDF do artigo foi baixado com sucesso.',
		})
	} catch (error) {
		console.error('Error downloading PDF:', error)
		toast({
			title: 'Erro no download',
			description: 'Não foi possível baixar o PDF do artigo. Por favor, tente novamente.',
			variant: 'destructive',
		})
	}
}

export const handleShare = async (article: Article, toast: any) => {
	const url = `https://www.periodicos.capes.gov.br/index.php/acervo/buscador.html?task=detalhes&source=&id=${article.id}`
	try {
		await navigator.clipboard.writeText(url)
		toast({
			title: 'Link copiado!',
			description: 'O link do artigo foi copiado para a área de transferência.',
			variant: 'success',
		})
	} catch (err) {
		console.error('Failed to copy: ', err)
		toast({
			title: 'Erro ao copiar',
			description: 'Não foi possível copiar o link. Por favor, tente novamente.',
			variant: 'destructive',
		})
	}
}
