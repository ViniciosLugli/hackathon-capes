import { AltmetricClient } from '@/clients/doi'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest): Promise<NextResponse> {
	const { searchParams } = new URL(request.url)
	const doi = searchParams.get('doi')

	if (!doi) {
		return NextResponse.json({ error: 'DOI parameter is required' }, { status: 400 })
	}

	const doiClient = new AltmetricClient()
	const infos = await doiClient.getInfoByDOI(doi)

	if (infos) {
		return NextResponse.json(infos)
	} else {
		return NextResponse.json({ error: 'Could not resolve DOI' }, { status: 404 })
	}
}
