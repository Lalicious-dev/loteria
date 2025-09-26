import {Howl} from 'howler';


class AudioManager{
    constructor(){
        this.sounds=new Map();
        this.isMuted=false;

        //Se precargan sonidos básico
        this.victorySound= new Howl({
            src:['/sounds/victoria.mp3'],
            volume:0.8
        });

        this.cardSound=new Howl({
            src:['/sounds/carta.mp3'],
            volume:0.6
        });
    }

    //Se precargan sonidos especificos para cada carta
    preloadCardSound(cardName){
        const soundPath=`/sounds/cartas/${cardName.toLowerCase().replace(/\s+/g,'-')}.mp3`;
        const sound= new Howl({
            src:[soundPath],
            volume: 0.7,
            onloaderror:()=>{
                console.log(`Sonido para ${cardName} no encontrado, usando genérico`);
            }
        });
        this.sounds.set(cardName,sound);
    }

    playCardSound(cardName){
        if(this.isMuted) return;
        const specificSound=this.sounds.get(cardName);
        if(specificSound){
            specificSound.play();
        } else {
            this.cardSound.play();
        }
    }

    playVictory(){
        if(this.isMuted) return;
        this.victorySound.play();
    }
    toggleMute(){
        this.isMuted= !this.isMuted;
        Howler.mute(this.isMuted);
        return this.isMuted;
    }
    
}

export const audioManager= new AudioManager();