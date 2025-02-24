import preload from "src/api/preload";
import renderStageEvaluationChart from "src/render_chart";
import renderStageInfo from "src/render_stage_info";
import SokobanGame from "src/sokoban";

import imgPath from "assets/image/path.svg";
import imgWall from "assets/image/wall.svg";
import imgGoal from "assets/image/goal.svg";
import imgPlayer from "assets/image/player.svg";
import imgBox from "assets/image/box.svg";
import imgPlayerOnGoal from "assets/image/player_on_goal.svg";
import imgBoxOnGoal from "assets/image/box_on_goal.svg";

const defaultStageHeight: number = 6;
const defaultStageWidth: number = 6;

let currentInstance: SokobanGame | undefined;
window.document.addEventListener("DOMContentLoaded", () => {
  preload([imgPath, imgWall, imgGoal, imgPlayer, imgBox, imgPlayerOnGoal, imgBoxOnGoal]);
  currentInstance = new SokobanGame(".o....o.x.#...#xxo.|..#......#......", defaultStageWidth, defaultStageHeight);
  renderStageEvaluationChart(0.1, (stage) => {
    if (currentInstance) {
      currentInstance.abortController.abort();
      currentInstance = new SokobanGame(stage.stageData, defaultStageWidth, defaultStageHeight);
      renderStageInfo(stage.x, stage.y);
    }
  });
});
