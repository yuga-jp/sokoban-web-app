enum Tile {
  Path,
  Wall,
  Goal,
  Box,
  Player,
  BoxOnGoal,
  PlayerOnGoal
}

type Stage = Tile[][];

class Pos {
  constructor(public x: number, public y: number) { }

  static add(a: Pos, b: Pos): Pos {
    return new Pos(a.x + b.x, a.y + b.y);
  }
}

function hasPos(set: Set<Pos>, pos: Pos): boolean {
  for (const e of set) {
    if (e.x === pos.x && e.y === pos.y) return true;
  }
  return false;
}

function deletePos(set: Set<Pos>, pos: Pos): void {
  for (const e of set) {
    if (e.x === pos.x && e.y === pos.y) {
      set.delete(e);
      return;
    }
  }
}

class StateNode {
  constructor(
    public boxPos: Set<Pos>,
    public playerPos: Pos,
    public backNode: StateNode | null
  ) { }
}

const defaultStageHeight: number = 6;
const defaultStageWidth: number = 6;

function charToTile(c: string): Tile {
  switch (c) {
    case ".":
      return Tile.Path;
    case "#":
      return Tile.Wall;
    case "o":
      return Tile.Goal;
    case "x":
      return Tile.Box;
    case "|":
      return Tile.Player;
    case "^":
      return Tile.BoxOnGoal;
    case "*":
      return Tile.PlayerOnGoal;
    default:
      return Tile.Path;
  }
}

class SokobanGame {
  private stageString: string;
  private h: number = defaultStageHeight;
  private w: number = defaultStageWidth;
  private stage: Stage;
  private watchingNode: StateNode;

  constructor(stageString: string) {
    this.stageString = stageString;
    this.stage = Array.from({ length: this.h }, () => Array(this.w).fill(Tile.Path));

    this.watchingNode = this.getInitialStateNode(stageString);
    this.render();
    this.keyEvent();
    this.playerMoveEvent();
  }

  private getInitialStateNode(stageString: string): StateNode {
    let initialPlayerPos = new Pos(-1, -1);
    const initialBoxPos = new Set<Pos>();

    for (let y = 0; y < this.h; y++) {
      for (let x = 0; x < this.w; x++) {
        const t = charToTile(stageString[y * this.w + x]);
        if (t === Tile.Player) initialPlayerPos = new Pos(x, y);
        else if (t === Tile.Box) initialBoxPos.add(new Pos(x, y));
        else if (t === Tile.PlayerOnGoal) {
          initialPlayerPos = new Pos(x, y);
          this.stage[y][x] = Tile.Goal;
        } else if (t === Tile.BoxOnGoal) {
          initialBoxPos.add(new Pos(x, y));
          this.stage[y][x] = Tile.Goal;
        } else this.stage[y][x] = t;
      }
    }
    return new StateNode(initialBoxPos, initialPlayerPos, null);
  }

  private render() {
    const gameContainer = document.getElementById("game-container");
    if (!gameContainer) return;

    const stageView: Stage = Array.from({ length: this.h }, () => Array(this.w).fill(Tile.Path));
    for (let y = 0; y < this.h; y++) {
      for (let x = 0; x < this.w; x++) {
        stageView[y][x] = this.stage[y][x];
      }
    }
    if (this.stage[this.watchingNode.playerPos.y][this.watchingNode.playerPos.x] === Tile.Goal) {
      stageView[this.watchingNode.playerPos.y][this.watchingNode.playerPos.x] = Tile.PlayerOnGoal;
    } else {
      stageView[this.watchingNode.playerPos.y][this.watchingNode.playerPos.x] = Tile.Player;
    }
    for (const e of this.watchingNode.boxPos) {
      if (this.stage[e.y][e.x] === Tile.Goal) {
        stageView[e.y][e.x] = Tile.BoxOnGoal;
      } else {
        stageView[e.y][e.x] = Tile.Box;
      }
    }

    gameContainer.replaceChildren();
    for (let y = 0; y < this.h; y++) {
      for (let x = 0; x < this.w; x++) {
        const tile = document.createElement("div");
        tile.classList.add("tile");

        const img_path = document.createElement("img");
        img_path.setAttribute("src", "./figure/path.svg");

        tile.appendChild(img_path);

        const img_tile = document.createElement("img");
        switch (stageView[y][x]) {
          case Tile.Wall:
            img_tile.setAttribute("src", "./figure/wall.svg");
            tile.appendChild(img_tile);
            break;
          case Tile.Goal:
            img_tile.setAttribute("src", "./figure/goal.svg");
            tile.appendChild(img_tile);
            break;
          case Tile.Box:
            img_tile.setAttribute("src", "./figure/box.svg");
            tile.appendChild(img_tile);
            break;
          case Tile.Player:
            img_tile.setAttribute("src", "./figure/player.svg");
            tile.appendChild(img_tile);
            break;
          case Tile.BoxOnGoal:
            img_tile.setAttribute("src", "./figure/box_on_goal.svg");
            tile.appendChild(img_tile);
            break;
          case Tile.PlayerOnGoal:
            img_tile.setAttribute("src", "./figure/player_on_goal.svg");
            tile.appendChild(img_tile);
            break;
        }

        gameContainer.appendChild(tile);
      }
    }
  }

