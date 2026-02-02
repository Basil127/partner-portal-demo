interface BoxProps {
	children: React.ReactNode;
}

export default function WrappingBox(props: BoxProps) {
	return (
		<div className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 dark:bg-gray-700 rounded-md">
			{props.children}
		</div>
	);
}
