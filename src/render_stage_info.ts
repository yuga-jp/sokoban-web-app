export default function renderStageInfo(l: number, p: number): void {
  const stageInfoItem = window.document.getElementById("stage-info");
  stageInfoItem.textContent = `現在のステージの最小手数: ${l}, クリア率: ${p}`;
}
