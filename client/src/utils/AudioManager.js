import { Howl } from 'howler';


class AudioManager {
    constructor() {
        this.sounds = new Map();
        this.isMuted = false;

        this.victorySound = new Howl({
            src: ['/sounds/victoria.mp3'],
            volume: 0.8
        });

        this.cardSound = new Howl({
            src: ['/sounds/carta.mp3'],
            volume: 0.6
        });
    }

    // Convertir nombres a formato de archivo seguro
    normalizeCardName(cardName) {
        return cardName.toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^a-z0-9-]/g, '')
            .replace('the-', ''); // Remover "The" si existe
    }

    preloadCardSound(cardName) {
        const normalizedName = this.normalizeCardName(cardName);
        const soundPath = `/sounds/cartas/${normalizedName}.mp3`;

        const sound = new Howl({
            src: [soundPath],
            volume: 0.7,
            onloaderror: () => {
                console.log(`Sonido para ${cardName} (${normalizedName}) no encontrado`);
            }
        });
        this.sounds.set(cardName, sound);
    }

    playCardSound(cardName) {
        if (this.isMuted) return;

        const specificSound = this.sounds.get(cardName);
        if (specificSound) {
            specificSound.play();
        } else {
            this.cardSound.play();
        }
    }


    playVictory() {
        if (this.isMuted) return;
        this.victorySound.play();
    }
    toggleMute() {
        this.isMuted = !this.isMuted;
        Howler.mute(this.isMuted);
        return this.isMuted;
    }

}

export const audioManager = new AudioManager();