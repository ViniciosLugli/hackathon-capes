'use client'

import React from 'react'
import { motion } from 'framer-motion'

export const BackgroundGradient = ({
	children,
	className = '',
	containerClassName = '',
	animate = true,
}: {
	children: React.ReactNode
	className?: string
	containerClassName?: string
	animate?: boolean
}) => {
	const variants = {
		initial: {
			backgroundPosition: '0 50%',
		},
		animate: {
			backgroundPosition: ['0, 50%', '100% 50%', '0 50%'],
		},
	}
	return (
		<div className={`relative p-[4px] group ${containerClassName}`}>
			<motion.div
				variants={animate ? variants : undefined}
				initial={animate ? 'initial' : undefined}
				animate={animate ? 'animate' : undefined}
				transition={
					animate
						? {
								duration: 5,
								repeat: Infinity,
								repeatType: 'reverse',
						  }
						: undefined
				}
				style={{
					backgroundSize: animate ? '400% 400%' : undefined,
				}}
				className={`absolute inset-0 rounded-3xl opacity-60 group-hover:opacity-100 blur-xl transition duration-500 ${className}`}
			/>
			<motion.div
				variants={animate ? variants : undefined}
				initial={animate ? 'initial' : undefined}
				animate={animate ? 'animate' : undefined}
				transition={
					animate
						? {
								duration: 5,
								repeat: Infinity,
								repeatType: 'reverse',
						  }
						: undefined
				}
				style={{
					backgroundSize: animate ? '400% 400%' : undefined,
				}}
				className={`absolute inset-0 rounded-3xl ${className}`}
			/>

			<div className="relative">{children}</div>
		</div>
	)
}
