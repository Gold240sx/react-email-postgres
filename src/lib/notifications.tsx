import { toast } from "sonner"

export const showSuccessNotification = (message: string) => {
	toast.success(message)
}

export const showErrorNotification = (message: string) => {
	toast.error(message)
}

export const showLoadingNotification = (message: string) => {
	return toast.loading(message)
}
