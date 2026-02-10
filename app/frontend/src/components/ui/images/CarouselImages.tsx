import React from 'react';
import { ChevronForward, ChevronBack } from '@/icons';
import { useState, useRef } from 'react';

interface Image {
	url: string;
}

export default function CarouselImages({ images }: { images: Image[] }) {
	const [currentImageIndex, setCurrentImageIndex] = useState(0);
	const scrollContainerRef = useRef<HTMLDivElement>(null);

	const scrollToImage = (index: number) => {
		if (scrollContainerRef.current) {
			const width = scrollContainerRef.current.offsetWidth;
			scrollContainerRef.current.scrollTo({
				left: index * width,
				behavior: 'smooth',
			});
			setCurrentImageIndex(index);
		}
	};

	const nextImage = () => {
		const nextIndex = (currentImageIndex + 1) % images.length;
		scrollToImage(nextIndex);
	};

	const prevImage = () => {
		const prevIndex = (currentImageIndex - 1 + images.length) % images.length;
		scrollToImage(prevIndex);
	};

	const handleScroll = () => {
		if (scrollContainerRef.current) {
			const width = scrollContainerRef.current.offsetWidth;
			const scrollLeft = scrollContainerRef.current.scrollLeft;
			const index = Math.round(scrollLeft / width);
			setCurrentImageIndex(index);
		}
	};

	return (
		<div className="min-w-0">
			<div className="relative group rounded-2xl overflow-hidden aspect-[4/3] shadow-md border border-gray-100 dark:border-gray-700">
				{/* Images Container */}
				<div
					ref={scrollContainerRef}
					onScroll={handleScroll}
					className="flex overflow-x-auto snap-x snap-mandatory h-full scrollbar-none"
					style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
				>
					{images.map((img, index) => (
						<div key={index} className="flex-none w-full h-full relative snap-center">
							<img
								src={img.url}
								alt={`Hotel interior ${index + 1}`}
								className="w-full h-full object-cover"
							/>
						</div>
					))}
				</div>

				{/* Arrows (Visible on hover or mobile) */}
				<button
					onClick={(e) => {
						e.stopPropagation();
						prevImage();
					}}
					className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white flex items-center justify-center opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity hover:bg-white/40 z-10"
				>
					<ChevronBack className="w-6 h-6" />
				</button>
				<button
					onClick={(e) => {
						e.stopPropagation();
						nextImage();
					}}
					className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white flex items-center justify-center opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity hover:bg-white/40 z-10"
				>
					<ChevronForward className="w-6 h-6" />
				</button>

				{/* Dots */}
				<div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-10 pointer-events-none">
					{images.map((_, index) => (
						<button
							key={index}
							onClick={() => scrollToImage(index)}
							className={`w-2 h-2 rounded-full transition-all duration-300 pointer-events-auto ${
								index === currentImageIndex ? 'bg-white w-6' : 'bg-white/50 hover:bg-white/80'
							}`}
						/>
					))}
				</div>
			</div>
		</div>
	);
}
