import { useState, useEffect } from 'react';

// Simplified hook to track viewport width/height
export default function useWindowDimensions() {
	const [windowDimensions, setDimensions] = useState({
		width: typeof window !== 'undefined' ? window.innerWidth : 0,
		height: typeof window !== 'undefined' ? window.innerHeight : 0,
	});

	useEffect(() => {
		function handleResize() {
			setDimensions({ width: window.innerWidth, height: window.innerHeight });
		}
		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
	}, []);

	return windowDimensions;
}
