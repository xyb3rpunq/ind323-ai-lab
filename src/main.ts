/**
 * Titik masuk aplikasi.
 *
 * .Deckyx
 */

import { mount } from "svelte";
import App from "./App.svelte";
import "./style.css";

const akar = document.getElementById("akar");
if (akar) {
  mount(App, { target: akar });
}
