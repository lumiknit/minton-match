import { Component, splitProps } from "solid-js";
import { JSX } from "solid-js";

type Props = JSX.TextareaHTMLAttributes<HTMLTextAreaElement> & {
	onValue?: (value: string) => void;
};

const TextArea: Component<Props> = props => {
	const [otherProps, taProps] = splitProps(props, [
		"onValue",
		"onChange",
		"onInput",
	]);
	let ref: HTMLTextAreaElement;
	let hiddenRef: HTMLTextAreaElement;

	const handleChange: JSX.ChangeEventHandler<
		HTMLTextAreaElement,
		Event
	> = e => {
		otherProps.onValue?.(e.target.value);
	};

	const resize = () => {
		hiddenRef!.value = ref!.value;
		hiddenRef!.style.width = `${ref!.clientWidth}px`;
		ref!.style.height = 24 + hiddenRef!.scrollHeight + "px";
	};

	return (
		<>
			<textarea
				ref={ref!}
				{...taProps}
				onInput={() => resize()}
				onChange={handleChange}
				onKeyDown={resize}
			/>
			<textarea
				ref={hiddenRef!}
				disabled
				style="visibility: hidden; margin: 0; height: 0; padding: 0;"
			/>
		</>
	);
};

export default TextArea;
