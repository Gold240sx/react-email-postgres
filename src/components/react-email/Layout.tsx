import Tailwind from "./Tailwind"
import Html from "./HTML"
import * as React from "react"
import Head from "./Head"
import Font from "./Font"

interface LayoutProps {
	children: React.ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
	return (
		<Tailwind>
			<Head>
				<Font
					fontFamily="Roboto"
					fallbackFontFamily="Verdana"
					webFont={{
						url: "https://fonts.gstatic.com/s/roboto/v27/KFOmCnqEu92Fr1Mu4mxKKTU1Kg.woff2",
						format: "woff2",
					}}
					fontWeight={400}
					fontStyle="normal"
				/>
			</Head>
			<Html>{children}</Html>
		</Tailwind>
	)
}

export default Layout
