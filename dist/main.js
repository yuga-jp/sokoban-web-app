"use strict";
var Tile;
(function (Tile) {
    Tile[Tile["Path"] = 0] = "Path";
    Tile[Tile["Wall"] = 1] = "Wall";
    Tile[Tile["Goal"] = 2] = "Goal";
    Tile[Tile["Box"] = 3] = "Box";
    Tile[Tile["Player"] = 4] = "Player";
    Tile[Tile["BoxOnGoal"] = 5] = "BoxOnGoal";
    Tile[Tile["PlayerOnGoal"] = 6] = "PlayerOnGoal";
})(Tile || (Tile = {}));
class Pos {
    x;
    y;
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    static add(a, b) {
        return new Pos(a.x + b.x, a.y + b.y);
    }
}
function hasPos(set, pos) {
    for (const e of set) {
        if (e.x === pos.x && e.y === pos.y)
            return true;
    }
    return false;
}
function deletePos(set, pos) {
    for (const e of set) {
        if (e.x === pos.x && e.y === pos.y) {
            set.delete(e);
            return;
        }
    }
}
class StateNode {
    boxPos;
    playerPos;
    backNode;
    constructor(boxPos, playerPos, backNode) {
        this.boxPos = boxPos;
        this.playerPos = playerPos;
        this.backNode = backNode;
    }
}
const defaultStageHeight = 6;
const defaultStageWidth = 6;
function charToTile(c) {
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
    stageString;
    h = defaultStageHeight;
    w = defaultStageWidth;
    stage;
    watchingNode;
    constructor(stageString) {
        this.stageString = stageString;
        this.stage = Array.from({ length: this.h }, () => Array(this.w).fill(Tile.Path));
        this.watchingNode = this.getInitialStateNode(stageString);
        this.render();
        this.keyEvent();
        this.playerMoveEvent();
    }
    getInitialStateNode(stageString) {
        let initialPlayerPos = new Pos(-1, -1);
        const initialBoxPos = new Set();
        for (let y = 0; y < this.h; y++) {
            for (let x = 0; x < this.w; x++) {
                const t = charToTile(stageString[y * this.w + x]);
                if (t === Tile.Player)
                    initialPlayerPos = new Pos(x, y);
                else if (t === Tile.Box)
                    initialBoxPos.add(new Pos(x, y));
                else if (t === Tile.PlayerOnGoal) {
                    initialPlayerPos = new Pos(x, y);
                    this.stage[y][x] = Tile.Goal;
                }
                else if (t === Tile.BoxOnGoal) {
                    initialBoxPos.add(new Pos(x, y));
                    this.stage[y][x] = Tile.Goal;
                }
                else
                    this.stage[y][x] = t;
            }
        }
        return new StateNode(initialBoxPos, initialPlayerPos, null);
    }
    render() {
        const gameContainer = document.getElementById("game-container");
        if (!gameContainer)
            return;
        const stageView = Array.from({ length: this.h }, () => Array(this.w).fill(Tile.Path));
        for (let y = 0; y < this.h; y++) {
            for (let x = 0; x < this.w; x++) {
                stageView[y][x] = this.stage[y][x];
            }
        }
        if (this.stage[this.watchingNode.playerPos.y][this.watchingNode.playerPos.x] === Tile.Goal) {
            stageView[this.watchingNode.playerPos.y][this.watchingNode.playerPos.x] = Tile.PlayerOnGoal;
        }
        else {
            stageView[this.watchingNode.playerPos.y][this.watchingNode.playerPos.x] = Tile.Player;
        }
        for (const e of this.watchingNode.boxPos) {
            if (this.stage[e.y][e.x] === Tile.Goal) {
                stageView[e.y][e.x] = Tile.BoxOnGoal;
            }
            else {
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
    playerMoveEvent() {
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
    keyEvent() {
        document.addEventListener("keydown", (event) => {
            switch (event.key) {
                case "r":
                    this.watchingNode = this.getInitialStateNode(this.stageString);
                    this.render();
                    break;
            }
        });
    }
    movePlayer(pos) {
        if (this.canPlayerMove(this.watchingNode, pos)) {
            this.watchingNode = this.getNextNode(this.watchingNode, pos);
        }
        this.render();
    }
    isOutOfStage(pos) {
        return pos.x < 0 || pos.x >= defaultStageWidth || pos.y < 0 || pos.y >= defaultStageHeight;
    }
    isWall(pos) {
        return this.stage[pos.y][pos.x] === Tile.Wall;
    }
    canPlayerMove(node, direction) {
        const nextPlayerPos = Pos.add(node.playerPos, direction);
        if (this.isOutOfStage(nextPlayerPos) || this.isWall(nextPlayerPos))
            return false;
        if (hasPos(node.boxPos, nextPlayerPos)) {
            const nextBoxPos = Pos.add(nextPlayerPos, direction);
            if (this.isOutOfStage(nextBoxPos) || this.isWall(nextBoxPos) || hasPos(node.boxPos, nextBoxPos))
                return false;
        }
        return true;
    }
    isGameClear(node) {
        for (const e of node.boxPos) {
            if (this.stage[e.y][e.x] !== Tile.Goal) {
                return false;
            }
        }
        return true;
    }
    getNextNode(node, direction) {
        const nextBoxPos = new Set(node.boxPos);
        const nextPlayerPos = Pos.add(node.playerPos, direction);
        if (hasPos(node.boxPos, nextPlayerPos)) {
            deletePos(nextBoxPos, nextPlayerPos);
            nextBoxPos.add(Pos.add(nextPlayerPos, direction));
        }
        return new StateNode(nextBoxPos, nextPlayerPos, node);
    }
}
function preloadImage(url) {
    const img = new Image();
    img.src = url;
}
let currentInstance;
document.addEventListener("DOMContentLoaded", () => {
    currentInstance = new SokobanGame(".o....o.x.#...#xxo.|..#......#......");
    preloadImage("./figure/box_on_goal.svg");
    preloadImage("./figure/player_on_goal.svg");
});
const buttonList = document.querySelectorAll("[data-stage-id]");
for (const button of Array.from(buttonList)) {
    button.addEventListener("click", () => {
        currentInstance = undefined;
        const stageId = button.dataset.stageId;
        switch (stageId) {
            case "1":
                currentInstance = new SokobanGame(".o....o.x.#...#xxo.|..#......#......");
                break;
            case "2":
                currentInstance = new SokobanGame(".....o...................|ox.o..x.o.");
                break;
            case "3":
                currentInstance = new SokobanGame("..#o.....o..##.#.o.x...x..x#..|...##");
                break;
        }
    });
}
