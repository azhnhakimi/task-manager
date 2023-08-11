export const getTextColorBasedOnBackgroundColor = (backgroundColor) => {
	// Handle CSS variable references (e.g., var(--iris))
	if (backgroundColor.startsWith("var(")) {
		const cssVarName = backgroundColor.slice(4, -1); // Remove "var(" and ")"
		const computedColor = getComputedStyle(document.documentElement)
			.getPropertyValue(cssVarName)
			.trim();
		backgroundColor = computedColor;
	}

	// Convert color to RGB
	const rgb = parseInt(backgroundColor.slice(1), 16);
	const r = (rgb >> 16) & 0xff;
	const g = (rgb >> 8) & 0xff;
	const b = (rgb >> 0) & 0xff;

	// Calculate perceived brightness
	const brightness = (r * 299 + g * 587 + b * 114) / 1000;

	// Return white for dark backgrounds, black for light backgrounds
	return brightness > 128 ? "black" : "white";
};
