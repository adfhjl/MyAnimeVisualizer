import parseFile from "./parsing";
import createAbstractGraphPNG from "./createAbstractGraphPNG";
import createTimelinePNG from "./createTimelinePNG";

function main() {
	const input = new Array<string>();

	// If an argument was given to the program
	if (process.argv.length > 2) {
		input.push(...process.argv.slice(2));
	} else {
		input.push('data.xml');
	}

	input.forEach((path) => {
		try {
			var data = parseFile(path).myanimelist;
		} catch (e) {
			console.error(`Error parsing file ${path}: ${e}`);
			return ;
		}

		const index = path.lastIndexOf('.');
		if (index !== -1) {
			path = path.slice(0, index);
		}

		createAbstractGraphPNG(data, path + 'Abstract.png');
		// TODO: Make a way to display data in other length then weeks
		createTimelinePNG(data, path + 'Timeline.png');
	});
}

main();