import { Component, createSignal, onMount } from "solid-js";
import { InputStruct } from "./types";
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
	let xFunGamesRef: HTMLInputElement | null = null;
	let xHardGamesRef: HTMLInputElement | null = null;

	const handleMPlayers1Change = (value: string) => {
		setMPlayers1(
			value
				.split("\n")
				.map(x => x.trim())
				.filter(Boolean),
		);
	};

	const handleFPlayers1Change = (value: string) => {
		setFPlayers1(
			value
				.split("\n")
				.map(x => x.trim())
				.filter(Boolean),
		);
	};

	const handleMPlayers2Change = (value: string) => {
		setMPlayers2(
			value
				.split("\n")
				.map(x => x.trim())
				.filter(Boolean),
		);
	};

	const handleFPlayers2Change = (value: string) => {
		setFPlayers2(
			value
				.split("\n")
				.map(x => x.trim())
				.filter(Boolean),
		);
	};

	const handleUpdateGames = () => {
		const mFunGames = parseInt(mFunGamesRef!.value);
		const mHardGames = parseInt(mHardGamesRef!.value);
		const fFunGames = parseInt(fFunGamesRef!.value);
		const fHardGames = parseInt(fHardGamesRef!.value);
		const xFunGames = parseInt(xFunGamesRef!.value);
		const xHardGames = parseInt(xHardGamesRef!.value);

		setMGames(mFunGames + mHardGames + xFunGames + xHardGames);
		setFGames(fFunGames + fHardGames + xFunGames + xHardGames);
	};

	const handleSubmitClick = () => {
		const form: InputStruct = {
			mPlayers1: mPlayers1(),
			fPlayers1: fPlayers1(),
			mPlayers2: mPlayers2(),
			fPlayers2: fPlayers2(),
			numCourts: parseInt(numCourtsRef!.value),
			mFunGames: parseInt(mFunGamesRef!.value),
			mHardGames: parseInt(mHardGamesRef!.value),
			fFunGames: parseInt(fFunGamesRef!.value),
			fHardGames: parseInt(fHardGamesRef!.value),
			xFunGames: parseInt(xFunGamesRef!.value),
			xHardGames: parseInt(xHardGamesRef!.value),
		};
		props.onSubmit(form);
	};

	onMount(() => {
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
							onValue={handleMPlayers1Change}
						/>
					</label>
				</div>
				<div>
					<label>
						여자 ({fPlayers1().length} 명)
						<TextArea
							placeholder={"홍길동\n김철수\n이영희"}
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
							onValue={handleMPlayers2Change}
						/>
					</label>
				</div>
				<div>
					<label>
						여자 ({fPlayers2().length} 명)
						<TextArea
							placeholder={"홍길동\n김철수\n이영희"}
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

			<h3> 인당 게임 횟수 </h3>

			<p>
				<b>즐겜</b>: 실력 차이 심한 두 사람을 한 팀으로
			</p>
			<p>
				<b>빡겜</b>: 실력 비슷한 두 사람을 한 팀으로
			</p>

			<div class="half">
				<label>
					남복 즐겜 수
					<input
						ref={mFunGamesRef!}
						type="number"
						value="0"
						onChange={handleUpdateGames}
					/>
				</label>

				<label>
					여복 즐겜 수
					<input
						ref={fFunGamesRef!}
						type="number"
						value="0"
						onChange={handleUpdateGames}
					/>
				</label>
			</div>

			<div class="half">
				<label>
					남복 빡겜 수
					<input
						ref={mHardGamesRef!}
						type="number"
						value="0"
						onChange={handleUpdateGames}
					/>
				</label>

				<label>
					여복 빡겜 수
					<input
						ref={fHardGamesRef!}
						type="number"
						value="0"
						onChange={handleUpdateGames}
					/>
				</label>
			</div>

			<label>
				혼복 즐겜 수
				<input
					ref={xFunGamesRef!}
					type="number"
					value="0"
					onChange={handleUpdateGames}
				/>
			</label>

			<label>
				혼복 빡겜 수
				<input
					ref={xHardGamesRef!}
					type="number"
					value="0"
					onChange={handleUpdateGames}
				/>
			</label>

			<div class="half">
				<label>남자 최소 {mGames()} 게임</label>

				<label>여자 최소 {fGames()} 게임</label>
			</div>

			<button class="w-100" onClick={handleSubmitClick}>
				만들기!!
			</button>
		</>
	);
};

export default InputForm;
