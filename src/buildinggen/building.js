import { randomColorLight } from "../utils/colorutils";
import { getGeoAndRotation } from "./cellUtils";

// const GRID_MIN = 1;
const GRID_SIZE = 10;
const MIN_ROOM_SIZE = 3;
const MAX_ROOM_SIZE = 7;
const ROOM_REMOVAL_CHANCE = 0.5;

const N = 0;
const E = 1;
const S = 2;
const W = 3;

const WALL_NONE = 0;
const WALL_EXT = 1;
const WALL_INTERIOR = 2;

const OBJ_NONE = 0;
const OBJ_DOOR_EXT = 1;
const OBJ_WINDOW = 2;
const OBJ_DOOR_INT = 3;
const OBJ_STAIRS = 4;

const WINDOW_CHANCE = 0.3;

// const isVert = (n) => (n % 2) === 0;
// const isHorz = (n) => (n % 2) === 1;
const pickSide = () => {
    return (
        (Math.random() > 0.5 ? 0 : 2) +
        (Math.random() > 0.5 ? 0 : 1)
    )
}

const randomBetween = (mN, mX) => {
    return Math.floor(Math.random() * (mX-mN)) + mN;
}

const randomElement = (ar) => {
    const i = Math.floor(Math.random() * ar.length);
    return ar[i];
}

const randPos = (currMin, currMax, extents) => {
    const newMin = currMin - extents + 1;
    const newMax = currMax - 1;
    const result = (Math.floor(Math.random() * (newMax-newMin))) + newMin; 
    return result;
}

class Room {
    constructor() {
        this.x = 0;
        this.y = 0;
        // this.w = Math.floor(Math.random() * MAX_ROOM_SIZE) + 2;
        // this.h = Math.floor(Math.random() * MAX_ROOM_SIZE) + 2;
        this.w = randomBetween(MIN_ROOM_SIZE, MAX_ROOM_SIZE);
        this.h = randomBetween(MIN_ROOM_SIZE, MAX_ROOM_SIZE);
        
        this.id = -1;
    }
}

class Extent {
    constructor(p, mn, mx) {
        this.pos = p || 0;
        this.rMin = mn || 0;
        this.rMax = mx || 0; 
    }
}

class Building {
    constructor() {
        this.floors = [];

        this.numFloors = Math.floor(Math.random() * 10) + 3;
        
        for (let i=0; i < this.numFloors; i++) {
            this._addFloor();
        }

        this.floors[this.floors.length-1].hasRoof = true;
    }

    _addFloor() {
        if (this.floors.length === 0) {
            this.floors.push(new BuildingFloor());
        } else {
            const prevFloor = this.floors[this.floors.length-1];
            this.floors.push(new BuildingFloor(prevFloor));
        }
        
    }

    draw(ctx, floor) {
        const flIdx = Math.max(Math.min(floor, this.floors.length-1), 0);
        this.floors[flIdx].draw(ctx);
    }
}

class BuildingFloor {
    constructor(lowerFloor = null) {

        this.hasRoof = false;

        if (lowerFloor === null) {
            // make a ground floor
            this._rooms = [];
            this.w = 0;
            this.h = 0;
            this.edges = [
                new Extent(),
                new Extent(),
                new Extent(),
                new Extent()
            ];
            
            this.zPos = 0;

            this.minPos = [0,0];
            this.maxPos = [0,0];
            
            this.stairsLoc = null;
            this.prevFloor = null;
            this.nextFloor = null;

            while (!this._finished) {
                this._addRoom();
            }
            this._finalizeExtents();
            this._finalize();   

        } else {
            // make a floor based on the previous floor
            this._rooms = structuredClone(lowerFloor._rooms);
            this.edges = structuredClone(lowerFloor.edges);
            this.minPos = structuredClone(lowerFloor.minPos);
            this.maxPos = structuredClone(lowerFloor.maxPos);
            this.w = lowerFloor.w;
            this.h = lowerFloor.h;
            this.zPos = lowerFloor.zPos + 1;

            this.prevFloor = lowerFloor;
            lowerFloor.nextFloor = this;

            if ((this._rooms.length > 1) && (Math.random() < ROOM_REMOVAL_CHANCE)) {
                this._rooms.pop();
            }

            this._finalize(lowerFloor);
        }
        this.hasRoof = false;

    }

    get _finished() {
        return (this._rooms.length >= 5);
    }

