// src/utils/AudioManager.js
import { Howl, Howler } from 'howler';

class AudioManager {
    constructor() {
        this.sounds = new Map();
        this.isMuted = false;
        this.preloadedCards = new Set(); // Track de cartas precargadas

        this.victorySound = new Howl({
            src: ['/sounds/victoria.mp3'],
            volume: 0.8,
            preload: true
        });

        this.cardSound = new Howl({
            src: ['/sounds/carta.mp3'],
            volume: 0.6,
            preload: true
        });

        // Sonido genérico para cartas no encontradas
        this.genericCardSound = new Howl({
            src: ['/sounds/carta.mp3'],
            volume: 0.5,
            preload: true
        });
    }

    normalizeCardName(cardName) {
        return cardName.toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^a-z0-9-]/g, '')
            .replace('the-', '');
    }

    preloadCardSound(cardName) {
        if (this.preloadedCards.has(cardName)) {
            return; // Ya precargado
        }

        const normalizedName = this.normalizeCardName(cardName);
        const soundPath = `/sounds/cartas/${normalizedName}.mp3`;

        try {
            const sound = new Howl({
                src: [soundPath],
                volume: 0.7,
                preload: true,
                onload: () => {
                    this.preloadedCards.add(cardName);
                },
                onloaderror: (id, error) => {
                    console.warn(`❌ Sonido no encontrado para: ${cardName} (${soundPath})`);
                    // No agregar a preloadedCards para intentar de nuevo después
                }
            });
            
            this.sounds.set(cardName, sound);
        } catch (error) {
            console.warn(`Error al crear sonido para ${cardName}:`, error);
        }
    }

    playCardSound(cardName) {
        if (this.isMuted) return;


        // Intentar con el sonido específico primero
        const specificSound = this.sounds.get(cardName);
        if (specificSound && specificSound.state() === 'loaded') {
            specificSound.play();
            return;
        }

        // Si no existe el sonido específico, precargarlo para la próxima vez
        if (!this.preloadedCards.has(cardName)) {
            this.preloadCardSound(cardName);
        }

        // Usar sonido genérico como fallback
        this.cardSound.play();
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

    // Nuevo método para precargar múltiples cartas
    preloadMultipleCards(cardNames) {
        cardNames.forEach(cardName => {
            this.preloadCardSound(cardName);
        });
    }

    // Método para verificar estado de precarga
    getPreloadStatus() {
        return {
            preloaded: Array.from(this.preloadedCards),
            totalSounds: this.sounds.size
        };
    }
}

export const audioManager = new AudioManager();