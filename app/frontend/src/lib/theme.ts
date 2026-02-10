export const COLORS = {
	light: {
		primary: '#455EAB',
		primaryAccent: '#003E7E',
		secondary: '#CAA46B',
		secondaryAccent: '#F26722',
		background: '#FFFFFF',
	},
	dark: {
		primary: '#5C7ACC',
		primaryAccent: '#7A9CF0',
		secondary: '#D8BD92',
		secondaryAccent: '#FF8C5A',
		background: '#101828',
	},
};

export const getColor = (name: keyof typeof COLORS.light, isDark = false) => {
	return isDark ? COLORS.dark[name] : COLORS.light[name];
};
