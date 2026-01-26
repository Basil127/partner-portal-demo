import React from 'react';

type ImageProps = React.ImgHTMLAttributes<HTMLImageElement> & {
	src: string;
	alt: string;
};

export default function NextImageMock(props: ImageProps) {
	return <img {...props} />;
}
