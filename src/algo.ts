import {
	CourtGame,
	FEMALE_TEAM1_PREFIX,
	FEMALE_TEAM2_PREFIX,
	Game,
	GameSet,
	InputStruct,
	MALE_TEAM1_PREFIX,
	MALE_TEAM2_PREFIX,
	MatchResult,
	newCourtGame,
} from "./types";

const randomInt = (n: number) => Math.floor(Math.random() * n);

const allNonPositive = (m: Map<string, number>) => {
	let done = true;
	m.forEach(v => {
		done &&= v <= 0;
	});
	return done;
};

const initLeftGames = (
	teams: string[][],
	count: number,
): Map<string, number> => {
	const left = new Map<string, number>();
	for (const team of teams) {
		for (const p of team) {
			left.set(p, count);
		}
	}
	return left;
};

const decreaseLeftGame = (left: Map<string, number>, ps: string[]) => {
	for (const p of ps) left.set(p, left.get(p)! - 1);
};

const splitHalf = (team: string[]) => {
	const half = Math.floor(team.length / 2);
	const t1 = team.slice(0, half);
	const t2 = team.slice(half);
	console.log(t1, t2);
	return [t1, t2];
};

/** Pick randomly. If there is left > 0, prefer that */
const randomPick = (mem: string[], left: number[]) => {
	// Filtered
	const filtered = mem.filter((_, i) => left[i] > 0);
	if (filtered.length > 0) {
		return filtered[randomInt(filtered.length)];
	}

	// Random
	return mem[randomInt(mem.length)];
};

export const findFunSameGames = (
	team1: string[],
	team2: string[],
	count: number,
) => {
	// Initialize
	const left = initLeftGames([team1, team2], count);

	// Split teams two half
	const [t11, t12] = splitHalf(team1);
	const [t21, t22] = splitHalf(team2);

	const games: CourtGame[] = [];
	for (;;) {
		if (allNonPositive(left)) break;

		const m11 = randomPick(
			t11,
			t11.map(p => left.get(p)!),
		);
		const m12 = randomPick(
			t12,
			t12.map(p => left.get(p)!),
		);
		const m21 = randomPick(
			t21,
			t21.map(p => left.get(p)!),
		);
		const m22 = randomPick(
			t22,
			t22.map(p => left.get(p)!),
		);

		decreaseLeftGame(left, [m11, m12, m21, m22]);

		games.push(newCourtGame([m11, m12], [m21, m22]));
	}

	return games;
};

/**
 * Based on the games, assign courts.
 * Note that one person can only play one court at a time.
 */
const assignCourts = (games: CourtGame[], numCourts: number): GameSet[] => {
	// First shuffle the games
	const shuffled = games.sort(() => Math.random() - 0.5);

	const gameSets: GameSet[] = [];

	while (shuffled.length > 0) {
		// Pick 'numCourts' games, without duplication of players

		// Clone shuffle
		let shuffledClone = [...shuffled];
		const picked: GameSet = [];
		while (picked.length < numCourts && shuffledClone.length > 0) {
			const game = shuffledClone.pop()!;
			picked.push(game);
			shuffled.splice(shuffled.indexOf(game), 1);

			// Remove games with players already playing
			shuffledClone = shuffledClone.filter(g => {
				for (const p of g.players) {
					if (game.players.has(p)) return false;
				}
				return true;
			});
		}

		// Push to gameSets
		gameSets.push(picked);
	}

	// Sort by length
	gameSets.sort((a, b) => b.length - a.length);

	return gameSets;
};

/**
 * Find two team games
 */
export const findTwoTeamGames = (x: InputStruct): MatchResult => {
	// Convert to unique by teams
	const team1m = x.mPlayers1.map(name => MALE_TEAM1_PREFIX + name);
	const team1f = x.fPlayers1.map(name => FEMALE_TEAM1_PREFIX + name);
	const team2m = x.mPlayers2.map(name => MALE_TEAM2_PREFIX + name);
	const team2f = x.fPlayers2.map(name => FEMALE_TEAM2_PREFIX + name);

	// Member lists
	const males = [...team1m, ...team2m];
	const females = [...team1f, ...team2f];
	const players = [...males, ...females];

	const mmFun = findFunSameGames(team1m, team2m, x.mFunGames);
	const ffFun = findFunSameGames(team1f, team2f, x.fFunGames);

	console.log(mmFun);
	console.log(ffFun);

	// Assign courts.
	// Repeat some times, and pick the best one
	let bestGames: GameSet[] = assignCourts([...mmFun, ...ffFun], x.numCourts);
	for (let i = 0; i < 10; i++) {
		const games = assignCourts([...mmFun, ...ffFun], x.numCourts);
		if (games.length < bestGames.length) {
			bestGames = games;
		}
	}

	return {
		players: [],
		games: bestGames,
	};
};
