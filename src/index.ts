import renderStageEvaluationChart from "src/render_chart";
import SokobanGame from "src/sokoban";

const defaultStageHeight: number = 6;
const defaultStageWidth: number = 6;

let currentInstance: SokobanGame | undefined;
document.addEventListener("DOMContentLoaded", () => {
  currentInstance = new SokobanGame(".o....o.x.#...#xxo.|..#......#......", defaultStageWidth, defaultStageHeight);
  renderStageEvaluationChart(0.1);
});
