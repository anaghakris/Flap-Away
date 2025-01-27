class AssetManager {
    constructor() {
        this.successCount = 0;
        this.errorCount = 0;
        this.cache = {};
        this.downloadQueue = [];
    }

    queueDownload(path) {
        console.log("Queueing " + path);
        this.downloadQueue.push(path);
    }

    isDone() {
        return this.downloadQueue.length === this.successCount + this.errorCount;
    }

    downloadAll(callback) {
        if (this.downloadQueue.length === 0) setTimeout(callback, 10);
        for (let i = 0; i < this.downloadQueue.length; i++) {
            const path = this.downloadQueue[i];
            const extension = path.split(".").pop().toLowerCase();

            if (["png", "jpg", "jpeg", "gif"].includes(extension)) {
                const img = new Image();
                img.addEventListener("load", () => {
                    console.log("Loaded " + img.src);
                    this.successCount++;
                    if (this.isDone()) callback();
                });
                img.addEventListener("error", () => {
                    console.log("Error loading " + img.src);
                    this.errorCount++;
                    if (this.isDone()) callback();
                });
                img.src = path;
                this.cache[path] = img;

            } else if (["wav", "mp3", "ogg"].includes(extension)) {
                const audio = new Audio();
                audio.addEventListener("canplaythrough", () => {
                    console.log("Loaded " + audio.src);
                    this.successCount++;
                    if (this.isDone()) callback();
                });
                audio.addEventListener("error", () => {
                    console.log("Error loading " + audio.src);
                    this.errorCount++;
                    if (this.isDone()) callback();
                });
                audio.src = path;
                this.cache[path] = audio;

            } else {
                console.log("Unsupported file type: " + path);
                this.errorCount++;
                if (this.isDone()) callback();
            }
        }
    }

    getAsset(path) {
        return this.cache[path];
    }
}
