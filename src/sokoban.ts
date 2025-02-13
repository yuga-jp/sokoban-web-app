import imgPath from "assets/image/path.svg";
import imgWall from "assets/image/wall.svg";
import imgGoal from "assets/image/goal.svg";
import imgPlayer from "assets/image/player.svg";
import imgBox from "assets/image/box.svg";
import imgPlayerOnGoal from "assets/image/player_on_goal.svg";
import imgBoxOnGoal from "assets/image/box_on_goal.svg";

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

  static hasPos(set: Set<Pos>, pos: Pos): boolean {
    for (const e of set) {
      if (e.x === pos.x && e.y === pos.y) return true;
    }
    return false;
  }

  static deletePos(set: Set<Pos>, pos: Pos): void {
    for (const e of set) {
      if (e.x === pos.x && e.y === pos.y) {
        set.delete(e);
        return;
      }
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
      throw new Error("Invalid character");
  }
}

export default class SokobanGame {
  private w: number;
  private h: number;
  private stage: Stage;
  private initialNode: StateNode;
  private watchingNode: StateNode;
  private moveCount: number = 0;
  public abortController: AbortController = new AbortController();

  constructor(stageString: string, stageWidth: number, stageHeight: number) {
    this.w = stageWidth;
    this.h = stageHeight
    this.stage = this.getStage(stageString);
    this.initialNode = this.getStateNode(stageString);
    this.watchingNode = this.initialNode;
    this.render();
    this.updateCounter();

    document.addEventListener("keydown", (event) => this.keyBoardEvent(event), { signal: this.abortController.signal });
  }

  private getStateNode(stageString: string): StateNode {
    let playerPos = undefined;
    const boxPos = new Set<Pos>();

    for (let y = 0; y < this.h; y++) {
      for (let x = 0; x < this.w; x++) {
        const t = charToTile(stageString[y * this.w + x]);

        if (t === Tile.Player) {
          if (playerPos) throw new Error("Multiple player found");
          playerPos = new Pos(x, y);
        } else if (t === Tile.Box) {
          boxPos.add(new Pos(x, y));
        }
        else if (t === Tile.PlayerOnGoal) {
          if (playerPos) throw new Error("Multiple player found");
          playerPos = new Pos(x, y);
        } else if (t === Tile.BoxOnGoal) {
          boxPos.add(new Pos(x, y));
        }
      }
    }

    if (!playerPos) throw new Error("Player not found");
    return new StateNode(boxPos, playerPos, null);
  }

  private getStage(stageString: string): Stage {
    const stage: Stage = Array.from({ length: this.h }, () => Array(this.w).fill(Tile.Path));

    for (let y = 0; y < this.h; y++) {
      for (let x = 0; x < this.w; x++) {
        const t = charToTile(stageString[y * this.w + x]);
        if (t === Tile.Goal || t === Tile.PlayerOnGoal || t === Tile.BoxOnGoal) stage[y][x] = Tile.Goal;
        else if (t === Tile.Wall) stage[y][x] = Tile.Wall;
      }
    }

    return stage;
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

        const img_base = document.createElement("img");
        img_base.setAttribute("src", imgPath);

        tile.appendChild(img_base);

        const img_tile = document.createElement("img");
        switch (stageView[y][x]) {
          case Tile.Wall:
            img_tile.setAttribute("src", imgWall);
            tile.appendChild(img_tile);
            break;
          case Tile.Goal:
            img_tile.setAttribute("src", imgGoal);
            tile.appendChild(img_tile);
            break;
          case Tile.Player:
            img_tile.setAttribute("src", imgPlayer);
            tile.appendChild(img_tile);
            break;
          case Tile.Box:
            img_tile.setAttribute("src", imgBox);
            tile.appendChild(img_tile);
            break;
          case Tile.PlayerOnGoal:
            img_tile.setAttribute("src", imgPlayerOnGoal);
            tile.appendChild(img_tile);
            break;
          case Tile.BoxOnGoal:
            img_tile.setAttribute("src", imgBoxOnGoal);
            tile.appendChild(img_tile);
            break;
        }

        gameContainer.appendChild(tile);
      }
    }
  }

  private keyBoardEvent(event: KeyboardEvent) {
    switch (event.key) {
      case "r":
        this.watchingNode = this.initialNode;
        this.moveCount = 0;
        this.render();
        this.updateCounter();
        break;
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
  }

  private movePlayer(pos: Pos) {
    if (this.canPlayerMove(this.watchingNode, pos)) {
      this.watchingNode = this.getNextNode(this.watchingNode, pos);
      this.moveCount++;
    }
    this.render();
    this.updateCounter();
  }

  private updateCounter() {
    const counterElement = document.getElementById("counter");
    if (counterElement) {
      counterElement.textContent = `Moves: ${this.moveCount}`;
    }
  }

  private isOutOfStage(pos: Pos): boolean {
    return pos.x < 0 || pos.x >= this.w || pos.y < 0 || pos.y >= this.h;
  }

  private isWall(pos: Pos): boolean {
    return this.stage[pos.y][pos.x] === Tile.Wall;
  }

  private canPlayerMove(node: StateNode, direction: Pos): boolean {
    const nextPlayerPos = Pos.add(node.playerPos, direction);
    if (this.isOutOfStage(nextPlayerPos) || this.isWall(nextPlayerPos)) return false;
    if (Pos.hasPos(node.boxPos, nextPlayerPos)) {
      const nextBoxPos = Pos.add(nextPlayerPos, direction);
      if (this.isOutOfStage(nextBoxPos) || this.isWall(nextBoxPos) || Pos.hasPos(node.boxPos, nextBoxPos)) return false;
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
    if (Pos.hasPos(node.boxPos, nextPlayerPos)) {
      Pos.deletePos(nextBoxPos, nextPlayerPos);
      nextBoxPos.add(Pos.add(nextPlayerPos, direction));
    }
    return new StateNode(nextBoxPos, nextPlayerPos, node);
  }
}
