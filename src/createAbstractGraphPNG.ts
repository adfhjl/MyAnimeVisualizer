import { Bitmap, encodePNGToStream, make } from "pureimage";
import { createWriteStream } from "fs";
import { AnimeInfo, MyAnimeListData, STATUS } from "./types";

export default function createAbstractGraphPNG(data: MyAnimeListData, path: string) {
	const startedAnimes = data.anime.filter((anime) => new Date(anime.my_start_date).getTime() !== new Date(0).getTime());
	
	startedAnimes.sort((a, b) => new Date(a.my_start_date).getTime() - new Date(b.my_start_date).getTime());
	// startedAnimes.splice(0, 2);
	// console.log('Earliest:', startedAnimes.at(0)!.my_start_date);
	// console.log('Latest:', startedAnimes.at(-1)!.my_start_date);



	const imageHeight = startedAnimes.length;

	
	
	const nextMonday = new Date();
	nextMonday.setDate(nextMonday.getDate() + (((1 + 7 - nextMonday.getDay()) % 7) || 7));
	// console.log('Next Sunday is', nextMonday);

	const maxWeek = Math.floor(nextMonday.getTime() / (1000 * 60 * 60 * 24 * 7));
	// console.log('Amount of weeks total:', maxWeek);
	
	const mondayBeforeFirstAnime = new Date(startedAnimes.at(0)!.my_start_date);
	mondayBeforeFirstAnime.setDate(mondayBeforeFirstAnime.getDate() + (((1 + 7 - mondayBeforeFirstAnime.getDay()) % 7) || 7) - 7);
	
	const minWeek = Math.floor(mondayBeforeFirstAnime.getTime() / (1000 * 60 * 60 * 24 * 7));
	// console.log('Weeknumber of first anime:', minWeek);

	const imageWidth = maxWeek - minWeek;
	// console.log(imageWidth, imageHeight);

	// const imageWidth = data.anime
	// 	.filter((anime) => new Date(anime.my_start_date).getTime() !== new Date('0').getTime())
	// 	.at(0)!.my_start_date;

	const image = make(imageWidth, imageHeight);
	drawImage(image, startedAnimes, minWeek);

	encodePNGToStream(image, createWriteStream(path))
	.then(() => {
    console.log(`Successfully created ${path}`);
  })
  .catch((e) => {
    console.error(`Error generating file ${path}: ${e}`);
  });
}

function drawImage(image: Bitmap, animes: AnimeInfo[], minWeek: number) {
	const context = image.getContext('2d');
	animes.forEach((anime, index) => {
		const mondayBeforeAnime = new Date(anime.my_start_date);
		mondayBeforeAnime.setDate(mondayBeforeAnime.getDate() + (((1 + 7 - mondayBeforeAnime.getDay()) % 7) || 7) - 7);
		
		const week = Math.floor(mondayBeforeAnime.getTime() / (1000 * 60 * 60 * 24 * 7));
		const startX = week - minWeek;
		// console.log('Weeknumber of anime:', week);
		
		
		const mondayAfterAnimeEnd = new Date(new Date(anime.my_finish_date).getTime() === new Date(0).getTime() ? (anime.my_status !== STATUS.Dropped && anime.my_status !== STATUS.On_Hold ? new Date() : anime.my_start_date) : anime.my_finish_date);
		mondayAfterAnimeEnd.setDate(mondayAfterAnimeEnd.getDate() + (((1 + 7 - mondayAfterAnimeEnd.getDay()) % 7) || 7));
		
		const endWeek = Math.floor(mondayAfterAnimeEnd.getTime() / (1000 * 60 * 60 * 24 * 7));
		
		context.fillStyle = getColor(anime.my_status);
		// if (anime.my_score === 10) {
		// 	context.fillStyle = 'purple';
		// 	console.log('Found', anime.series_title);
		// 	console.log(`x: ${startX}, xWidth: ${endWeek - minWeek - startX}`);
		// }
		// console.log(`(${index}) Drawing ${anime.series_title}`);
		context.fillRect(startX, index, endWeek - minWeek - startX, 1);
	})
	// context.fillRect(0, 0, 100, 100);
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