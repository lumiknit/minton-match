import {
	CourtGame,
	FEMALE_TEAM1_PREFIX,
	FEMALE_TEAM2_PREFIX,
	GameSet,
	InputStruct,
	MALE_TEAM1_PREFIX,
	MALE_TEAM2_PREFIX,
	MatchResult,
	newCourtGame,
	Player,
} from "./types";

// Utilities

/** Split array to half */
const splitHalf = <T>(arr: T[]): [T[], T[]] => {
	const half = Math.floor(arr.length / 2);
	return [arr.slice(0, half), arr.slice(half)];
};

/** Pick a random number */
const randomInt = (n: number) => Math.floor(Math.random() * n);

/** Check all values is positive */
const allNonPositive = <T>(m: Map<T, number>) =>
	Array.from(m.values()).every(v => v <= 0);

/**
 * Pick random member
 * If there is left count, prefers that.
 * If every member has 0 left, pick one from the max count.
 */
const pickRandom = (members: string[], left: Map<string, number>): string => {
	// First, filter out the members with left > 0
	const filtered = members.filter(m => left.get(m)! > 0);
	if (filtered.length > 0) {
		return filtered[randomInt(filtered.length)];
	}

	// If all left is 0, pick one from the max count
	const max = Math.max(...members.map(m => left.get(m)!));
	const maxMembers = members.filter(m => left.get(m)! === max);
	return maxMembers[randomInt(maxMembers.length)];
};

/**
 * Represents a pair of members with their corresponding power.
 */
type Pair = {
	mem1: string;
	mem2: string;
	power: number;
};

/** idx should between 0.0 to 1.0, 0.0 is most powerful */
const calcPower = (m1idx: number, m2idx: number): number => {
	const avg = (m1idx + m2idx) / 2;
	const rand = Math.random() * 0.05 - 0.025;
	return avg + rand;
};

