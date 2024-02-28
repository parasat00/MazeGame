const container = document.querySelector('#canvas_container');
const start_btn = document.querySelector('.start');
const difficulty = document.querySelector('#difficulty');
const ctrls_toggle = document.querySelector('.controls');
const ctrls = document.querySelectorAll('.ctrl');
const modal = document.querySelector('.modal');
const modal_btn = document.querySelector('.modal .close');
let player;
let cells, startpoint, endpoint;
let steps = 0;
let game_grid;
let player_pos;
let cell_dimension;

function newMaze(x, y) {
 const totalCells = x * y;
 const cells = new Array();
 const non_visited = new Array();
 const distances = new Array();

 // declare the multidimensional array
 for(let i = 0; i < y; i++) {
  cells[i] = new Array();
  non_visited[i] = new Array();
  distances[i] = new Array();

  for(let j = 0; j < x; j++) {
   // walls: top, right, bottom, left
   cells[i][j] = [1, 1, 1, 1];
   non_visited[i][j] = true;
   distances[i][j] = 0;
  }
 }

 // Mark 0,0 position as start
 const start = [0, 0];
 let current = start;
 const path = [current];
 non_visited[current[0]][current[1]] = false;
 let visited = 1;

 while(current && visited < totalCells) {
  const potential_neighbours = [
   [current[0]-1, current[1], 0, 2],  //top wall, 0 because it is on our top, 2 because for neighbor we are at bottom
   [current[0], current[1]+1, 1, 3],          //right
   [current[0]+1, current[1], 2, 0],          //bottom
   [current[0], current[1]-1, 3, 1]           //left
  ]

  // Find non visited neighbors
  const neighbor = new Array();

  for(let i = 0; i < 4; i++) {
   if(potential_neighbours[i][0] > -1 && potential_neighbours[i][0] < y && potential_neighbours[i][1] > -1 && potential_neighbours[i][1] < x && non_visited[potential_neighbours[i][0]][potential_neighbours[i][1]]) {
    neighbor.push(potential_neighbours[i]);
   }
  }

  if(neighbor.length) {
   next = neighbor[Math.floor(Math.random()*neighbor.length)];
   cells[current[0]][current[1]][next[2]] = 0;
   cells[next[0]][next[1]][next[3]] = 0;

   distances[next[0]][next[1]] = distances[next[0]][next[1]] === 0 ? distances[current[0]][current[1]] + 1 : distances[next[0]][next[1]];
   non_visited[next[0]][next[1]] = false;
   visited++;
   current = [next[0], next[1]];
   path.push(current);
  }
  else{
   current = path.pop();
  }
 }
 let obj = {};
 distances.forEach((row, index) => {
  const max = Math.max(...row);
  obj[max] = [index, row.indexOf(max)];
  return obj;
 });
 const max_val = Math.max(...Object.keys(obj));

 return {cells, startpoint: start, endpoint: obj[max_val]};
}

function drawMap(cells, startpoint, endpoint) {
 game_grid = document.createElement('div');
 game_grid.id="gameGrid";

 for(let y = 0; y < cells.length; y++) {
  for(let x = 0; x < cells[y].length; x++) {
   
   const borders = cells[y][x]
   box = document.createElement('div');
   box.style=`border-style: ${borders[0] === 1 ? 'solid':'none'}
                            ${borders[1] === 1 ? 'solid':'none'}
                            ${borders[2] === 1 ? 'solid':'none'}
                            ${borders[3] === 1 ? 'solid':'none'}`;
   
   if(y === startpoint[0] && x === startpoint[1]) {
    player = document.createElement('span');
    player.className = "player";
    player.innerHTML = '&#128522;';
    box.appendChild(player);
   }
   if(y === endpoint[0] && x === endpoint[1]) {
    // <i class="fa fa-home" aria-hidden="true"></i>
    const icon = document.createElement('i');
    icon.className = "fa fa-home endpoint";
    box.appendChild(icon);
   }
   game_grid.appendChild(box);
  }
 }
}

const startGame = () => {
 steps = 0;
 if(game_grid) {
  container.removeChild(game_grid);
 }
 const dimensions = difficulty.value === 'easy' ? 5 : difficulty.value === 'middle' ? 10 : 15;
 const icon_size = difficulty.value === 'easy' ? '1.5rem' : difficulty.value === 'middle' ? '0.9rem' : '0.5rem';
 document.documentElement.style.setProperty('--grid-dimensions', dimensions);
 document.documentElement.style.setProperty('--icon-size', icon_size);

 let style = getComputedStyle(document.documentElement);
 cell_dimension = style.getPropertyValue('--container-dimensions');
 cell_dimension = Math.floor(parseInt(cell_dimension.slice(0, -2)) / dimensions);

 let obj = newMaze(dimensions, dimensions);
 cells = obj.cells;
 startpoint = obj.startpoint;
 endpoint = obj.endpoint;
 drawMap(cells, startpoint, endpoint);
 container.appendChild(game_grid);
 ctrls_toggle.classList.add('active');

 player_pos = startpoint;
}

const move = (e) => {
 const dir = e.target.dataset.dir;
 switch(dir) {
  case 'top' :
   if(player_pos[0]-1 >= 0 && cells[player_pos[0]][player_pos[1]][0] === 0) {
    player_pos = [player_pos[0]-1, player_pos[1]];
    steps++;
   }
   break;
  case 'right' :
   if(cells[player_pos[0]][player_pos[1]][1] === 0) {
    player_pos = [player_pos[0], player_pos[1]+1];
    steps++;
   }
   break;
  case 'bottom' :
   if(cells[player_pos[0]][player_pos[1]][2] === 0) {
    player_pos = [player_pos[0]+1, player_pos[1]];
    steps++;
   }
   break;
  case 'left' :
   if(player_pos[1]-1 >= 0 && cells[player_pos[0]][player_pos[1]][3] === 0) {
    player_pos = [player_pos[0], player_pos[1]-1];
    steps++;
   }
   break;
 }
 
 player.style.transform = `translate(${player_pos[1] * cell_dimension}px, ${player_pos[0] * cell_dimension}px)`;

 if(player_pos[0] === endpoint[0] && player_pos[1] === endpoint[1]) {
  declareWin();
 }
}

const declareWin = () => {
 modal.classList.add('show');
 const p = modal.querySelector('p');
 p.textContent = `You moved ${steps} steps`;
}
const closeModal = () => {
 modal.classList.remove('show');
}

start_btn.addEventListener('click', startGame);
ctrls.forEach(ctrl => ctrl.addEventListener('click', move));
modal_btn.addEventListener('click', closeModal);