    _addRoom() {
        const r = new Room();
        r.id = this._rooms.length;

        if (this._rooms.length < 1) {
            this.edges[N] = new Extent(r.h, 0, r.w);
            this.edges[E] = new Extent(r.w, 0, r.h);
            this.edges[S] = new Extent(0, 0, r.w);
            this.edges[W] = new Extent(0, 0, r.h);
            
        } else {
            switch (pickSide()) {
                case N:
                    r.y = this.edges[N].pos;
                    r.x = randPos(this.edges[N].rMin, this.edges[N].rMax, r.w);
                    this.edges[N].pos += r.h;
                    
                    this.edges[N].rMin = r.x;
                    this.edges[N].rMax = r.x + r.w;

                    this.edges[W].pos = Math.min(this.edges[W].pos, r.x);
                    this.edges[E].pos = Math.max(this.edges[E].pos, r.x + r.w);
                    
                    break;
                case E:
                    r.x = this.edges[E].pos;
                    r.y = randPos(this.edges[E].rMin, this.edges[E].rMax, r.h);
                    this.edges[E].pos += r.w;
                    
                    this.edges[E].rMin = r.y;
                    this.edges[E].rMax = r.y + r.h;

                    this.edges[S].pos = Math.min(this.edges[S].pos, r.y);
                    this.edges[N].pos = Math.max(this.edges[N].pos, r.y + r.h);
                    break;
                case S:
                    r.y = this.edges[S].pos - r.h;
                    r.x = randPos(this.edges[S].rMin, this.edges[S].rMax, r.w);
                    this.edges[S].pos -= r.h;
                    this.h += r.h;
                    
                    this.edges[S].rMin = r.x;
                    this.edges[S].rMax = r.x + r.w;

                    this.edges[W].pos = Math.min(this.edges[W].pos, r.x);
                    this.edges[E].pos = Math.max(this.edges[E].pos, r.x + r.w);
                    break;
                case W:
                    r.x = this.edges[W].pos - r.w;
                    r.y = randPos(this.edges[W].rMin, this.edges[W].rMax, r.h);
                    this.edges[W].pos -= r.w;
                    
                    this.edges[W].rMin =
                     r.y;
                    this.edges[W].rMax = r.y + r.h;

                    this.edges[S].pos = Math.min(this.edges[S].pos, r.y);
                    this.edges[N].pos = Math.max(this.edges[N].pos, r.y + r.h);
                    break;
                default:
                    break;
            }
    
        }

        this.minPos = [Math.min(this.minPos[0], r.x), Math.min(this.minPos[1], r.y)];
        this.maxPos = [Math.max(this.maxPos[0], r.x+r.w), Math.max(this.maxPos[1], r.y+r.h)];
        
        this._rooms.push(r);
    }

    _finalizeExtents() {
        this.w = this.maxPos[0] - this.minPos[0];
        this.h = this.maxPos[1] - this.minPos[1];

        // prevent -0
        const offsetX = this.minPos[0] === 0 ? 0 : -this.minPos[0];
        const offsetY = this.minPos[1] === 0 ? 0 : -this.minPos[1];

        this._rooms.forEach(r => {
            // correct negative positions
            r.x += offsetX;
            r.y += offsetY;            
        });

        this.minPos = [
            this.minPos[0] + offsetX,
            this.minPos[1] + offsetY
        ];
        this.maxPos = [
            this.maxPos[0] + offsetX,
            this.maxPos[1] + offsetY
        ];

    }

    _locateStairs() {

        if (this.zPos === 0) return;

        // pick a random room 
        const stairRoom = randomElement(this._rooms);

        // grab a location in the room
        const x = randomBetween(1, stairRoom.w-1);
        const y = randomBetween(1, stairRoom.h-1);

        this.stairsLoc = {
            x: stairRoom.x + x,
            y: stairRoom.y + y,
            r: Math.floor(Math.random() * 4)
        };

        // if we're close to the previous stairs, match them
        if (this.prevFloor && this.prevFloor.stairsLoc) {
            const dx = Math.abs(this.stairsLoc.x - this.prevFloor.stairsLoc.x);
            const dy = Math.abs(this.stairsLoc.y - this.prevFloor.stairsLoc.y);

            if ((dx < 2) && (dy < 2)) {
                this.stairsLoc = {...this.prevFloor.stairsLoc};
            }
        }
    }

