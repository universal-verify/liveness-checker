class LivenessChecker {
    constructor() {

    }

    /**
     * Check liveness
     * @returns {Promise} Resolves on success, rejects on error
     */
    checkLiveness(params = {}) {
        return new Promise((resolve, reject) => {
            let settled = false;
            const nonce = Math.random().toString(36).substring(2, 15);
            const url = params.localTesting ? '../index.html' : 'https://universal-verify.github.io/liveness-checker/';
            const origin = params.localTesting ? window.location.origin : 'https://universal-verify.github.io';
            const newTab = window.open(url, '_blank');
            if(!newTab) {
                reject('POPUP_BLOCKED');
                return;
            }

            function cleanup() {
                window.removeEventListener('message', handler);
                clearInterval(tabCheckInterval);
            }

            function handler(event) {
                if(event.source !== newTab) return;
                if(event.data.type === 'liveness-check-result') {
                    if(event.data.nonce !== nonce) return;
                    settled = true;
                    resolve();
                    newTab.close();
                    cleanup();
                } else if(event.data.type === 'liveness-check-error') {
                    if(event.data.nonce !== nonce) return;
                    settled = true;
                    if(event.data.error.includes('webcam')) {
                        reject('WEBCAM_ERROR');
                    } else {
                        reject('INTERNAL_ERROR');
                    }
                    newTab.close();
                    cleanup();
                } else if(event.data.type === 'check-parent-commandeer') {
                    newTab.postMessage({ type: 'confirm-parent-commandeer', nonce }, origin);
                }
            }

            window.addEventListener('message', handler);

            // Check if the tab is closed before resolving/rejecting
            const tabCheckInterval = setInterval(() => {
                if (newTab.closed && !settled) {
                    settled = true;
                    reject('CANCELLED');
                    cleanup();
                }
            }, 500);
        });
    }
}

const livenessChecker = new LivenessChecker();

export { livenessChecker as default };
