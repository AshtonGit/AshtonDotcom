
import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { GameObject } from './game-object';
import { PlayerController} from './player-controller/player-controller';
import {SpriteLibrary} from './player-controller/sprite-library';
import {RunState} from "./player-controller/run-state";
import { clear, debug } from 'console';
import { title } from 'process';

@Component({
  selector: 'app-splash',
  templateUrl: './splash.component.html',
  styleUrls: ['./splash.component.css']
})
export class SplashComponent implements OnInit {

  @Input() canvasWidthDynamic: number;
  @Input() canvasHeightDynamic: number;
  @ViewChild('gameCanvas', {static: true}) canvas: ElementRef<HTMLCanvasElement>;
  private ctx: CanvasRenderingContext2D;

  private refreshRateMs = 16.66; //60fps

 // private playerController : PlayerController; 
  private gameObjects : Array<GameObject>;

  private animateIntervalId : NodeJS.Timeout;

  constructor() {
   }

  ngOnInit(): void {
    this.ctx = this.canvas.nativeElement.getContext("2d");   
    let height = window.innerHeight;
    let width = window.innerWidth; 
    if(this.canvasHeightDynamic != null) height = height / 100 * this.canvasHeightDynamic;
    if(this.canvasWidthDynamic != null) width = width / 100 * this.canvasWidthDynamic;
    this.canvas.nativeElement.height = height;
    this.canvas.nativeElement.width = width;

  //  this.playerController = new PlayerController(window.innerHeight * 0.1, window.innerWidth * 0.75,
     //                                    window.innerHeight * 0.4);
  const spriteLibrary = new SpriteLibrary();

  spriteLibrary.runLeftImages[5].onload = (()=>{
 //     this.animateIntervalId = setInterval(()=>this.animate(), this.refreshRateMs);
      this.greetAnimation(spriteLibrary);
    });
  }


  animate(){
    /**
    let image : HTMLImageElement = this.playerController.getImage();
    let hwRatio = image.naturalHeight / image.naturalWidth;
    this.ctx.clearRect(0, 0, this.canvas.nativeElement.width, this.canvas.nativeElement.height);
    this.ctx.drawImage(image, this.playerController.xPos, this.playerController.yPos, this.playerController.width,
                        this.playerController.width * hwRatio);
                        */
  }

  greetAnimation(spriteLibrary : SpriteLibrary){ 
    // Avatar animation variables      
    let indx = 0;
    let currentImage = spriteLibrary.runLeftImages[5];
    let imageSequence = [0, 1, 2, 0, 5, 3, 4];    
    let xPos = window.innerWidth * 0.77;
    let yPos = window.innerHeight * 0.455;
    let hwRatio = 1.35;
    let width = window.innerHeight * 0.1;
    let height = currentImage.width * hwRatio;
    let positionIntervalId : NodeJS.Timeout;
    let imageIntervalId : NodeJS.Timeout;    
    let greetAnimationIntervalId : NodeJS.Timeout;
    
    //title animation variables
    let titleX = window.innerWidth * 0.34;
    let titleY = Math.floor(- window.innerHeight * 0.307);      
    const titleGravity = window.innerHeight * 0.0007;
    let titleVelocityY = 0.0;
    this.ctx.font = `11vh Righteous, Abril Fatface, sans-serif`; 
    this.ctx.shadowOffsetX = 2;
    this.ctx.shadowOffsetY = 2;
    this.ctx.fillStyle = "#eeeeee";   
    let titleAnimationIntervalId : NodeJS.Timeout;


    //begin animation 
    greetAnimationIntervalId = setInterval(()=>{
      this.ctx.shadowColor = "transparent";
      this.ctx.clearRect(0, 0 ,this.canvas.nativeElement.width, this.canvas.nativeElement.height);
      this.ctx.drawImage(currentImage, xPos, yPos, width, height);   
      this.ctx.shadowColor = "#111111";
      this.ctx.fillText("ASHTON", titleX, titleY);
      this.ctx.fillText("ANTOUN", titleX, titleY+(window.innerHeight * 0.09));
    }, this.refreshRateMs);

    
    /**
     * After 2.5 seconds, the title begins falling from top outside the top of the screen.
     */
    setTimeout(() => {
      titleAnimationIntervalId = setInterval(()=>{        
        titleY+= Math.floor(titleVelocityY);
        titleVelocityY += titleGravity;
        console.log(`Velocity: ${titleVelocityY}. X: ${titleX}. Y: ${titleY}`);
       }, this.refreshRateMs);
    }, 3190);


    //move avatar left 25vw over 700 milliseconds at 60fps intervals
    const velocityX = window.innerWidth * 0.2 / (1350 / this.refreshRateMs)
    positionIntervalId = setInterval(()=>xPos -= velocityX, this.refreshRateMs);
    imageIntervalId = setInterval(()=>{
      indx > 5  ? indx = 0 : indx++;
      currentImage = spriteLibrary.runLeftImages[imageSequence[indx]];
    }, 90);


    // turn avatar to face 4th wall
    setTimeout(()=>{
      clearInterval(positionIntervalId);
      clearInterval(imageIntervalId);
      currentImage = spriteLibrary.faceFrontImages[0];
    }, 1350);
    // avatar waves    
    setTimeout(()=>{
      indx = 0;
      imageIntervalId = setInterval(()=>{
        indx == 0 ? indx = 1 : indx = 0;
        currentImage = spriteLibrary.waveImages[indx];
      }, 250);
    }, 1800);

    //falling title hits the "ground", ending descent.
    setTimeout(()=>{
      clearInterval(titleAnimationIntervalId);
    }, 4000);

    // avatars high initial bounce in reaction to title hitting the "ground"     
    let gravity = window.innerHeight * 0.002;
    setTimeout(()=>{
      clearInterval(imageIntervalId);
      currentImage = spriteLibrary.jumpImages[0];
      let velocityY = -window.innerHeight * 0.035;
      positionIntervalId = setInterval(()=>{       
        yPos += velocityY;
         velocityY += gravity;
      }, this.refreshRateMs);
    }, 4000);
    
    //avatars smaller second bounce
    setTimeout(()=>{
      clearInterval(positionIntervalId);
      let velocityY = -window.innerHeight * 0.025;
      positionIntervalId = setInterval(()=>{       
        yPos += velocityY;
        velocityY += gravity;
      }, this.refreshRateMs);
    }, 4590);

    //avatars small final bounce
    setTimeout(()=>{
      clearInterval(positionIntervalId);
      let velocityY = - window.innerHeight * 0.015;
      positionIntervalId = setInterval(()=>{       
        yPos += velocityY;
        velocityY += gravity;
      }, this.refreshRateMs);
    }, 5015);

    // avatar faces left towards title in standby position    
    setTimeout(()=>{
    clearInterval(positionIntervalId);
    clearInterval(greetAnimationIntervalId);
    this.ctx.clearRect(0, 0, this.canvas.nativeElement.width, this.canvas.nativeElement.height);
    this.ctx.shadowColor = "transparent";
    this.ctx.drawImage(spriteLibrary.standbyLeftImages[0], xPos, yPos, width, height);    
    this.ctx.shadowColor = "#111111";
    this.ctx.fillText("ASHTON", titleX, titleY);
    this.ctx.fillText("ANTOUN", titleX, titleY+(window.innerHeight * 0.09));
    }, 5275);
  }



}
