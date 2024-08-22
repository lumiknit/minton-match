import { Component, For } from "solid-js";
import {
	CourtGame,
	isCourtGameFF,
	isCourtGameMM,
	MatchResult,
	removePrefix,
} from "./types";

type Props = {
	result: MatchResult;
};

const gameClass = (game: CourtGame) => {
	if (isCourtGameMM(game)) {
		return "pico-color-slate-900 pico-background-azure-100";
	} else if (isCourtGameFF(game)) {
		return "pico-color-slate-900 pico-background-orange-100";
	} else {
		return "pico-color-slate-900 pico-background-jade-100";
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
		</>
	);
};

export default ResultView;
