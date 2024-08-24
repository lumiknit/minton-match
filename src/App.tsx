import { createSignal, Show } from "solid-js";

import toast, { Toaster } from "solid-toast";

import InputForm from "./InputForm";
import { InputStruct, MatchResult } from "./types";
import { findTwoTeamGames, reassignCourts } from "./algo";
import ResultView from "./ResultView";
import { TbBrandGithub } from "solid-icons/tb";

const App = () => {
	const [courts, setCourts] = createSignal<number>(0);

	const [result, setResult] = createSignal<MatchResult | null>(null);

	const handleRearrange = () => {
		const r = result();
		if (r) {
			const newR = reassignCourts(r, courts());
			setResult(newR);
			toast.success("코트/시간을 재배치했어요!");
		} else {
			toast.error("먼저 경기를 생성한 다음 재배치를 시도해주세요.");
		}
	};

	const handleSubmit = (input: InputStruct) => {
		console.log(input);
		setCourts(input.numCourts);

		const run = async () => {
			const result = findTwoTeamGames(input);
			console.log("Result", result);
			let r = "";
			result.games.forEach((gs, i) => {
				r += "\n ** Game " + (i + 1) + "\n";
				for (const g of gs) {
					if (g) {
						r += g.team1.join(", ") + " vs " + g.team2.join(", ") + "\n";
					} else {
						r += "No game\n";
					}
				}
			});
			setResult(result);
		};

		toast.promise(run(), {
			loading: "게임을 생성하고 있습니다...",
			success: "배치해봤어요!",
			error: "문제가 발생했어요..",
		});
	};

	return (
		<>
			<Toaster />
			<h1>
				민턴 매치
				<a href="https://github.com/lumiknit/minton-match">
					<TbBrandGithub />
					Github
				</a>
			</h1>
			<InputForm onSubmit={handleSubmit} />
			<Show when={result()}>
				<hr />
				<button class="secondary w-100" onClick={handleRearrange}>
					코트 재배치 (대진은 유지, 코트/시간만 재배치)
				</button>
				<hr />
				<ResultView result={result()!} />
			</Show>
		</>
	);
};

export default App;
