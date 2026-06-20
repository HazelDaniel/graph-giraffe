export class TextureJobQueue {
    queue = [];
    workers = [];
    activeJobs = new Map();
    constructor() {
        // Determine worker pool size (max 2 for texture parsing so we don't starve the main thread)
        const hardwareConcurrency = navigator.hardwareConcurrency || 2;
        const numWorkers = Math.min(2, Math.max(1, Math.floor(hardwareConcurrency / 2)));
        for (let i = 0; i < numWorkers; i++) {
            // @ts-ignore
            const worker = new Worker(new URL('./texture-worker.js', import.meta.url), { type: 'module' });
            worker.onmessage = this.handleWorkerMessage.bind(this, worker);
            worker.onerror = this.handleWorkerError.bind(this, worker);
            this.workers.push(worker);
        }
    }
    enqueue(id, svgText, width, height, priority) {
        return new Promise((resolve, reject) => {
            // Deduplicate: if job already exists, just update priority
            const existing = this.queue.find((j) => j.id === id);
            if (existing) {
                existing.priority = Math.min(existing.priority, priority); // Lower number = higher priority
                // Overwrite the resolver to also satisfy the new waiter
                const oldResolve = existing.resolve;
                const oldReject = existing.reject;
                existing.resolve = (bmp) => { oldResolve(bmp); resolve(bmp); };
                existing.reject = (err) => { oldReject(err); reject(err); };
                this.sortQueue();
                return;
            }
            this.queue.push({ id, svgText, width, height, priority, resolve, reject });
            this.sortQueue();
            this.pump();
        });
    }
    cancelAll(prefix) {
        this.queue = this.queue.filter(j => !j.id.startsWith(prefix));
        // We cannot easily abort an active worker job, but we just ignore it when it completes.
    }
    sortQueue() {
        this.queue.sort((a, b) => a.priority - b.priority);
    }
    pump() {
        if (this.queue.length === 0)
            return;
        const job = this.queue.shift();
        const blob = new Blob([job.svgText], { type: "image/svg+xml" });
        createImageBitmap(blob)
            .then((bmp) => job.resolve(bmp))
            .catch((err) => job.reject(err));
        // Call pump again for next jobs
        this.pump();
    }
    handleWorkerMessage(worker, e) {
        const job = this.activeJobs.get(worker);
        if (!job)
            return;
        this.activeJobs.delete(worker);
        const { type, id, bitmap, error } = e.data;
        if (id === job.id) {
            if (type === 'result') {
                job.resolve(bitmap);
            }
            else {
                job.reject(new Error(error));
            }
        }
        this.pump();
    }
    handleWorkerError(worker, e) {
        const job = this.activeJobs.get(worker);
        if (job) {
            job.reject(new Error(e.message));
            this.activeJobs.delete(worker);
        }
        this.pump();
    }
    dispose() {
        for (const worker of this.workers) {
            worker.terminate();
        }
        this.workers = [];
    }
}
//# sourceMappingURL=texture-job-queue.js.map