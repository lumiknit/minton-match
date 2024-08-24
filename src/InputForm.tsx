import { Component, createSignal, onMount } from "solid-js";
import { InputStruct, loadInputStruct, saveInputStruct } from "./types";
import TextArea from "./TextArea";

type Props = {
	onSubmit: (form: InputStruct) => void;
};

const InputForm: Component<Props> = props => {
	const [mPlayers1, setMPlayers1] = createSignal<string[]>([]);
	const [fPlayers1, setFPlayers1] = createSignal<string[]>([]);

	const [mPlayers2, setMPlayers2] = createSignal<string[]>([]);
	const [fPlayers2, setFPlayers2] = createSignal<string[]>([]);

	const [mGames, setMGames] = createSignal<number>(0);
	const [fGames, setFGames] = createSignal<number>(0);

	// Courts
	let numCourtsRef: HTMLInputElement;

	// Male
	let mFunGamesRef: HTMLInputElement | null = null;
	let mHardGamesRef: HTMLInputElement | null = null;

	// Female
	let fFunGamesRef: HTMLInputElement | null = null;
	let fHardGamesRef: HTMLInputElement | null = null;

	// Mixed
	let xGamesRef: HTMLInputElement | null = null;

	const packInput = (): InputStruct => ({
		mPlayers1: mPlayers1(),
		fPlayers1: fPlayers1(),
		mPlayers2: mPlayers2(),
		fPlayers2: fPlayers2(),
		numCourts: parseInt(numCourtsRef!.value),
		mFunGames: parseInt(mFunGamesRef!.value),
		mHardGames: parseInt(mHardGamesRef!.value),
		fFunGames: parseInt(fFunGamesRef!.value),
		fHardGames: parseInt(fHardGamesRef!.value),
		xGames: parseInt(xGamesRef!.value),
	});

	const unpackInput = (x: InputStruct) => {
		setMPlayers1(x.mPlayers1);
		setFPlayers1(x.fPlayers1);
		setMPlayers2(x.mPlayers2);
		setFPlayers2(x.fPlayers2);

		numCourtsRef!.value = x.numCourts.toString();
		mFunGamesRef!.value = x.mFunGames.toString();
		mHardGamesRef!.value = x.mHardGames.toString();
		fFunGamesRef!.value = x.fFunGames.toString();
		fHardGamesRef!.value = x.fHardGames.toString();
		xGamesRef!.value = x.xGames.toString();
	};

	const handleMPlayers1Change = (value: string) => {
		setMPlayers1(
			value
				.split("\n")
				.map(x => x.trim())
				.filter(Boolean),
		);
		saveInputStruct(packInput());
	};

	const handleFPlayers1Change = (value: string) => {
		setFPlayers1(
			value
				.split("\n")
				.map(x => x.trim())
				.filter(Boolean),
		);
		saveInputStruct(packInput());
	};

	const handleMPlayers2Change = (value: string) => {
		setMPlayers2(
			value
				.split("\n")
				.map(x => x.trim())
				.filter(Boolean),
		);
		saveInputStruct(packInput());
	};

	const handleFPlayers2Change = (value: string) => {
		setFPlayers2(
			value
				.split("\n")
				.map(x => x.trim())
				.filter(Boolean),
		);
		saveInputStruct(packInput());
	};

	const handleUpdateGames = () => {
		const mFunGames = parseInt(mFunGamesRef!.value);
		const mHardGames = parseInt(mHardGamesRef!.value);
		const fFunGames = parseInt(fFunGamesRef!.value);
		const fHardGames = parseInt(fHardGamesRef!.value);
		const xFunGames = parseInt(xGamesRef!.value);

		setMGames(mFunGames + mHardGames + xFunGames);
		setFGames(fFunGames + fHardGames + xFunGames);
		saveInputStruct(packInput());
	};

	const handleSubmitClick = () => {
		props.onSubmit(packInput());
	};

	onMount(() => {
		const x = loadInputStruct();
		if (x !== null) {
			unpackInput(x);
		}
		handleUpdateGames();
	});

	return (
		<>
			<h1>민턴 매치</h1>
			<h2> 명단 </h2>
			<p>
				아래 명단에 이름을 <b>실력순으로</b> 작성해주세요! 제일 위에 있는 사람이
				제일 실력이 좋은 사람입니다.
			</p>
			<h3> 팀 1 </h3>
			<div class="half">
				<div>
					<label>
						남자 ({mPlayers1().length} 명)
						<TextArea
							placeholder={"홍길동\n김철수\n이영희"}
							value={mPlayers1().join("\n")}
							onValue={handleMPlayers1Change}
						/>
					</label>
				</div>
				<div>
					<label>
						여자 ({fPlayers1().length} 명)
						<TextArea
							placeholder={"홍길동\n김철수\n이영희"}
							value={fPlayers1().join("\n")}
							onValue={handleFPlayers1Change}
						/>
					</label>
				</div>
			</div>
			<h3> 팀 2 </h3>
			<div class="half">
				<div>
					<label>
						남자 ({mPlayers2().length} 명)
						<TextArea
							placeholder={"홍길동\n김철수\n이영희"}
							value={mPlayers2().join("\n")}
							onValue={handleMPlayers2Change}
						/>
					</label>
				</div>
				<div>
					<label>
						여자 ({fPlayers2().length} 명)
						<TextArea
							placeholder={"홍길동\n김철수\n이영희"}
							value={fPlayers2().join("\n")}
							onValue={handleFPlayers2Change}
						/>
					</label>
				</div>
			</div>
			<h3> 코트 </h3>
			<label>
				코트 수
				<input ref={numCourtsRef!} type="number" value="3" />
			</label>
			<h3> 인당 최소 게임 횟수 </h3>
			<p>
				<b>즐겜</b> = 실력 차이 심한 두 사람을 한 팀으로, &nbsp;
				<b>빡겜</b> = 실력 비슷한 두 사람을 한 팀으로
			</p>
			<div class="half">
				<div>
					남복 즐겜 수
					<input
						ref={mFunGamesRef!}
						type="number"
						value="0"
						onChange={handleUpdateGames}
					/>
				</div>

				<div>
					여복 즐겜 수
					<input
						ref={fFunGamesRef!}
						type="number"
						value="0"
						onChange={handleUpdateGames}
					/>
				</div>
			</div>
			<div class="half">
				<div>
					남복 빡겜 수
					<input
						ref={mHardGamesRef!}
						type="number"
						value="0"
						onChange={handleUpdateGames}
					/>
				</div>

				<div>
					여복 빡겜 수
					<input
						ref={fHardGamesRef!}
						type="number"
						value="0"
						onChange={handleUpdateGames}
					/>
				</div>
			</div>
			<label>
				혼복 즐겜 수
				<input
					ref={xGamesRef!}
					type="number"
					value="0"
					onChange={handleUpdateGames}
				/>
			</label>
			위처럼 설정하면
			<b> 남자 최소 {mGames()} 게임</b>과 <b>여자 최소 {fGames()} 게임</b>이
			생성됩니다.
			<button class="w-100" onClick={handleSubmitClick}>
				만들기!!
			</button>
		</>
	);
};

export default InputForm;
