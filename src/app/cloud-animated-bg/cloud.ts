
/*
 * 
 */
export class Cloud{
    xPos: number;
    yPos: number;    
    private width: number; // relative width as percentage of viewport width. If 
    height: number;
    species: CloudSpecies;
    velocityX: number;
    
    static nearSpeed:number = 10.0;
    static midSpeed:number = 6.0;
    static distantSpeed: number = 3.0; 
    static imageSources: Array<string> = ["../../assets/cloud-sprites/cloud-a.svg",
                                            "../../assets/cloud-sprites/cloud-b.svg",
                                            "../../assets/cloud-sprites/cloud-c.svg",
                                            "../../assets/cloud-sprites/cloud-d.svg",
                                            "../../assets/cloud-sprites/cloud-e.svg"];

    private imageElement: HTMLImageElement;
/**
 * 
 * @param xPos 
 * @param yPos 
 * @param width relative width as percentage of viewport width. ie width of 2 is 2% of viewport-width
 * @param species 
 * @param velocityX 
 */
    constructor(xPos: number, yPos: number, width: number, species: number, velocityX: number){
        /* height should auto scale */
        this.xPos = xPos;
        this.yPos = yPos;
        this.width = width;
        this.velocityX = velocityX;
        this.setCloudSpecies(species);

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

    getImageSource(): String{
        return Cloud.imageSources[this.species];
    }

    setCloudSpecies(species: CloudSpecies): HTMLImageElement{        
        this.species = species;
        let imageElement = new Image();
        imageElement.src = Cloud.imageSources[species] ?? Cloud.imageSources[0];
        return this.setImageElement(imageElement);
    }

    private setImageElement(newImage: HTMLImageElement): HTMLImageElement{
        this.imageElement = newImage;
        return this.imageElement;
    }

    getImageElement() :HTMLImageElement{
        return this.imageElement;
    }

    hasImageElement(): boolean{
        return this.imageElement != null;
    }

    /**
     * Returns width of cloud object in pixel units.
     * Width is calculated as a percentage of viewport width.  
     */
    getWidthPx(): number{
        return (window.innerWidth / 100) * this.width;
    }


}


export enum CloudSpecies{
    a,b,c,d,e
}