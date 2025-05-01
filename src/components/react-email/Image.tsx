import { Img } from "@react-email/components"
import * as React from "react"

interface ImageProps {
	src: string
	alt?: string
	width?: number | string
	height?: number | string
	className?: string
	style?: React.CSSProperties
}

const defaultStyle: React.CSSProperties = {
	display: "block",
	outline: "none",
	border: "none",
	textDecoration: "none",
}

const Image: React.FC<ImageProps> = ({
	src,
	alt,
	width,
	height,
	className,
	style = defaultStyle,
}) => {
	return (
		<Img
			src={src}
			alt={alt}
			width={width}
			height={height}
			className={className}
			style={style}
		/>
	)
}

export default Image
