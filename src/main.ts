import parseFile from "./parsing";
import createAbstractGraphPNG from "./createAbstractGraphPNG";

function main() {
	const data = parseFile('data.xml').myanimelist;

	createAbstractGraphPNG(data, 'out.png');
}

main();