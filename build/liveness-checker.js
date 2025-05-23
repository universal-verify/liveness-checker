class LivenessChecker {
    constructor() {

    }

    /**
     * Check liveness
     * @param {Object} params - The parameters for the liveness check
     * @param {Function} params.successCallback - The callback function to call if the liveness check is successful (optional)
     * @param {Function} params.errorCallback - The callback function to call if the liveness check fails (optional)
     */
    checkLiveness(params = {}) {
        let nonce = Math.random().toString(36).substring(2, 15);
        let url = params.localTesting ? '../index.html' : 'https://universal-verify.github.io/liveness-checker/';
        let origin = params.localTesting ? window.location.origin : 'https://universal-verify.github.io';
        const newTab = window.open(url, '_blank');
        window.addEventListener('message', (event) => {
            if(event.source !== newTab) return;
            if(event.data.type === 'liveness-check-result') {
                if(event.data.nonce !== nonce) return;
                if(params.successCallback) {
                    params.successCallback();
                } else {
                    console.log('Missing successCallback for liveness check');
                }
                newTab.close();
            } else if(event.data.type === 'liveness-check-error') {
                if(params.errorCallback) {
                    if(event.data.nonce !== nonce) return;
                    params.errorCallback(event.data.error);
                } else {
                    console.log('Missing errorCallback for liveness check');
                }
                newTab.close();
            } else if(event.data.type === 'check-parent-commandeer') {
                newTab.postMessage({ type: 'confirm-parent-commandeer', nonce }, origin);
            }
        });
    }
}

const livenessChecker = new LivenessChecker();

export { livenessChecker as default };