  private playerMoveEvent() {
    document.addEventListener("keydown", (event) => {
      switch (event.key) {
        case "ArrowUp":
          this.movePlayer(new Pos(0, -1));
          break;
        case "ArrowDown":
          this.movePlayer(new Pos(0, 1));
          break;
        case "ArrowLeft":
          this.movePlayer(new Pos(-1, 0));
          break;
        case "ArrowRight":
          this.movePlayer(new Pos(1, 0));
          break;
      }
    });
  }

  private keyEvent() {
    document.addEventListener("keydown", (event) => {
      switch (event.key) {
        case "r":
          this.watchingNode = this.getInitialStateNode(this.stageString);
          this.render();
          break;
      }
    })
  }

  private movePlayer(pos: Pos) {
    if (this.canPlayerMove(this.watchingNode, pos)) {
      this.watchingNode = this.getNextNode(this.watchingNode, pos);
      this.render();
    }
  }

  private isOutOfStage(pos: Pos): boolean {
    return pos.x < 0 || pos.x >= defaultStageWidth || pos.y < 0 || pos.y >= defaultStageHeight;
  }

  private isWall(pos: Pos): boolean {
    return this.stage[pos.y][pos.x] === Tile.Wall;
  }

  private canPlayerMove(node: StateNode, direction: Pos): boolean {
    const nextPlayerPos = Pos.add(node.playerPos, direction);
    if (this.isOutOfStage(nextPlayerPos) || this.isWall(nextPlayerPos)) return false;
    if (hasPos(node.boxPos, nextPlayerPos)) {
      const nextBoxPos = Pos.add(nextPlayerPos, direction);
      if (this.isOutOfStage(nextBoxPos) || this.isWall(nextBoxPos) || hasPos(node.boxPos, nextBoxPos)) return false;
    }
    return true;
  }

  private isGameClear(node: StateNode): boolean {
    for (const e of node.boxPos) {
      if (this.stage[e.y][e.x] !== Tile.Goal) {
        return false;
      }
    }
    return true;
  }

  private getNextNode(node: StateNode, direction: Pos): StateNode {
    const nextBoxPos = new Set(node.boxPos);
    const nextPlayerPos = Pos.add(node.playerPos, direction);
    if (hasPos(node.boxPos, nextPlayerPos)) {
      deletePos(nextBoxPos, nextPlayerPos);
      nextBoxPos.add(Pos.add(nextPlayerPos, direction));
    }
    return new StateNode(nextBoxPos, nextPlayerPos, node);
  }
}

let currentInstance: SokobanGame | undefined;
document.addEventListener("DOMContentLoaded", () => {
  currentInstance = new SokobanGame(".o....o.x.#...#xxo.|..#......#......");
});

const buttonList = document.querySelectorAll("[data-stage-id]") as NodeListOf<HTMLButtonElement>;
for (const button of Array.from(buttonList)) {
  button.addEventListener("click", () => {
    currentInstance = undefined;
    const stageId: string = button.dataset.stageId as string;
    switch (stageId) {
      case "1":
        currentInstance = new SokobanGame(".o....o.x.#...#xxo.|..#......#......");
        break;
      case "2":
        currentInstance = new SokobanGame("......................|.............");
        break;
    }
  });
}
