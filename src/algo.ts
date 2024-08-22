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
} from "./types";

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
		while (picked.length < l) {
			for (let j = i + 1; j < members.length; j++) {
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
		const m1 = randomPick(
			members,
			members.map(p => left.get(p)!),
		);
		const m1pw = members.indexOf(m1) / members.length;
		const m2 = randomPick(
			members,
			members.map(p => left.get(p)!),
		);
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

/** Match senior and junior */
export const generateFunGamePairs = (
	members: string[],
	count: number,
	minPairs: number = 0,
): Pair[] => {
	const left = initLeftGames([members], count);

	// Split teams two half
	const half = Math.floor(members.length / 2);
	const [t1, t2] = [members.slice(0, half), members.slice(half)];

	const pairs: Pair[] = [];
	for (;;) {
		if (allNonPositive(left) && pairs.length >= minPairs) break;

		const m1 = randomPick(
			t1,
			t1.map(p => left.get(p)!),
		);
		const m1pw = members.indexOf(m1) / members.length;
		const m2 = randomPick(
			t2,
			t2.map(p => left.get(p)!),
		);
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

	console.log(pairs1, pairs2);

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

	const allGames = [...mmFun, ...ffFun, ...mmHard, ...ffHard];

	// Assign courts.
	// Repeat some times, and pick the best one
	let bestGames: GameSet[] = assignCourts(
		[...mmFun, ...ffFun, ...mmHard, ...ffHard],
		x.numCourts,
	);
	for (let i = 0; i < 10; i++) {
		const games = assignCourts(
			[...mmFun, ...ffFun, ...mmHard, ...ffHard],
			x.numCourts,
		);
		if (games.length < bestGames.length) {
			bestGames = games;
		}
	}

	return {
		players: [],
		games: bestGames,
	};
};
