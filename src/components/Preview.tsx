import React from "react"

export const Preview: React.FC = () => {
	return (
		<div className="h-full p-4">
			<div className="w-full h-full p-4 bg-white border rounded">
				<div className="max-w-2xl mx-auto">
					{/* Preview content will be rendered here */}
					<div className="text-center text-gray-500">
						Email preview will appear here
					</div>
				</div>
			</div>
		</div>
	)
}
