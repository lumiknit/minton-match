import { createEffect, createSignal, Show } from "solid-js";
import InputForm from "./InputForm";
import { InputStruct } from "./types";

const App = () => {
  const [submitted, setSubmitted] = createSignal<boolean>(false);

  const handleSubmit = (input: InputStruct) => {
    console.log(input);
    setSubmitted(true);
  };

  return <>
    <InputForm onSubmit={handleSubmit} />
  </>;
};

export default App;
