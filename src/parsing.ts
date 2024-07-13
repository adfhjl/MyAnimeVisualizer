import { XMLParser } from "fast-xml-parser";
import { readFileSync } from "fs";
import { parsedXML, STATUS } from "./types";

export default function parseFile(path: string): parsedXML {
	const file = readFileSync(path, 'utf-8');
	// console.log(file);

	const parser = new XMLParser();
	const data = parser.parse(file);
	
	// TODO: Add better protection for undefined objects
	if (data === undefined) {
		throw "Could not properly parse file";
	}

	data.myanimelist.anime.forEach((anime: any) => {
		// console.log(anime);
		anime.my_status = convertToStatusEnum(anime.my_status);
		anime.my_start_date = fixUnknownDate(anime.my_start_date);
		anime.my_finish_date = fixUnknownDate(anime.my_finish_date);
		if (anime.my_status === STATUS.Watching && anime.my_finish_date === 0) {
			anime.my_finish_date = new Date().toLocaleDateString(undefined, {
				year: 'numeric',
				month: 'numeric',
				day: 'numeric',
			}).replace('/', '-');
		}
		for (let i = 0; i < anime.series_title.length; ++i) {
			let ch = anime.series_title.charCodeAt(i);
			if (
					!(ch >= 32 && ch <= 126)
			) {
					console.warn(`Warning: '${anime.series_title}' has special character '${anime.series_title.at(i)}', this may not get printed onto the image correctly`);
			}
	}
	});

	return data;
}

function fixUnknownDate(date: string): string | number {
	if (date === '0000-00-00') {
		return 0;
	}
	return date;
}

function convertToStatusEnum(status: string): STATUS {
	if (status === 'Completed') {
		return STATUS.Completed;
	} else if (status === 'Watching') {
		return STATUS.Watching;
	} else if (status === 'Dropped') {
		return STATUS.Dropped;
	} else if (status === 'Plan to Watch') {
		return STATUS.Plan_to_Watch;
	} else if (status === 'On-Hold') {
		return STATUS.On_Hold;
	} else {
		return STATUS.undefined;
	}
}