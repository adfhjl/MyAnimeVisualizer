import { createWriteStream } from "fs";
import { Bitmap, Context, encodePNGToStream, make, registerFont } from "pureimage";
import { AnimeInfo, MyAnimeListData, STATUS } from "./types"

const BLOCKHEIGHT = 10;
const BLOCKUNITLENGTH = 20;
const BLOCKBORDERWIDTH = 1;

type Item = {
	title: string;
	status: STATUS;
	x: number;
	y: number;
	length: number;
};

export default function createTimelinePNG(data: MyAnimeListData, path: string) {
	const startedAnimes = data.anime.filter((anime) => anime.my_status !== STATUS.undefined && anime.my_status !== STATUS.Plan_to_Watch);
	startedAnimes.sort(sortByWeeks);
	// startedAnimes.splice(0, 2);

	const items = generateItems(startedAnimes);

	const image = drawImage(items);

	encodePNGToStream(image, createWriteStream(path))
	.then(() => {
    console.log(`Successfully created ${path}`);
  })
  .catch((e) => {
    console.error(`Error generating file ${path}: ${e}`);
  });
}

function generateItems(animes: AnimeInfo[]): Item[] {
	const firstWeek = getWeek(animes.at(0)!.my_start_date);
	return animes.reduce((items, anime) => {
		items.push(getItem(items, anime, firstWeek));
		return items;
	}, new Array<Item>());
}

function getItem(items: Array<Item>, anime: AnimeInfo, firstWeek: number): Item {
	// Calculating the length of entry
	const startWeek = getWeek(anime.my_start_date);
	const endWeek = getWeek(anime.my_finish_date) + 1;
	const length = Math.max(endWeek - startWeek, 1);

	// Calculating x pos
	const x = startWeek - firstWeek;

	// Calculating y pos
	const foundY = items.reduce((foundY, item) => {
		if (item.x <= x && item.x + item.length > x) {
			foundY.push(item.y);
		}
		return foundY;
	}, new Array<number>()).sort((a, b) => a - b);
	for (var y = 0; y === foundY.at(y); y++) {}
	
	return {
		title: anime.series_title,
		status: anime.my_status,
		x,
		y,
		length
	}
}

function drawImage(items: Array<Item>): Bitmap {
	const imageWidth = items.reduce((max, current) => Math.max(max, current.x + current.length), 0) * BLOCKUNITLENGTH;
	const imageHeight = items.reduce((max, current) => Math.max(max, current.y), 0) * BLOCKHEIGHT;
	
	const image = make(imageWidth, imageHeight);
	const context = image.getContext('2d');

	context.fillStyle = 'white';
	context.fillRect(0, 0, imageWidth, imageHeight);
	
	items.forEach((item) => {
		context.fillStyle = getColor(item.status);
		drawItem(item, context);
	});

	return image;
}

function drawItem(item: Item, context: Context) {
	const color = context.fillStyle;
	context.fillStyle = 'black';
	context.fillRect(item.x * BLOCKUNITLENGTH, item.y * BLOCKHEIGHT, item.length * BLOCKUNITLENGTH, BLOCKHEIGHT);
	context.fillStyle = color;
	context.fillRect(item.x *BLOCKUNITLENGTH + BLOCKBORDERWIDTH, item.y * BLOCKHEIGHT + BLOCKBORDERWIDTH, item.length * BLOCKUNITLENGTH - BLOCKBORDERWIDTH * 2, BLOCKHEIGHT - BLOCKBORDERWIDTH * 2);
}

function getColor(status: STATUS): string {
	if (status === STATUS.Completed) {
		return 'blue';
	} else if (status === STATUS.Watching) {
		return 'green';
	} else if (status === STATUS.Dropped) {
		return 'red';
	} else if (status === STATUS.Plan_to_Watch) {
		return 'grey';
	} else if (status === STATUS.On_Hold) {
		return 'yellow';
	} else {
		return 'purple';
	}
}

function sortByWeeks(a: AnimeInfo, b: AnimeInfo) {
	const aStart = new Date(a.my_start_date);
	aStart.setDate(aStart.getDate() + (((1 + 7 - aStart.getDay()) % 7) || 7));
	const bStart = new Date(b.my_start_date);
	bStart.setDate(bStart.getDate() + (((1 + 7 - bStart.getDay()) % 7) || 7));
	const aEnd = new Date(a.my_finish_date);
	aEnd.setDate(aEnd.getDate() + (((1 + 7 - aEnd.getDay()) % 7) || 7));
	const bEnd = new Date(b.my_finish_date);
	bEnd.setDate(bEnd.getDate() + (((1 + 7 - bEnd.getDay()) % 7) || 7));
	return (
		aStart.getTime() > bStart.getTime() ? 1 :
		(aStart.getTime() === bStart.getTime() && aEnd.getTime() < bEnd.getTime() ? 1 : 
			(aStart.getTime() === bStart.getTime() && aEnd.getTime() === bEnd.getTime() ? 0 : -1)
		)
	);
}

function getWeek(date: Date): number {
	const mondayBefore = new Date(date);
	mondayBefore.setDate(mondayBefore.getDate() + (((1 + 7 - mondayBefore.getDay()) % 7) || 7) - 7);
	return Math.floor(mondayBefore.getTime() / (1000 * 60 * 60 * 24 * 7));
}