export type MyInfo = {
	user_id: number;
	user_name: string;
	user_export_type: number;
	user_total_anime: number;
	user_total_watching: number;
	user_total_completed: number;
	user_total_onhold: number;
	user_total_dropped: number;
	user_total_plantowatch: number;
}

export type AnimeInfo = {
	series_animedb_id: number;
	series_title: string;
	series_type: string;
	series_episodes: number;
	my_id: number;
	my_watched_episodes: number;
	my_start_date: Date;
	my_finish_date: Date;
	my_rated: string;
	my_score: number;
	my_storage: string;
	my_storage_value: number;
	my_status: STATUS;
	my_comments: string;
	my_times_watched: number;
	my_rewatch_value: string;
	my_priority: string;
	my_tags: string;
	my_rewatching: number;
	my_rewatching_ep: number;
	my_discuss: number;
	my_sns: string;
	update_on_import: number;
}

export type MyAnimeListData = {
	myinfo: MyInfo;
	anime: AnimeInfo[];
}

export type parsedXML = {
	'?xml': string;
	myanimelist: MyAnimeListData;
}

export enum STATUS {
	Completed = 'Completed',
	Watching = 'Watching',
	Dropped = 'Dropped',
	Plan_to_Watch = 'Plan to Watch',
	On_Hold = 'On-Hold',
	undefined = 'undefined',
}