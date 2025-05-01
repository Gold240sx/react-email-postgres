import { router } from "./trpc"
import { emailRouter } from "./routers/email"

export const appRouter = router({
	email: emailRouter,
})

export type AppRouter = typeof appRouter
