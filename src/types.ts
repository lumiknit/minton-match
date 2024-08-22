export const MALE_TEAM1_PREFIX = "M1-";
export const MALE_TEAM2_PREFIX = "M2-";
export const FEMALE_TEAM1_PREFIX = "F1-";
export const FEMALE_TEAM2_PREFIX = "F2-";

export const removePrefix = (name: string) => {
	const splitted = name.split("-");
	return splitted.length > 1 ? splitted.slice(1).join("-") : name;
};

/**
 * The type of the input struct
 */
export type InputStruct = {
	/** Male player count */
	mPlayers1: string[];

	/** Female player count */
	fPlayers1: string[];

	/** Male player count */
	mPlayers2: string[];

	/** Female player count */
	fPlayers2: string[];

	/** Number of court */
	numCourts: number;

	/** Male fun game count */
	mFunGames: number;

	/** Male hard game count */
	mHardGames: number;

	/** Female fun game count */
	fFunGames: number;

	/** Female hard game count */
	fHardGames: number;

	/** Mixed fun game count */
	xFunGames: number;

	/** Mixed hard game count */
	xHardGames: number;
};

export type Game = {
	court: number;
	index: number;
};

export type Player = {
	name: string;
	gender: "M" | "F";
	games: Game[];
};

export type CourtGame = {
	team1: string[];
	team2: string[];
	players: Set<string>;
};

export const isCourtGameMM = (game: CourtGame): boolean => {
	return game.team1.every(p => p.startsWith("M"));
};

export const isCourtGameFF = (game: CourtGame): boolean => {
	return game.team1.every(p => p.startsWith("F"));
};

export const isCourtGameMF = (game: CourtGame): boolean => {
	return (
		game.team1.some(p => p.startsWith("M")) &&
		game.team1.some(p => p.startsWith("F"))
	);
};

export const newCourtGame = (team1: string[], team2: string[]): CourtGame => {
	const players = new Set<string>([...team1, ...team2]);
	return { team1, team2, players };
};

export type GameSet = CourtGame[];

export type MatchResult = {
	players: Player[];
	games: GameSet[];
};
