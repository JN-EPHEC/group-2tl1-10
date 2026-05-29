class AudioManager {
    private currentAudio: HTMLAudioElement | null = null;
    public isPlaying: boolean = false;

    // Fonction pour jouer un son
    play(url: string, loop: boolean = false) {
        // Si un son tourne déjà, on rejette la demande silencieusement
        if (this.isPlaying) {
            console.log("Un son est déjà en cours, demande ignorée.");
            return;
        }

        this.currentAudio = new Audio(url);
        this.currentAudio.loop = loop;
        this.isPlaying = true;

        this.currentAudio.play().catch(err => {
            console.error("Le navigateur a bloqué l'audio (interaction requise) :", err);
            this.isPlaying = false; // On libère le verrou si ça plante
        });

        // Quand le fichier est terminé (s'il ne boucle pas), on libère le verrou
        this.currentAudio.onended = () => {
            this.isPlaying = false;
            this.currentAudio = null;
        };
    }

    // Fonction pour forcer l'arrêt (utile pour couper la musique et lancer le rickroll)
    stop() {
        if (this.currentAudio) {
            this.currentAudio.pause();
            this.currentAudio.currentTime = 0; // Remet à zéro
            this.isPlaying = false;
            this.currentAudio = null;
        }
    }
}

// On exporte une instance unique pour que toute l'application partage le même verrou
export const audioManager = new AudioManager();