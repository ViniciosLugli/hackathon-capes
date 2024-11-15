'use client'

import React from 'react'
import { AnimatePresence } from 'framer-motion'
import { SearchProvider } from '@/contexts/SearchContext'
import { HomePage } from '@/components/HomePage'
import { SearchPage } from '@/components/SearchPage'

export default function Home() {
	return (
		<SearchProvider>
			<AnimatePresence>
				<HomePage key="home-page" />
				<SearchPage key="search-page" />
			</AnimatePresence>
		</SearchProvider>
	)
}
