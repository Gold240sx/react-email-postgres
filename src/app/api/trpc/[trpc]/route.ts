import { fetchRequestHandler } from "@trpc/server/adapters/fetch"
import { appRouter } from "@/server"

const handler = async (req: Request) => {
	try {
		return await fetchRequestHandler({
			endpoint: "/api/trpc",
			req,
			router: appRouter,
			createContext: () => ({}),
			onError: ({ error, path }) => {
				console.error(`Error in tRPC handler [${path}]:`, error)
			},
		})
	} catch (error) {
		console.error("Unhandled error in tRPC handler:", error)
		return new Response("Internal Server Error", { status: 500 })
	}
}

export { handler as GET, handler as POST }
