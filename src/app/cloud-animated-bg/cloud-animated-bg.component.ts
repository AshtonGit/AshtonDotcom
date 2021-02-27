import { Component, ElementRef, Inject, Input, OnInit, ViewChild } from '@angular/core';
import {CloudSpecies, Cloud} from "../cloud-animated-bg/cloud";

@Component({
  selector: 'app-cloud-animated-bg',
  templateUrl: './cloud-animated-bg.component.html',
  styleUrls: ['./cloud-animated-bg.component.css']
})


export class CloudAnimatedBgComponent implements OnInit {

  @ViewChild('cloudCanvas', {static:true})
  cloudCanvas: ElementRef<HTMLCanvasElement>;
  private ctx: CanvasRenderingContext2D;  
  @Input() fixedCanvasHeight: number;
  @Input() fixedCanvasWidth: number;
  @Input() dynamicCanvasWidth: number;
  @Input() dynamicCanvasHeight: number;


  private maxTimeBetweenSpawns: number = 7000; // 6 seconds 
  private minTimeBetweenSpawns: number = 3000; //2seconds
  private refreshRateMs: number = 83; // 12fsp @ 83ms




  /*
   * Store all cloud objects. Canvas is divided into rows that are as tall window.innerHeight each.
   * Each row has 0 < n <= 6 clouds at any time.
   * Rows do not overlap. Each rows originY coordinate is their key. 
   *  */ 
  private canvasRows: Map<number, Cloud[][]>;
  /*
    Time since last cloud was spawned for each canvas row.
    Each rows originY coordinate is the key.
  */
  private timeSincePrevSpawn: Map<number, number>;
  
  intervalId: NodeJS.Timeout;
  constructor() {
    

   }

  ngOnInit(): void { 
    this.initCanvas();
    this.canvasRows = new Map<number, Cloud[][]>();
    this.timeSincePrevSpawn = new Map<number, number>();    
    const numRows = this.cloudCanvas.nativeElement.height / window.innerHeight;
    for(let i =0; i<numRows; i++){
      let row = new Array<Cloud[]>();
      for(let j=0; j<4; j++){
        row.push(new Array<Cloud>());        
      }      
      this.canvasRows.set(i*window.innerHeight, row);
      this.timeSincePrevSpawn.set(i * window.innerHeight, 0);
    }
    this.spawnInitialClouds(2,4);

    this.intervalId = setInterval(()=> this.animate(), this.refreshRateMs) //12fps, 83 milliseconds
  }


  initCanvas(){
    if(this.dynamicCanvasWidth != null){
      this.cloudCanvas.nativeElement.width = (window.innerWidth / 100) * this.dynamicCanvasWidth;
      
    }else{
      this.cloudCanvas.nativeElement.width = this.fixedCanvasWidth ?? window.innerWidth; 
    }
    if(this.dynamicCanvasHeight != null){
      this.cloudCanvas.nativeElement.height = (window.innerHeight / 100) * this.dynamicCanvasHeight;
    }else{
      this.cloudCanvas.nativeElement.height = this.fixedCanvasHeight ?? window.innerHeight;
    }
    this.ctx = this.cloudCanvas.nativeElement.getContext('2d');    
  }



  animate(): void{
    this.updateClouds(); 
    this.ctx.clearRect(0,0, this.cloudCanvas.nativeElement.width, this.cloudCanvas.nativeElement.height);
    this.drawVisibleClouds();
  }

  /*
    draw all visible clouds
  */
  drawVisibleClouds(): void{
    const windowHeight = window.innerHeight; 
    const windowWidth = window.innerWidth;
    this.canvasRows.forEach((row: Cloud[][], key: number,) => {
      row.forEach((value: Cloud[])=>{
        value.forEach((cloud: Cloud)=>{
          if(this.isCloudVisibleX(windowWidth, cloud)){
            this.drawCloud(cloud);
          }
        });
      });
    });
  }

  drawCloud(cloud: Cloud){
    let hWRatio = cloud.getImageElement().height / cloud.getImageElement().width;
    this.ctx.drawImage(cloud.getImageElement(), cloud.xPos, cloud.yPos, cloud.getWidthPx(), cloud.getWidthPx() * hWRatio );   
  }