    _finalize(prevFloor = null) {
        this._locateStairs();

        this.contents = [];
        for (let i=0; i < this.h; i++) {
            // contents.push([]);
            this.contents.push(Array(this.w).fill(-1));
        }

        const stripsH = Array.from(Array(this.h), () => {
            return {
                spans: []    
            }
        });
        const stripsV = Array.from(Array(this.w), () => {
            return {
                spans: []
            }
        });

        this._rooms.forEach(r => {

            for (let x=0; x < r.w; x++) {
                stripsV[r.x+x].spans.push({
                    start: r.y,
                    end: r.y + r.h,
                    id: r.id
                });

               for (let y=0; y < r.h; y++) {
                    if (x===0) {
                        stripsH[r.y+y].spans.push({
                            start: r.x,
                            end: r.x + r.w,
                            id: r.id
                        });        
                    }

                    // mark cells
                    this.contents[y+r.y][x+r.x] = r.id;
               }
            }
        });
    
        const spanSort = (sA, sB) => {
            if (sA.start < sB.start) return -1;
            if (sA.start > sB.start) return 1;
            return 0;
        }

        const markRooms = (start, end, pos, isHoriz) => {
            // console.log('filling in: ', start, end, pos);
            if (isHoriz) {
                for (let i=0; i < end-start; i++) {
                    this.contents[pos][start+i] = 128;
                }
            } else {
                for (let i=0; i < end-start; i++) {
                    this.contents[start+i][pos] = 128;
                }
            }
        }

        stripsH.forEach((hs, spanIdx) => {
            if (hs.spans.length > 1) {
                hs.spans.sort(spanSort);
                for (let i=1; i<hs.spans.length; i++) {
                    const start = hs.spans[i-1].end;
                    const end = hs.spans[i].start;
                    if (end-start > 0) {
                        markRooms(start, end, spanIdx, true);
                    }
                }
            }
        });

        stripsV.forEach((hs, spanIdx) => {
            if (hs.spans.length > 1) {
                hs.spans.sort(spanSort);
                for (let i=1; i<hs.spans.length; i++) {
                    const start = hs.spans[i-1].end;
                    const end = hs.spans[i].start;
                    if (end-start > 0) {
                        markRooms(start, end, spanIdx, false);
                    }
                }
            }
        });

        const safeGetCell = (x, y, contents) => {
            if (x < 0 || x >= this.w) return -1;
            if (y < 0 || y >= this.h) return -1;
            return contents[y][x];
        }

        const characterizeCell = (x, y, contents) => {
            let cellID = 0;
            let pow = 1;
            for (let j=-1; j<2; j++) {
                for (let i=-1; i<2; i++) {
                    if ((safeGetCell(x+i, y+j, contents)) !== -1) {
                        cellID += pow;
                    }
                    pow *= 2;
                }
            }
            return cellID;
        }        

        const getWallType = (x1, y1, x2, y2) => {
            const curr = safeGetCell(x1, y1, this.contents);
            const compare = safeGetCell(x2, y2, this.contents);
            
            // three possible states

            // no diff, so no wall
            if (curr === compare) {
                return WALL_NONE;
            }

            // one of the two is null space, so exterior wall
            if ((curr === -1) || (compare === -1)) {
                return WALL_EXT;    
            }

            // otherwise, must be interior
            return WALL_INTERIOR;
        }

        const getRooms = (x1, y1, x2, y2) => {
            return [safeGetCell(x1, y1, this.contents), safeGetCell(x2, y2, this.contents)];
        }

        const roomDiffHash = (ids) => {
            const id1 = ids[0];
            const id2 = ids[1];
            if (id1 < id2) {
                return id1 + '_' + id2;
            }
            return id2 + '_' + id1;
        }
        
        /*
        // this is the first approach. leaving it here since
        // it was discussed in chat        
        let lastDiffHash = null;
        let lastDiffHashesV = Array(this.w).fill('');
        */

        // gen walls
        this.walls = {
            exterior: [],
            interior: []
        };

        this.floors = [];
        this.ceilings = [];
    
        let intWalls = new Map();

        const addFloorAt = (x,y) => {

            const floor = {
                x,
                y,
                obj: OBJ_NONE
            };

            if (this.stairsLoc !== null) {
                if (x === this.stairsLoc.x &&
                    y === this.stairsLoc.y) {
                        floor.obj = OBJ_STAIRS;
                        floor.rot = this.stairsLoc.r;
                    }
            }

            this.floors.push(floor);
        }

        for (let y=0; y < this.h+1; y++) {
            for (let x=0; x < this.w+1; x++) {
                const currCell = safeGetCell(x, y, this.contents);

                // maybe add extra floors to close off open areas
                if (prevFloor !== null) {                    
                    const prevCell = safeGetCell(x, y, prevFloor.contents);
                    if ((prevCell !== -1) && (currCell === -1)) {
                        addFloorAt(x,y);
                    }                     
                }

                if (currCell !== -1) {
                    addFloorAt(x, y);
                    
                    const cellType = characterizeCell(x,y, this.contents);
                    const  [geo, rot] = getGeoAndRotation(cellType);

                    this.ceilings.push({
                        x,
                        y,
                        obj: OBJ_NONE,
                        t: cellType,
                        geo,
                        rot
                    })
                }
                
                const hWall = getWallType(x, y, x, y-1);
                
                if (hWall !== WALL_NONE) {
                    const w = {
                        x: x,
                        y: y,
                        v: 0,
                        t: hWall,
                        obj: OBJ_NONE
                    }
                    if (hWall === WALL_EXT) {
                        if (Math.random() < WINDOW_CHANCE) {
                            w.obj = OBJ_WINDOW; 
                        }
                        this.walls.exterior.push(w);
                    } else {
                        // maybe make a door
                        let currDiffHash = roomDiffHash(getRooms(x, y, x, y-1));
                        
                        let currEntries = intWalls.get(currDiffHash) || [];
                        intWalls.set(currDiffHash, [...currEntries, w]);                        
                        
                        /*
                        // this is the first approach. leaving it here since
                        // it was discussed in chat
                        if (currDiffHash !== lastDiffHash) {
                            console.log('adding door');
                            w.obj = OBJ_DOOR_INT;
                            lastDiffHash = currDiffHash;
                        }
                        */
                        this.walls.interior.push(w);
                    }
                }
                
                const vWall = getWallType(x, y, x-1, y);
                if (vWall !== WALL_NONE) {
                    const w = {
                        x: x,
                        y: y,
                        v: 1,
                        t: vWall,
                        obj: OBJ_NONE
                    }
                    if (vWall === WALL_EXT) {
                        if (Math.random() < WINDOW_CHANCE) {
                            w.obj = OBJ_WINDOW; 
                        }
                        this.walls.exterior.push(w);
                    } else {
                        
                        let currDiffHash = roomDiffHash(getRooms(x, y, x-1, y));
                        let currEntries = intWalls.get(currDiffHash) || [];
                        intWalls.set(currDiffHash, [...currEntries, w]);                        

                        /*
                        // this is the first approach. leaving it here since
                        // it was discussed in chat
                        if (currDiffHash !== lastDiffHashesV[x]) {
                            console.log('adding door');
                            w.obj = OBJ_DOOR_INT;
                            lastDiffHashesV[x] = currDiffHash;
                        }
                        */
                        this.walls.interior.push(w);
                    }
                }
            }
        }

        intWalls.forEach((walls, hash) => {
            const wallIdx = Math.floor(Math.random() * walls.length);
            walls[wallIdx].obj = OBJ_DOOR_INT;

        })

        // add some doors. I considered using a Fischer-Yates shuffle
        // then selecting the first N locations, but this is quicker, and
        // actually better, I think. Since similar indices are near each other,
        // selecting randomly from different spans of the list spreads the doors
        // out around the building better than a shuffle would, and is O(num doors)
        // instead of O(num exterior walls)
        const numDoors = Math.ceil(this._rooms.length/2);
        for (let i=0; i < numDoors; i++) {
            const wallRange = Math.floor(this.walls.exterior.length / numDoors);
            let wallIdx = Math.floor(Math.random() * wallRange);
            wallIdx += wallRange * i;
            this.walls.exterior[wallIdx].obj = OBJ_DOOR_EXT;    
        }

    }

