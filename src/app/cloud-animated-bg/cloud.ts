export class Cloud{
    xPos: number;
    yPos: number;    
    width: number;
    height: number;
    species: CloudSpecies;
    velocityX: number;
    
    static nearSpeed:number = 10.0;
    static midSpeed:number = 6.0;
    static distantSpeed: number = 3.0; 
    

    constructor(xPos: number, yPos: number, width: number, height: number, species: number, velocityX: number){

    }

    /*
     * To create a parallax effect, larger clouds are "closer" and move faster
       than smaller clouds which are "further away" and appear to move more slowly. 
     */
    getSpeed(): number{
        return Cloud.nearSpeed;
    }

    updatePosition(): void{
        this.xPos += this.velocityX;
    }


}


export enum CloudSpecies{
    a,b,c,d,e
}