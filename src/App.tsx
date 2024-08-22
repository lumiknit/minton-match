import { createEffect, createSignal, Show } from "solid-js";

import toast, { Toaster } from "solid-toast";

import InputForm from "./InputForm";
import { InputStruct, MatchResult } from "./types";
import { findTwoTeamGames } from "./algo";
import ResultView from "./ResultView";

const App = () => {
	const [submitted, setSubmitted] = createSignal<boolean>(false);

	const [rawResult, setRawResult] = createSignal<any>(null);
	const [result, setResult] = createSignal<MatchResult | null>(null);

	const handleSubmit = (input: InputStruct) => {
		console.log(input);
		setSubmitted(true);

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
			setRawResult(r);
			setResult(result);
		};

		toast.promise(run(), {
			loading: "Generating games...",
			success: "Games generated!",
			error: "Error generating games",
		});
	};

	return (
		<>
			<Toaster />
			<InputForm onSubmit={handleSubmit} />
			<Show when={result()}>
				<ResultView result={result()!} />
			</Show>
			<pre>{rawResult()}</pre>
		</>
	);
};

export default App;
