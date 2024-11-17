'use client'

import React from 'react'
import { AnimatePresence } from 'framer-motion'
import { HomePage } from '@/components/HomePage'

export default function Home() {
	return (
		<AnimatePresence>
			<HomePage key="home-page" />
		</AnimatePresence>
	)
}