    _drawStairs(ctx, stairsLoc) {
        ctx.save();
        ctx.fillStyle = "#F0F";
        
        ctx.translate((stairsLoc.x + 0.5) * GRID_SIZE,
            (stairsLoc.y + 0.5) * GRID_SIZE);
            ctx.rotate(Math.PI/2 * stairsLoc.r);
            ctx.fillRect(-GRID_SIZE/2, -GRID_SIZE/2, GRID_SIZE, GRID_SIZE);
        
        ctx.fillStyle = "#FFF";
        ctx.beginPath();
        ctx.arc(GRID_SIZE/4, 0, GRID_SIZE/4, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    draw(ctx) {
        ctx.clearRect(0, 0, 500, 500);

        ctx.save();
        
        // ctx.translate(-this.minPos[0] * GRID_SIZE, -this.minPos[1] * GRID_SIZE);
        
        const colors = [];
        // colors[128] = "#F00";
        
        ctx.strokeStyle = "#AAA";

        // console.table(this.contents);

        for (let i=0; i < this.h; i++) {
            for (let j=0; j < this.w; j++) {

                const rID = this.contents[i][j];
                if (rID === -1) {
                    ctx.strokeRect(j*GRID_SIZE, i*GRID_SIZE, GRID_SIZE, GRID_SIZE);
                } else {
                    if (!colors[rID]) {
                        colors[rID] = randomColorLight();
                    }

                    ctx.fillStyle = colors[rID];
                    ctx.fillRect(j*GRID_SIZE, i*GRID_SIZE, GRID_SIZE, GRID_SIZE);
                }
            }
        }

        ctx.save();
        ctx.lineWidth = 3;
        ctx.strokeStyle = "#F00";
        ctx.beginPath();
        this.walls.exterior.forEach((w,i) => {
                ctx.moveTo(w.x * GRID_SIZE, w.y * GRID_SIZE);
                const end = w.v ? {x: w.x, y: w.y+1} : {x: w.x+1, y: w.y};
                ctx.lineTo(end.x * GRID_SIZE, end.y * GRID_SIZE);
        });
        ctx.stroke();
        ctx.restore();

        ctx.save();
        ctx.beginPath();
        ctx.lineWidth = 1;
        ctx.strokeStyle = "#000";
        this.walls.interior.forEach((w,i) => {                        
                ctx.moveTo(w.x * GRID_SIZE, w.y * GRID_SIZE);
                const end = w.v ? {x: w.x, y: w.y+1} : {x: w.x+1, y: w.y};
                ctx.lineTo(end.x * GRID_SIZE, end.y * GRID_SIZE);
        });
        ctx.stroke();
        ctx.restore();

        ctx.save();
        this.walls.exterior.forEach(wall => {
            switch (wall.obj) {
                case OBJ_DOOR_EXT:
                    ctx.save();
                    ctx.fillStyle = "#0F0";
                    if (wall.v) {
                        ctx.fillRect((wall.x*GRID_SIZE)-4, (wall.y*GRID_SIZE), 8, GRID_SIZE);

                    } else {
                        ctx.fillRect(wall.x*GRID_SIZE, (wall.y*GRID_SIZE)-4, GRID_SIZE, 8);

                    }
                    ctx.restore();
                    break;
                case OBJ_WINDOW:
                    ctx.save();
                    ctx.fillStyle = "#AAA";
                    if (wall.v) {
                        ctx.fillRect((wall.x*GRID_SIZE)-2, (wall.y*GRID_SIZE), 4, GRID_SIZE);

                    } else {
                        ctx.fillRect(wall.x*GRID_SIZE, (wall.y*GRID_SIZE)-2, GRID_SIZE, 4);
                    }
                    ctx.restore();
                    break;
                default:
                    break;
            }
        });
        this.walls.interior.forEach(wall => {
            switch (wall.obj) {
                case OBJ_DOOR_INT:
                    ctx.save();
                    ctx.fillStyle = "#00F";
                    if (wall.v) {
                        ctx.fillRect((wall.x*GRID_SIZE)-4, (wall.y*GRID_SIZE)+2, 8, GRID_SIZE-4);

                    } else {
                        ctx.fillRect(wall.x*GRID_SIZE+2, (wall.y*GRID_SIZE)-4, GRID_SIZE-4, 8);
                    }
                    ctx.restore();
                    break;
                default:
                    break;
            }
        });
        ctx.restore(); // end walls

        // draw stairs
        /*
        if (this.zPos > 0 && this.stairsLoc !== null) {
            ctx.save();
            ctx.fillStyle = "#F0F";
            
            ctx.translate((this.stairsLoc.x + 0.5) * GRID_SIZE,
                (this.stairsLoc.y + 0.5) * GRID_SIZE);
                ctx.rotate(Math.PI/2 * this.stairsLoc.r);
                ctx.fillRect(-GRID_SIZE/2, -GRID_SIZE/2, GRID_SIZE, GRID_SIZE);
            
            ctx.fillStyle = "#FFF";
            ctx.beginPath();
            ctx.arc(GRID_SIZE/4, 0, GRID_SIZE/4, 0, Math.PI * 2);
            ctx.fill();
    
            ctx.restore();
        }
        */

        if (this.stairsLoc) {
            this._drawStairs(ctx, this.stairsLoc);
        }

        if (this.nextFloor && this.nextFloor.stairsLoc) {
            this._drawStairs(ctx, this.nextFloor.stairsLoc);
        }


        ctx.restore();
    }
}

export default Building;