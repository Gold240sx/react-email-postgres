import { Tailwind as TailwindImport } from "@react-email/components"
import * as React from "react"

interface TailwindProps {
	children: React.ReactNode
	config?: Record<string, any>
}

const defaultConfig = {
	theme: {
		extend: {
			colors: {
				brand: "#007291",
			},
		},
		fontSize: {
			xs: ["12px", { lineHeight: "16px" }],
			sm: ["14px", { lineHeight: "20px" }],
			base: ["16px", { lineHeight: "24px" }],
			lg: ["18px", { lineHeight: "28px" }],
			xl: ["20px", { lineHeight: "28px" }],
			"2xl": ["24px", { lineHeight: "32px" }],
			"3xl": ["30px", { lineHeight: "36px" }],
			"4xl": ["36px", { lineHeight: "36px" }],
			"5xl": ["48px", { lineHeight: "1" }],
			"6xl": ["60px", { lineHeight: "1" }],
		},
		spacing: {
			px: "1px",
			0: "0",
			0.5: "2px",
			1: "4px",
			1.5: "6px",
			2: "8px",
			2.5: "10px",
			3: "12px",
			3.5: "14px",
			4: "16px",
			5: "20px",
			6: "24px",
			8: "32px",
			10: "40px",
			12: "48px",
			16: "64px",
			20: "80px",
			24: "96px",
			32: "128px",
			40: "160px",
			48: "192px",
			56: "224px",
			64: "256px",
		},
	},
}

const Tailwind: React.FC<TailwindProps> = ({
	children,
	config = defaultConfig,
}) => {
	return <TailwindImport config={config}>{children}</TailwindImport>
}

export default Tailwind
