import { Component, For } from "solid-js";
import { TbDownload } from "solid-icons/tb";

import {
	CourtGame,
	downloadMatchResultToXLSX,
	isCourtGameFF,
	isCourtGameMM,
	MatchResult,
	matchResultToCSV,
	Player,
	removePrefix,
} from "./types";
import { downloadBlob, stringToUTF16Blob } from "./blob";

const MALE_COLOR = "azure";
const FEMALE_COLOR = "orange";
const MIXED_COLOR = "sand";

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
		<div class={`mult-dense game-cell ${gameClass(props.game)}`}>
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
			<td>{props.player.games.map(x => `${1 + x.court}-${1 + x.index}`).join(", ")}</td>
		</tr>
	);
};

const ResultView: Component<Props> = props => {
	const handleDownloadXLSX = () => {
		const filename = new Date().toISOString().split("T")[0];
		downloadMatchResultToXLSX(props.result, `minton-match-${filename}.xlsx`);
	};

	const handleDownloadCSV = () => {
		const csv = matchResultToCSV(props.result);
		// datestring for filename
		const filename = new Date().toISOString().split("T")[0];
		// Convert to UTF-16LE blob
		const blob = stringToUTF16Blob(csv, "text/csv");
		downloadBlob(blob, `minton-match-${filename}.csv`);
	};

	return (
		<>
			<h1> 배치 결과 </h1>

			<button class="secondary w-100" onClick={handleDownloadXLSX}>
				<TbDownload />
				엑셀파일 (.xlsx) 다운로드
			</button>

			<button class="outline secondary w-100" onClick={handleDownloadCSV}>
				<TbDownload />
				.csv 다운로드
			</button>

			<h2> 코트별 </h2>

			<ul>
				<li> 파랑(남복), 주황(여복), 베이지(혼복) </li>
				<li> 왼쪽이 팀1, 오른쪽이 팀2 입니다. </li>
			</ul>

			<div class="hori-scroll">
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
											<td>
												{g ? <GameCell game={g} /> : <div> No game </div>}
											</td>
										)}
									</For>
								</tr>
							)}
						</For>
					</tbody>
				</table>
			</div>

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
