import React from 'react';

type LinkProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
	href: string;
};

export default function NextLinkMock({ href, children, ...rest }: LinkProps) {
	return (
		<a href={href} {...rest}>
			{children}
		</a>
	);
}
