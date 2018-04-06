function abbreviateNumber(number) {
	var SI_POSTFIXES = ["", "k", "M", "B", "T", "P", "E"];
	var tier = Math.log10(Math.abs(number)) / 3 | 0;
	if (tier == 0) 
		return number.toFixed(1).replace('.0','');
	var postfix = SI_POSTFIXES[tier];
	var scale = Math.pow(10, tier * 3);
	var scaled = number / scale;
	var formatted = scaled.toFixed(1) + '';
	if (/\.0$/.test(formatted))
		formatted = formatted.substr(0, formatted.length - 2);
	return formatted.replace('.0','') + postfix;
}