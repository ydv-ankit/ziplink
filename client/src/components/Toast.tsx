import { useEffect } from "react";

interface ToastProps {
	message: string;
	isVisible: boolean;
	onClose: () => void;
}

export default function Toast({ message, isVisible, onClose }: ToastProps) {
	useEffect(() => {
		if (isVisible) {
			const timer = setTimeout(() => {
				onClose();
			}, 3000);
			return () => clearTimeout(timer);
		}
	}, [isVisible, onClose]);

	if (!isVisible) return null;

	return (
		<div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-5">
			<div className="bg-gray-900 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3">
				<svg
					className="w-5 h-5 text-green-400"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M5 13l4 4L19 7"
					/>
				</svg>
				<span className="text-sm font-medium">{message}</span>
			</div>
		</div>
	);
}

