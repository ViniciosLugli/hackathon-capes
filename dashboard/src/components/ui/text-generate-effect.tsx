'use client'

import { useEffect } from 'react'
import { motion, useAnimation } from 'framer-motion'

export const TextGenerateEffect = ({ children, className = '' }: { children: string; className?: string }) => {
	const controls = useAnimation()

	useEffect(() => {
		controls.start({
			opacity: 1,
			transition: {
				staggerChildren: 0.05,
			},
		})
	}, [controls])

	return (
		<motion.div className={className} initial={{ opacity: 0 }} animate={controls}>
			{children.split('').map((char, index) => (
				<motion.span key={index} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
					{char}
				</motion.span>
			))}
		</motion.div>
	)
}
