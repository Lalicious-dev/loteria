// src/utils/AudioManager.js
class AudioManager {
    constructor() {
        this.sounds = new Map();
        this.audioContext = null;
        this.isEnabled = true;
    }

    // Mapeo de nombres de cartas a archivos de audio
    getCardSoundPath(cardName) {
        const audioMap = {
            // Animales
            'The Hummingbird': '/sounds/cartas/hummingbird.mp3',
            'The Little Devil': '/sounds/cartas/little-devil.mp3',
            'The Panther': '/sounds/cartas/panther.mp3',
            'The Hen': '/sounds/cartas/hen.mp3',
            'The Otter': '/sounds/cartas/otter.mp3',
            'The Deer': '/sounds/cartas/deer.mp3',
            'The Fish': '/sounds/cartas/fish.mp3',
            'The Frog': '/sounds/cartas/frog.mp3',
            'The Shrimp': '/sounds/cartas/shrimp.mp3',
            'The Snake': '/sounds/cartas/snake.mp3',
            'The Spider': '/sounds/cartas/spider.mp3',

            // Personajes
            'The Lady': '/sounds/cartas/lady.mp3',
            'The Catrin': '/sounds/cartas/catrin.mp3',
            'The Black Man': '/sounds/cartas/black-man.mp3',
            'The Soldier': '/sounds/cartas/soldier.mp3',
            'The Apache': '/sounds/cartas/apache.mp3',
            'The Witch': '/sounds/cartas/witch.mp3',

            // Objetos
            'The Umbrella': '/sounds/cartas/umbrella.mp3',
            'The Ladder': '/sounds/cartas/ladder.mp3',
            'The Bottle': '/sounds/cartas/bottle.mp3',
            'The Barrel': '/sounds/cartas/barrel.mp3',
            'The Tree': '/sounds/cartas/tree.mp3',
            'The Melon': '/sounds/cartas/melon.mp3',
            'The Coin': '/sounds/cartas/coin.mp3',
            'The Arduino': '/sounds/cartas/arduino.mp3',
            'The Pear': '/sounds/cartas/pear.mp3',
            'The Flag': '/sounds/cartas/flag.mp3',
            'The Big Mandolin': '/sounds/cartas/big-mandolin.mp3',
            'The Cello': '/sounds/cartas/cello.mp3',
            'The Hand': '/sounds/cartas/hand.mp3',
            'The Boot': '/sounds/cartas/boot.mp3',
            'The Moon': '/sounds/cartas/moon.mp3',
            'The LED': '/sounds/cartas/led.mp3',
            'The Heart': '/sounds/cartas/heart.mp3',
            'The Watermelon': '/sounds/cartas/watermelon.mp3',
            'The Drum': '/sounds/cartas/drum.mp3',
            'The Arrows': '/sounds/cartas/arrows.mp3',
            'The Headphones': '/sounds/cartas/headphones.mp3',
            'The Star': '/sounds/cartas/star.mp3',
            'The Saucepan': '/sounds/cartas/saucepan.mp3',
            'The World': '/sounds/cartas/world.mp3',
            'The Nopal': '/sounds/cartas/nopal.mp3',
            'The Rose': '/sounds/cartas/rose.mp3',
            'The Skull': '/sounds/cartas/skull.mp3',
            'The Bell': '/sounds/cartas/bell.mp3',
            'The Michelada': '/sounds/cartas/michelada.mp3',
            'The Sun': '/sounds/cartas/sun.mp3',
            'The Crown': '/sounds/cartas/crown.mp3',
            'The Chalupa': '/sounds/cartas/chalupa.mp3',
            'The Pine Tree': '/sounds/cartas/pine-tree.mp3',
            'The Tamal': '/sounds/cartas/tamal.mp3',
            'The Flowerpot': '/sounds/cartas/flowerpot.mp3',
            'The Talachas': '/sounds/cartas/talachas.mp3',
            'The Avocado': '/sounds/cartas/avocado.mp3',

            // Sonidos por defecto
            'default': '/sounds/cartag.mp3',
            'victory': '/sounds/victoria.mp3',
            'error': '/sounds/error.mp3'
        };

        return audioMap[cardName] || audioMap['default'];
    }

    async preloadCardSound(cardName) {
        if (!this.isEnabled) return;

        const soundPath = this.getCardSoundPath(cardName);

        try {
            const response = await fetch(soundPath);
            const arrayBuffer = await response.arrayBuffer();
            this.sounds.set(cardName, arrayBuffer);
        } catch (error) {
            console.warn(`No se pudo cargar el sonido para: ${cardName}`, error);
        }
    }

    async playCardSound(cardName) {
        if (!this.isEnabled) return;

        try {
            let audioBuffer = this.sounds.get(cardName);

            if (!audioBuffer) {
                // Precargar si no está cargado
                await this.preloadCardSound(cardName);
                audioBuffer = this.sounds.get(cardName);
            }

            if (audioBuffer) {
                if (!this.audioContext) {
                    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
                }

                const source = this.audioContext.createBufferSource();
                const buffer = await this.audioContext.decodeAudioData(audioBuffer.slice(0));
                source.buffer = buffer;
                source.connect(this.audioContext.destination);
                source.start(0);
            }
        } catch (error) {
            console.warn(`Error reproduciendo sonido para: ${cardName}`, error);
            // Fallback: usar audio HTML simple
            this.playFallbackSound(cardName);
        }
    }

    playFallbackSound(cardName) {
        const soundPath = this.getCardSoundPath(cardName);
        const audio = new Audio(soundPath);
        audio.volume = 0.7;
        audio.play().catch(e => console.warn('Error con audio fallback:', e));
    }

    async playVictory() {
        await this.playCardSound('victory');
    }

    async playError() {
        await this.playCardSound('error');
    }

    enableSounds() {
        this.isEnabled = true;
    }

    disableSounds() {
        this.isEnabled = false;
    }
}

export const audioManager = new AudioManager();