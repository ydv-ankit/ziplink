interface ConfirmModalProps {
	isOpen: boolean;
	onClose: () => void;
	onConfirm: () => void;
	title?: string;
	message: string;
	confirmText?: string;
	cancelText?: string;
	confirmButtonClass?: string;
}

export default function ConfirmModal({
	isOpen,
	onClose,
	onConfirm,
	title = "Confirm Action",
	message,
	confirmText = "Confirm",
	cancelText = "Cancel",
	confirmButtonClass = "bg-red-600 hover:bg-red-700",
}: ConfirmModalProps) {
	if (!isOpen) return null;

	const handleConfirm = () => {
		onConfirm();
		onClose();
	};

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 bg-opacity-50">
			<div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
				<div className="flex items-start gap-4 mb-6">
					<div className="shrink-0">
						<div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
							<svg
								className="w-6 h-6 text-red-600"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
								/>
							</svg>
						</div>
					</div>
					<div className="flex-1">
						<h3 className="text-xl font-bold text-gray-900 mb-2">
							{title}
						</h3>
						<p className="text-sm text-gray-600">{message}</p>
					</div>
					<button
						onClick={onClose}
						className="text-gray-400 hover:text-gray-600 cursor-pointer transition shrink-0"
						aria-label="Close"
					>
						<svg
							className="w-6 h-6"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M6 18L18 6M6 6l12 12"
							/>
						</svg>
					</button>
				</div>

				<div className="flex gap-3 pt-4">
					<button
						type="button"
						onClick={onClose}
						className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 cursor-pointer transition"
					>
						{cancelText}
					</button>
					<button
						type="button"
						onClick={handleConfirm}
						className={`flex-1 px-4 py-2 ${confirmButtonClass} text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 cursor-pointer transition`}
					>
						{confirmText}
					</button>
				</div>
			</div>
		</div>
	);
}

