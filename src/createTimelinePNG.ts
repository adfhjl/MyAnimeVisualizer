import { createWriteStream } from "fs";
import { Bitmap, Context, encodePNGToStream, make, registerFont } from "pureimage";
import { MyAnimeListData, STATUS } from "./types"

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
	startedAnimes.sort((a, b) => {
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
	});
	// startedAnimes.splice(0, 2);

	const mondayBeforeFirstAnime = new Date(startedAnimes.at(0)!.my_start_date);
	mondayBeforeFirstAnime.setDate(mondayBeforeFirstAnime.getDate() + (((1 + 7 - mondayBeforeFirstAnime.getDay()) % 7) || 7) - 7);
	const firstWeek = Math.floor(mondayBeforeFirstAnime.getTime() / (1000 * 60 * 60 * 24 * 7));

	let maxY = 0;
	const items = new Array<Item>();
	startedAnimes.forEach((anime) => {
		// Calculating the length of entry
		const startWeek = new Date(anime!.my_start_date);
		startWeek.setDate(startWeek.getDate() + (((1 + 7 - startWeek.getDay()) % 7) || 7) - 7);
		const endWeek = new Date(anime!.my_finish_date);
		endWeek.setDate(endWeek.getDate() + (((1 + 7 - endWeek.getDay()) % 7) || 7));
		const length = Math.max(Math.floor(endWeek.getTime() / (1000 * 60 * 60 * 24 * 7)) - Math.floor(startWeek.getTime() / (1000 * 60 * 60 * 24 * 7)), 1);

		// Calculating x pos
		const x = Math.floor(startWeek.getTime() / (1000 * 60 * 60 * 24 * 7)) - firstWeek;

		// Calculating y pos
		const possibleY = Array.from(Array(maxY + 1).keys());
		items.forEach((item) => {
			if (item.x <= x && item.x + item.length > x) {
				const index = possibleY.indexOf(item.y);
				if (index > -1) {
					possibleY.splice(index, 1);
				}
			}
		});
		var y = possibleY.at(0) || 0;
		if (y === maxY) {
			maxY++;
		}
			
		items.push({
			title: anime!.series_title,
			status: anime!.my_status,
			x,
			y,
			length
		});
	});

	const image = drawImage(items);

	encodePNGToStream(image, createWriteStream(path))
	.then(() => {
    console.log(`Successfully created ${path}`);
  })
  .catch((e) => {
    console.error(`Error generating file ${path}: ${e}`);
  });
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