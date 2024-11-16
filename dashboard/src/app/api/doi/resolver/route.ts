import { DOIClient } from '@/clients/doi'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest): Promise<NextResponse> {
	const { searchParams } = new URL(request.url)
	const doi = searchParams.get('doi')

	if (!doi) {
		return NextResponse.json({ error: 'DOI parameter is required' }, { status: 400 })
	}

	const doiClient = new DOIClient()
	const resolvedUrl = await doiClient.resolveDOI(doi)

	if (resolvedUrl) {
		return NextResponse.json({ url: resolvedUrl })
	} else {
		return NextResponse.json({ error: 'Could not resolve DOI' }, { status: 404 })
	}
}
