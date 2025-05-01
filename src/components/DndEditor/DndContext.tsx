import React, { createContext, useContext } from "react"
import { EmailComponentData } from "@/types/email-components"

interface DndEditorContextType {
	components: EmailComponentData[]
	addComponent: (component: EmailComponentData) => void
}

const DndEditorContext = createContext<DndEditorContextType | undefined>(
	undefined
)

export const useDndEditor = () => {
	const context = useContext(DndEditorContext)
	if (!context) {
		throw new Error("useDndEditor must be used within a DndEditorProvider")
	}
	return context
}

export const DndEditorProvider: React.FC<{
	children: React.ReactNode
	components: EmailComponentData[]
	addComponent: (component: EmailComponentData) => void
}> = ({ children, components, addComponent }) => {
	return (
		<DndEditorContext.Provider value={{ components, addComponent }}>
			{children}
		</DndEditorContext.Provider>
	)
}

export default DndEditorContext
