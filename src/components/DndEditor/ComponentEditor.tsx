import React from "react"
import { EmailComponentData } from "@/types/email-components"

interface ComponentEditorProps {
	component: EmailComponentData
	onUpdate: (id: string, props: Record<string, any>) => void
}

const ComponentEditor: React.FC<ComponentEditorProps> = ({
	component,
	onUpdate,
}) => {
	const handleChange = (key: string, value: any) => {
		onUpdate(component.id, { ...component.props, [key]: value })
	}

	const renderInput = (key: string, value: any) => {
		if (typeof value === "boolean") {
			return (
				<input
					type="checkbox"
					checked={value}
					onChange={(e) => handleChange(key, e.target.checked)}
					className="rounded border-gray-300"
				/>
			)
		}

		if (typeof value === "number") {
			return (
				<input
					type="number"
					value={value}
					onChange={(e) =>
						handleChange(key, parseInt(e.target.value, 10))
					}
					className="w-full px-2 py-1 border rounded"
				/>
			)
		}

		if (typeof value === "string") {
			if (key === "children" && component.type === "markdown") {
				return (
					<textarea
						value={value}
						onChange={(e) => handleChange(key, e.target.value)}
						className="w-full px-2 py-1 border rounded"
						rows={4}
					/>
				)
			}

			return (
				<input
					type="text"
					value={value}
					onChange={(e) => handleChange(key, e.target.value)}
					className="w-full px-2 py-1 border rounded"
				/>
			)
		}

		if (typeof value === "object" && value !== null) {
			return (
				<div className="pl-4 border-l">
					{Object.entries(value).map(([subKey, subValue]) => (
						<div key={subKey} className="mb-2">
							<label className="block text-sm font-medium text-gray-700">
								{subKey}
							</label>
							{renderInput(`${key}.${subKey}`, subValue)}
						</div>
					))}
				</div>
			)
		}

		return null
	}

	return (
		<div className="p-4 bg-white rounded shadow">
			<h3 className="mb-4 text-lg font-medium">
				Edit {component.type} Properties
			</h3>
			<div className="space-y-4">
				{Object.entries(component.props).map(([key, value]) => (
					<div key={key}>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							{key}
						</label>
						{renderInput(key, value)}
					</div>
				))}
			</div>
		</div>
	)
}

export default ComponentEditor
