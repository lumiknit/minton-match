import { Component, For } from "solid-js";
import {
	CourtGame,
	isCourtGameFF,
	isCourtGameMM,
	MatchResult,
	Player,
	removePrefix,
} from "./types";

const MALE_COLOR = "azure";
const FEMALE_COLOR = "orange";
const MIXED_COLOR = "jade";

type Props = {
	result: MatchResult;
};

const genderClass = (g: "M" | "F") => {
	return g === "M"
		? `pico-color-slate-900 pico-background-${MALE_COLOR}-100`
		: `pico-color-slate-900 pico-background-${FEMALE_COLOR}-100`;
};

const gameClass = (game: CourtGame) => {
	if (isCourtGameMM(game)) {
		return `pico-color-slate-900 pico-background-${MALE_COLOR}-100`;
	} else if (isCourtGameFF(game)) {
		return `pico-color-slate-900 pico-background-${FEMALE_COLOR}-100`;
	} else {
		return `pico-color-slate-900 pico-background-${MIXED_COLOR}-100`;
	}
};

const GameCell: Component<{ game: CourtGame }> = props => {
	return (
		<div class={`half game-cell ${gameClass(props.game)}`}>
			<div>
				{removePrefix(props.game.team1[0])}
				<br />
				{removePrefix(props.game.team1[1])}
			</div>
			<div>vs</div>
			<div>
				{removePrefix(props.game.team2[0])}
				<br />
				{removePrefix(props.game.team2[1])}
			</div>
		</div>
	);
};

const PlayerRow: Component<{ player: Player }> = props => {
	const name = () => removePrefix(props.player.name);
	return (
		<tr>
			<td class={"" + genderClass(props.player.gender)}>{name()}</td>
			<td> {props.player.games.length} </td>
			<td>
				{" "}
				{props.player.games.map(x => `${x.court}-${x.index}`).join(", ")}{" "}
			</td>
		</tr>
	);
};

const ResultView: Component<Props> = props => {
	return (
		<>
			<h2> 코트별 </h2>

			<table>
				<thead>
					<tr>
						<th> 게임 </th>
						<For each={props.result.games[0]}>
							{(_, idx) => <th> 코트 {1 + idx()} </th>}
						</For>
					</tr>
				</thead>
				<tbody>
					<For each={props.result.games}>
						{(gs, idx) => (
							<tr>
								<td> {1 + idx()} </td>
								<For each={gs}>
									{g => (
										<td>{g ? <GameCell game={g} /> : <div> No game </div>}</td>
									)}
								</For>
							</tr>
						)}
					</For>
				</tbody>
			</table>

			<h2> 플레이어별 </h2>

			<table>
				<thead>
					<tr>
						<th> 이름 </th>
						<th> 게임수 </th>
						<th> 목록 (코트-게임) </th>
					</tr>
				</thead>
				<tbody>
					<For each={props.result.players}>{p => <PlayerRow player={p} />}</For>
				</tbody>
			</table>
		</>
	);
};

export default ResultView;