  /*
   * update cloud positions, remove expired clouds then finally
   * spawn new clouds.  
   */
  updateClouds(): void{
    this.updateCloudPositions();
    this.removeExpiredClouds();
    this.spawnNewCloudsRandomly();
  }

  /*
   * update each clouds position according to their velocity. Clouds of different tiers are
   * drawn on top each other creating the illusion of depth.  
   */
  updateCloudPositions(): void{
    for(let row of this.canvasRows.values()){
      for(let value of row){
        for(let cloud of value){          
          cloud.updatePosition();
        }
      }
    }
  }
  /* 
   * Semi-randomly spawn new clouds. Number of clouds is limited to 5 per row.
   * No row may have >2 clouds of the same type. Cannot the same type of cloud 
   * consecutively. 
   */
  spawnNewCloudsRandomly(): void{
    console.log("Spawning clouds");
    for(let rowOrigin of this.canvasRows.keys()){
      const row = this.canvasRows.get(rowOrigin);
      let numClouds = 0;
      for(let tier of row) numClouds += tier.length;
    
      if(numClouds < 5){
      
        if(this.timeSincePrevSpawn.get(rowOrigin) > this.maxTimeBetweenSpawns){
          this.spawnCloud(rowOrigin);
          this.timeSincePrevSpawn.set(rowOrigin, 0);
          continue;
        } 
        else if(this.timeSincePrevSpawn.get(rowOrigin) > this.minTimeBetweenSpawns){
          let roll = Math.floor(Math.random() * 5000);
          if(roll <= this.refreshRateMs){
            this.spawnCloud(rowOrigin);
            this.timeSincePrevSpawn.set(rowOrigin, 0);
            continue;
          } 
        }            
      }
      this.timeSincePrevSpawn.set(rowOrigin, this.timeSincePrevSpawn.get(rowOrigin) + this.refreshRateMs);
    }
  }

  spawnInitialClouds(minClouds: number, maxClouds: number){
    
    for(let rowKey of this.canvasRows.keys()){
      let row = this.canvasRows.get(rowKey);
      const numClouds = (Math.random() * (maxClouds - minClouds))  + minClouds;
      for(let i=0; i<numClouds; i++){
        const size = this.getCloudSize();
        const tier = row[size[2]];
        const species = this.getCloudSpecies(tier);
        const position = this.getCloudSpawnPosition(rowKey, row);
        const velocity = Math.floor(position[0] < 0 ? size[1] : -size[1]);
        tier.push( new Cloud(
          position[0],
          position[1],
          size[0],
          species,
          velocity
        ));
      }
    }

  }

  spawnCloud(rowOrigin: number): void{
    const row = this.canvasRows.get(rowOrigin);
    const size = this.getCloudSize();
    const tier = row[size[2]];
    const species = this.getCloudSpecies(tier);
    const position = this.getCloudEdgeSpawnPosition(rowOrigin, tier);
    //if cloud spawns on left side of screen, it moves rightwards, else it moves left.
    const velocity = Math.floor( position[0] < 0 ? size[1] : -size[1]);
    tier.push(new Cloud(
      position[0],
      position[1],
      size[0],
      species,
      velocity));       
    console.log("Spawned Cloud! type:",species.toString(),"position",position[0],position[1]);
  }

  getCloudSpecies(row: Cloud[]): CloudSpecies{
    // what if array is empty? 
    if(row.length === 0)return Math.floor(Math.random() * 5);
    const prevSpawnedSpecies = row[row.length - 1].species; //dont spawn same cloud consecutively
    let roll = Math.floor(Math.random() * 5); // generate random integer between 0 and 4
    while(roll === prevSpawnedSpecies){
      roll = Math.floor(Math.random() * 5);
    }
    return roll;
  } 