/** Calculate mixed-double power, the second member considered weak */
const calcMixedPower = (m1idx: number, m2idx: number): number => {
	const avg = (m1idx + m2idx * 0.5) / 2;
	const rand = Math.random() * 0.05 - 0.025;
	return avg + rand;
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

/** Find similar power memebers to pairs */
export const generateHardGamePairs = (
	members: string[],
	count: number,
	minPairs: number = 0,
): Pair[] => {
	const left = initLeftGames([members], count);

	const pairs: Pair[] = [];
	// From the most powerful member, match
	for (let i = 0; i < members.length; i++) {
		const l = left.get(members[i])!;
		// Should pick l times
		const picked: string[] = [];
		let first = true;
		let dj, start, end;
		if (i === members.length - 1) {
			dj = -1;
			start = members.length - 2;
			end = -1;
		} else {
			dj = 1;
			start = i + 1;
			end = members.length;
		}
		while (picked.length < l) {
			for (let j = start; j !== end; j += dj) {
				if (picked.length >= l) break;
				if (first && left.get(members[j])! <= 0) continue;
				// Drop in 20% chance
				if (Math.random() < 0.2) continue;
				picked.push(members[j]);
				decreaseLeftGame(left, [members[i], members[j]]);
			}
			first = false;
		}

		// Push to pairs
		for (const p of picked) {
			const m1pw = i / members.length;
			const m2pw = members.indexOf(p) / members.length;
			pairs.push({
				mem1: members[i],
				mem2: p,
				power: calcPower(m1pw, m2pw),
			});
		}
	}

	while (pairs.length < minPairs) {
		const m1 = pickRandom(members, left);
		const m1pw = members.indexOf(m1) / members.length;
		const m2 = pickRandom(members, left);
		const m2pw = members.indexOf(m2) / members.length;

		decreaseLeftGame(left, [m1, m2]);

		pairs.push({
			mem1: m1,
			mem2: m2,
			power: calcPower(m1pw, m2pw),
		});
	}

	return pairs;
};

/**
 * Generate fun game pairs.
 */
export const generateFunGamePairs = (
	members: string[],
	count: number,
	minPairs: number = 0,
): Pair[] => {
	const left = initLeftGames([members], count);

	// Split teams two half
	const [t1, t2] = splitHalf(members);

	const pairs: Pair[] = [];
	for (;;) {
		if (allNonPositive(left) && pairs.length >= minPairs) break;

		const m1 = pickRandom(t1, left);
		const m1pw = members.indexOf(m1) / members.length;
		const m2 = pickRandom(t2, left);
		const m2pw = members.indexOf(m2) / members.length;

		decreaseLeftGame(left, [m1, m2]);

		pairs.push({
			mem1: m1,
			mem2: m2,
			power: calcPower(m1pw, m2pw),
		});
	}

	return pairs;
};

export const findGames = (
	team1: string[],
	team2: string[],
	count: number,
	pairMethod: (members: string[], count: number, minPairs?: number) => Pair[],
) => {
	if (team1.length === 0 || team2.length === 0) return [];

	let pairs1: Pair[];
	let pairs2: Pair[];
	// Create pairs
	if (team1.length < team2.length) {
		pairs2 = pairMethod(team2, count);
		pairs1 = pairMethod(team1, count, pairs2.length);
	} else {
		pairs1 = pairMethod(team1, count);
		pairs2 = pairMethod(team2, count, pairs1.length);
	}

	// Sort by power
	pairs1.sort((a, b) => b.power - a.power);
	pairs2.sort((a, b) => b.power - a.power);

	// Create games
	const games: CourtGame[] = [];
	for (let i = 0; i < pairs1.length; i++) {
		const p1 = pairs1[i];
		const p2 = pairs2[i];
		games.push(newCourtGame([p1.mem1, p1.mem2], [p2.mem1, p2.mem2]));
	}

	return games;
};

/**
 * Generate rand game pairs (mixed doubles)
 */
export const generateRandMixedGamePairs = (
	mMembers: string[],
	fMembers: string[],
	count: number,
	minPairs: number = 0,
): Pair[] => {
	const left = initLeftGames([mMembers, fMembers], count);

	const pairs: Pair[] = [];

	for (;;) {
		if (allNonPositive(left) && pairs.length >= minPairs) break;

		const x1 = pickRandom(mMembers, left);
		const x1pw = mMembers.indexOf(x1) / mMembers.length;
		const x2 = pickRandom(fMembers, left);
		const x2pw = fMembers.indexOf(x2) / fMembers.length;

		decreaseLeftGame(left, [x1, x2]);

		pairs.push({
			mem1: x1,
			mem2: x2,
			power: calcMixedPower(x1pw, x2pw),
		});
	}

	return pairs;
};

/**
 * Find mixed games
 */
export const findMixedGames = (
	m1: string[],
	m2: string[],
	f1: string[],
	f2: string[],
	count: number,
	pairMethod: (
		m: string[],
		f: string[],
		count: number,
		minPairs?: number,
	) => Pair[],
) => {
	if (m1.length === 0 || m2.length === 0 || f1.length === 0 || f2.length === 0) {
		return [];
	}

	let pairs1 = pairMethod(m1, f1, count);
	let pairs2 = pairMethod(m2, f2, count);
	if (pairs1.length < pairs2.length) {
		pairs1 = pairMethod(m1, f1, count, pairs2.length);
	}
	if (pairs2.length < pairs1.length) {
		pairs2 = pairMethod(m2, f2, count, pairs1.length);
	}

	// Sort by power
	pairs1.sort((a, b) => b.power - a.power);
	pairs2.sort((a, b) => b.power - a.power);

	// Create games
	const games: CourtGame[] = [];
	for (let i = 0; i < pairs1.length; i++) {
		const p1 = pairs1[i];
		const p2 = pairs2[i];
		games.push(newCourtGame([p1.mem1, p1.mem2], [p2.mem1, p2.mem2]));
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

const updatePlayers = (
	mPlayers: string[],
	fPlayers: string[],
	games: GameSet[],
) => {
	const playerSet = new Map<string, Player>();
	for (const n of mPlayers) {
		playerSet.set(n, {
			name: n,
			gender: "M",
			games: [],
		});
	}
	for (const n of fPlayers) {
		playerSet.set(n, {
			name: n,
			gender: "F",
			games: [],
		});
	}

	// Update games
	for (let i = 0; i < games.length; i++) {
		const set = games[i];
		for (let j = 0; j < set.length; j++) {
			const court = set[j];
			for (const [p] of court.players.entries()) {
				playerSet.get(p)!.games.push({
					court: i,
					index: j,
				});
			}
		}
	}

	return Array.from(playerSet.values());
};

const genMatchResultsFromGames = (
	mPlayers: string[],
	fPlayers: string[],
	games: CourtGame[],
	courts: number,
): MatchResult => {
	const allGames = () => [...games];

	// Assign courts.
	// Repeat some times, and pick the best one
	let bestGames: GameSet[] = assignCourts(allGames(), courts);
	for (let i = 0; i < 10; i++) {
		const games = assignCourts(allGames(), courts);
		if (games.length < bestGames.length) {
			bestGames = games;
		}
	}

	return {
		players: updatePlayers(mPlayers, fPlayers, bestGames),
		games: bestGames,
	};
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
	const mmFun = findGames(team1m, team2m, x.mFunGames, generateFunGamePairs);
	const ffFun = findGames(team1f, team2f, x.fFunGames, generateFunGamePairs);
	const mmHard = findGames(team1m, team2m, x.mHardGames, generateHardGamePairs);
	const ffHard = findGames(team1f, team2f, x.fHardGames, generateHardGamePairs);
	const xGames = findMixedGames(
		team1m,
		team2m,
		team1f,
		team2f,
		x.xGames,
		generateRandMixedGamePairs,
	);
	console.log(x.xGames, xGames);

	return genMatchResultsFromGames(
		[...team1m, ...team2m],
		[...team1f, ...team2f],
		[...mmFun, ...ffFun, ...mmHard, ...ffHard, ...xGames],
		x.numCourts,
	);
};

export const reassignCourts = (
	result: MatchResult,
	courts: number,
): MatchResult => {
	// Extract players
	const mPlayers = result.players
		.filter(x => x.gender === "M")
		.map(x => x.name);
	const fPlayers = result.players
		.filter(x => x.gender === "F")
		.map(x => x.name);

	// Extract all games
	const allGames: CourtGame[] = [];
	for (const gs of result.games) {
		for (const g of gs) {
			allGames.push(g);
		}
	}

	return genMatchResultsFromGames(mPlayers, fPlayers, allGames, courts);
};
