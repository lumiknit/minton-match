import XLSX from "xlsx";

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
	xGames: number;
};

export const saveInputStruct = (x: InputStruct) => {
	// Save to local storage
	localStorage.setItem("input", JSON.stringify(x));
	console.log("Saved input", x);
};

export const loadInputStruct = (): InputStruct | null => {
	const x = localStorage.getItem("input");
	console.log("Loaded input", x);
	if (x === null) {
		return null;
	}
	return JSON.parse(x);
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

// Excel converter

/**
 * Convert a match result to an array of arrays
 *
 * Columns:
 * - Col1: Game index.
 * - Col2-3: Court 0 (Team 1, Team 2)
 * - Col4-5: Court 1 (Team 1, Team 2)
 * - ...
 *
 * Rows:
 * - Row1: Category (Game, Court1, Court2, ...)
 * - Row2: Subcategory (Only for each courts, 0, 1, ...)
 * - Row3, 4: Game1's team1 / team2 (left is team1, right is team2)
 * - Row5, 6: Game2's team1 / team2
 * - ...
 */
const matchResultToAOA = (result: MatchResult): any[][] => {
	// Find court counts and game counts
	const courtCounts = result.games[0].length;
	const gameCounts = result.games.length;

	const category = ["게임"];
	const subcategory = [""];
	for (let i = 0; i < courtCounts; i++) {
		category.push(`코트 ${1 + i}`, "");
		subcategory.push("팀1", "팀2");
	}

	const games = [];
	for (let i = 0; i < gameCounts; i++) {
		const row1: any[] = [1 + i];
		const row2: any[] = [""];
		const game = result.games[i];
		for (const g of game) {
			row1.push(removePrefix(g.team1[0]), removePrefix(g.team2[0]));
			row2.push(removePrefix(g.team1[1]), removePrefix(g.team2[1]));
		}
		games.push(row1, row2);
	}

	return [category, subcategory, ...games];
};

export const matchResultToCSV = (result: MatchResult): string => {
	const aoa = matchResultToAOA(result);
	let csv = "";
	for (const row of aoa) {
		csv += row.join(",") + "\n";
	}
	return csv;
};

export const downloadMatchResultToXLSX = (
	result: MatchResult,
	filename: string,
): void => {
	const ws = XLSX.utils.aoa_to_sheet(matchResultToAOA(result));
	console.log(ws);

	// Set-up workbook
	const workbook = XLSX.utils.book_new();
	XLSX.utils.book_append_sheet(workbook, ws, "Games");

	// Write
	XLSX.writeFile(workbook, filename, { compression: true });
};