  /**
   * Clouds can be one of 3 tiers with each tier having the same size and speed for each cloud.
   * These tiers are drawn in succession with biggest and slowest clouds drawn first and the fastest
   * and smallest clouds drawn last, providing a parallax effect and the illusion of depth.  
   * 
   * @param row 
   */
  getCloudSize(): number[]{
    const sizes = [18, 12, 8];
    const velocities = [1,2,3];
    const roll = Math.floor(Math.random() * 3);
  if(roll === 3){
    console.log("roll == 3");
  }
  return [sizes[roll], velocities[roll], roll];
  }
/*
 * 
 * @param rowOrigin: y-axis coordinate where this row begins on the canvas 
 * @param row: list of all clouds belonging to this row/subsection of the canvas
 */
  getCloudSpawnPosition(rowOrigin: number, row: Cloud[][]): Array<number>{
    let spawnPosition : Array<number>;
    const height = window.innerHeight;
    const width = window.innerWidth;
    const buffer = 200;
    let validPosition = false;
    while(!validPosition){
      let randX = Math.floor(Math.random() * width);
      let randY = Math.floor((Math.random() * height) + rowOrigin);
      spawnPosition = [randX, randY];
      validPosition = true;
      for(let tier of row){
        for(let cloud of tier){
          if(!this.maintainsBufferDistance(randX, randY, buffer, cloud)){
            validPosition = false;
            break;
          }
        }
      }
    }
    return spawnPosition;
  }
/**
 * 
 * @param rowOrigin 
 * @param row 
 */
  getCloudEdgeSpawnPosition(rowOrigin: number, row: Array<Cloud>): Array<number>{
    let spawnPosition : Array<number>;
    const height = window.innerHeight;
    const width = window.innerWidth;
    const buffer = window.innerWidth * 0.2;
    let validPosition = false;
    while(!validPosition){
      //spawn on left or right side of screen
      let randX = Math.floor(Math.random() * width);
      if(randX > width / 2){randX = width}
      else{
        randX = -200; // far offscreen so right edge of cloud doesn't suddenly pop into view
      }

      let randY = Math.floor((Math.random() * (height - 100)) + rowOrigin);
      spawnPosition = [randX, randY];
      validPosition = true;
      for(let cloud of row){
        if(!this.maintainsBufferDistance(randX, randY, buffer, cloud)){
          validPosition = false;
          break;
        }
      }
    }
    

    return spawnPosition;
  }

/**
 * 
 * @param randX 
 * @param randY 
 * @param buffer 
 * @param cloud 
 */
  maintainsBufferDistance(randX: number, randY: number, buffer: number, cloud: Cloud): boolean{
    const cloudX = cloud.xPos;
    const cloudY = cloud.yPos;
    let dx : number;
    let dy: number;
    if(randX < cloudX){ //randX is to the left of cloud
      dx = cloudX - randX;
    }else{ //randX is to the right of cloud
      dx = randX - cloudX + cloud.getWidthPx();
    }

    if(randY < cloudY){ //randY is above the cloud
      dy = cloudY - randY;
    }else{ //randY is below cloud
     dy = randY - cloudY + cloud.getImageElement().height;
    }
    //pytahgorean theorem to get distance between the clouds coordinates
    let distance = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
    return distance >= buffer;
  }



  /*
   * remove any clouds that have moved out of view of the screen 
   */
  removeExpiredClouds(): void{
    const windowWidth = window.innerWidth;
    for(let row of this.canvasRows.values()){
      row.forEach((tier: Cloud[])=>{
        tier.forEach((cloud: Cloud, index: number)=>{
          if(this.isCloudExpired(cloud, windowWidth)) tier.splice(index, 1);
        });
      });      
    }
  }

  /*
   *  If the cloud is moving left and the clouds position is off the left side of
      the screen out of view return true. Also return true if cloud is moving right and the cloud
      is out of view off  the right side of the screen.
   */
  isCloudExpired(cloud: Cloud, windowWidth: number): boolean{
    const endX = cloud.xPos + cloud.getWidthPx();
    /* If cloud is off the right side of screen and moving right */
    if(cloud.xPos > windowWidth){
      return cloud.velocityX > 0;
    }else if(endX < 0){ // if cloud is off to left of screen and moving left
      return cloud.velocityX < 0;
    }
    return false;
  }


  /*
   * @param windowWidth 
   * @param cloud 
   * return true if cloud has not gone out of bounds on the x-axis and would
   * still be visible if scrolled down to.
   */
  isCloudVisibleX(windowWidth: number, cloud: Cloud): boolean{
    const originX = cloud.xPos;
    const endX = originX + cloud.getWidthPx();
    return (originX < windowWidth && endX > 0);
  }



}
