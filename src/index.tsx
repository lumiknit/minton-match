/* @refresh reload */
import { render } from "solid-js/web";

import "@picocss/pico/css/pico.min.css";
import "@picocss/pico/css/pico.colors.min.css";

import "./index.scss";
import App from "./App";

const root = document.getElementById("root");

render(() => <App />, root!);
