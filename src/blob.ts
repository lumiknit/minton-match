export const stringToUTF16Blob = (str: string, type: string): Blob => {
	const buf = new ArrayBuffer(2 + str.length * 2); // 2 bytes for each char
	const bufView = new Uint16Array(buf);
	bufView[0] = 0xfeff; // Byte Order Mark
	for (let i = 0, strLen = str.length; i < strLen; i++) {
		if (str.charCodeAt(i) > 0xffff) {
			throw new Error("Invalid character");
		}
		bufView[1 + i] = str.charCodeAt(i);
	}
	return new Blob([buf], { type: type + ";charset=utf-16le" });
};

export const downloadBlob = (blob: Blob, filename: string) => {
	const element = document.createElement("a");
	element.href = URL.createObjectURL(blob);
	element.download = filename;
	document.body.appendChild(element);
	element.click();
	document.body.removeChild(element);
};
