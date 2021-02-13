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
  @Input()
  canvasHeight: number;
  
  @Input()
  canvasWidth: number;


  // how far down the pages y-axis has the user scrolled
  private viewY: number;  
  private timeSincePrevSpawn: number;
  private maxTimeBetweenSpawns: number = 8000; // 8 seconds 
  private minTimeBetweenSpawns: number = 2000; //2seconds
  private refreshRateMs: number = 83; // 12fsp @ 83ms
  private cloudSpawnProbability: number;

  /*
   * Store all cloud objects. Canvas is divided into rows that are as tall window.innerHeight each.
   * Each row has 0 < n <= 6 clouds at any time.
   * Rows do not overlap. Each rows originY coordinate is their key. 
   *  */ 
  private canvasRows: Map<number, Array<Cloud>>;
  
  
  intervalId: NodeJS.Timeout;
  constructor() {
   }

  ngOnInit(): void {
    this.cloudCanvas.nativeElement.width = this.canvasWidth ?? window.innerWidth;
    this.cloudCanvas.nativeElement.height = this.canvasHeight ?? window.innerHeight;
    this.intervalId = setInterval(()=> this.animate(), this.refreshRateMs) //12fps, 83 milliseconds
    this.timeSincePrevSpawn = 0.0;
    // spawn cloud on avg once every 5
    this.cloudSpawnProbability = Math.floor(5000 / this.refreshRateMs);
  }



  animate(): void{
    this.updateClouds();
    this.drawVisibleClouds();
  }

  /*
    draw all visible clouds
  */
  drawVisibleClouds(): void{
    const windowHeight = window.innerHeight; 
    const windowWidth = window.innerWidth;
    this.canvasRows.forEach((value: Array<Cloud>, key: number,) => {
      value.forEach((value: Cloud)=>{
        if(this.isCloudVisible(windowHeight, windowWidth, value)){
          this.drawCloud(value);
        }
      });
    });
  }

  drawCloud(cloud: Cloud){

  }


  /*
   * update cloud positions, remove expired clouds then finally
   * spawn new clouds.  
   */
  updateClouds(): void{
    this.updateCloudPositions();
    this.removeExpiredClouds();
    this.spawnNewClouds();
  }

  /*
   * update each clouds position according to their velocity 
   */
  updateCloudPositions(): void{
    for(let row of this.canvasRows.values()){
      for(let cloud of row){
        cloud.updatePosition();
      }
    }
  }
  /* 
   * Semi-randomly spawn new clouds. Number of clouds is limited to 5 per row.
   * No row may have >2 clouds of the same type. Cannot the same type of cloud 
   * consecutively. 
   */
  spawnNewClouds(): void{
    for(let row of this.canvasRows.values()){
      if(row.length < 6){
      
        if(this.timeSincePrevSpawn > this.minTimeBetweenSpawns){
          let roll = Math.floor(Math.random() * 5000);
          if(roll <= this.refreshRateMs){
            const species = this.getCloudSpecies(row);
            const position = this.getCloudSpawnPosition(row);
            const size = this.getCloudSize(row);
            row.push(new Cloud(
              position[0],
              position[1],
              size[0],
              size[1],
              species,
              size[2]));
            continue;
          } 

        }else if(this.timeSincePrevSpawn > this.maxTimeBetweenSpawns){
          const species = this.getCloudSpecies(row);
          const position = this.getCloudSpawnPosition(row);
          const size = this.getCloudSize(row);
          row.push(new Cloud(
            position[0],
            position[1],
            size[0],
            size[1],
            species,
            size[2]));
          continue;
        }        
      }
      this.timeSincePrevSpawn += this.refreshRateMs;
    }
  }

  getCloudSpecies(row: Array<Cloud>): CloudSpecies{
    // what if array is empty? 
    const prevSpawnedSpecies = row[row.length - 1].species; //dont spawn same cloud consecutively
    let roll = Math.floor(Math.random() * 4); // generate random integer between 0 and 4
    while(roll != prevSpawnedSpecies){
      roll = Math.floor(Math.random() * 4);
    }
    return roll;
  } 

  getCloudSpawnPosition(row: Array<Cloud>): Array<number>{
    let spawnPosition : Array<number>;


    return spawnPosition;
  }

  /* For purpose of responsive sizing, width is a fraction of window width and
   * height is a fraction of window height
   * @param row 
   */
  getCloudSize(row: Array<Cloud>): Array<number>{
    let cloudSize : Array<number>;
    const minWidth = 0.01;
    const maxWidth = 0.1;
    return cloudSize;
  }


  /*
   * remove any clouds that have moved out of view of the screen 
   */
  removeExpiredClouds(): void{
    const windowWidth = window.innerWidth;
    for(let row of this.canvasRows.values()){
      row.forEach((cloud: Cloud, index: number)=>{
        if(this.isCloudExpired(cloud, windowWidth)){
          row.splice(index, 1);
        }
      });      
    }
  }



  /*
   *  If clouds velocity is <0 (moving left) and the clouds position has moved off the left side of
      the screen out of view return true. Also return true if velocity > 0 and clouds is out of view 
      off  the right side of the screen.
   */
  isCloudExpired(cloud: Cloud, windowWidth: number): boolean{
    const endX = cloud.xPos + cloud.width;
    /* If cloud is off the right side of screen and moving right */
    if(cloud.xPos > windowWidth){
      return cloud.velocityX < 0;
    }else if(endX < 0){ // if cloud is off to left of screen and moving left
      return cloud.velocityX > 0;
    }
    return true;
  }

  /*
   * Return true if clouds position is on section of the app that is in view of user
   (ie in the view window) 
   */
  isCloudVisible(windowHeight: number, windowWidth: number, cloud: Cloud): boolean{
    // if originX + width >= 0 || originX < canvasWidth return true
    // if originY+height < viewY || originY < viewY + windowHeight;
    const originY = cloud.yPos;
    const endY = originY + cloud.height;
    return this.isCloudVisibleX(windowWidth, cloud)
    || originY < this.viewY + windowHeight
    || originY + cloud.height < this.viewY;
  }

  /*
   * @param windowWidth 
   * @param cloud 
   * return true if cloud has not gone out of bounds on the x-axis and would
   * still be visible if scrolled down to.
   */
  isCloudVisibleX(windowWidth: number, cloud: Cloud): boolean{
    const originX = cloud.xPos;
    const endX = originX + cloud.width;
    return originX < windowWidth || endX > 0;
  }



}
