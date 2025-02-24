import { Chart, Colors, ScatterController, LinearScale, PointElement, Tooltip } from "chart.js";

import dataStageEvaluation from "assets/data/stage_evaluation.txt";
import loadCSV from "src/api/load_csv";

Chart.register(Colors, ScatterController, LinearScale, PointElement, Tooltip);

export default async function renderStageEvaluationChart(range: number, onPointClick: (stage: { x: number; y: number; stageData: string; }) => void): Promise<void> {
  const rawData: [l: number, p: number, s: string][] = await loadCSV(dataStageEvaluation) as [number, number, string][];
  const data: [p: number, s: string][][] = Array.from({ length: 77 }, () => []);
  for (const [l, p, s] of rawData) {
    if (p >= 0 && p <= 1) {
      data[l].push([p, s]);
    }
  }
  let selectedData: [l: number, p: number, s: string][] = [];
  for (let i = 0; i < data.length; i++) {
    if (data[i].length === 0) continue;
    for (let r = 0; r < 1; r += range) {
      const filteredData = data[i].filter(([p]) => p >= r && p < r + range);
      if (filteredData.length > 0) {
        const randomIndex = Math.floor(Math.random() * filteredData.length);
        selectedData.push([i, filteredData[randomIndex][0], filteredData[randomIndex][1]]);
      }
    }
  }

  const chart = new Chart(
    document.getElementById("stage-evaluation-chart") as HTMLCanvasElement,
    {
      type: "scatter",
      data: {
        datasets: [
          {
            data: selectedData.map((row) => ({ x: row[0], y: row[1], stageData: row[2] })),
          }
        ]
      },
      options: {
        aspectRatio: 1.2,
        scales: {
          x: {
            min: 0,
            max: 40,
            title: {
              display: true,
              text: "ステージの最小手数"
            }
          },
          y: {
            min: 0,
            max: 1,
            ticks: {
              stepSize: 0.1
            },
            title: {
              display: true,
              text: "モデルによるクリア率"
            }
          },
        },
        elements: {
          point: {
            radius: 3,
            hoverRadius: 6
          }
        },
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: function (context) {
                return [`ステージの最小手数: ${context.parsed.x}`, `モデルによるクリア率: ${context.parsed.y}`];
              }
            },
            displayColors: false
          }
        },
        clip: false,
        onClick: (_event, elements, _chart) => {
          if (elements.length > 0) {
            const element = elements[0];
            const stage = chart.data.datasets[element.datasetIndex].data[element.index];
            onPointClick(stage);
          }
        }
      }
    });
}
