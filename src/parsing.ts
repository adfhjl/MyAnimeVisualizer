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
		anime.my_status = convertToStatusEnum(anime.my_status);
		anime.my_start_date = fixUnknownDate(anime.my_start_date);
		anime.my_finish_date = fixUnknownDate(anime.my_finish_date);
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