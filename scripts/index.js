class Main {
    constructor() {
        this.intro = document.getElementById('intro');
        this.consentForm = document.getElementById('consent-form');
        this.loadingSection = document.getElementById('loading-section');
        this.webcamSection = document.getElementById('webcam-section');
        this.videoElement = document.getElementById('webcam');
        this.stream = null;
        this._parentWillTakeControl = false;
        this.loadModels();

        this.initializeEventListeners();
        this.setupPostMessageListeners();
    }

    async initializeEventListeners() {
        if (this.consentForm) {
            this.consentForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const consentCheckbox = document.getElementById('biometric-consent');
                if (consentCheckbox.checked) {
                    this.requestWebcamAccess();
                }
            });
        }

        // Add try again button listener
        const tryAgainBtn = document.querySelector('.try-again-btn');
        if (tryAgainBtn) {
            tryAgainBtn.addEventListener('click', () => {
                document.getElementById('results-section').style.display = 'none';
                this.requestWebcamAccess();
            });
        }
    }

    setupPostMessageListeners() {
        if(window.opener) {
            window.addEventListener('message', (event) => {
                if(event.data.type === 'confirm-parent-commandeer') {
                    this._nonce = event.data.nonce;
                    this._parentWillTakeControl = true;
                }
            });
            window.opener.postMessage({ type: 'check-parent-commandeer' }, '*');
        }
    }

    async loadModels() {
        try {
            this.promises = Promise.all([
                faceapi.nets.tinyFaceDetector.loadFromUri('./models'),
                faceapi.nets.faceLandmark68Net.loadFromUri('./models')
            ]).catch(() => {
                console.error('Error loading models');
                this.promises = null;
            });
        } catch (error) {
            console.error('Error loading models');
            this.promises = null;
        }
    }

    displayModelError() {
        if(this._parentWillTakeControl) {
            window.opener.postMessage({ type: 'liveness-check-error', error: 'Error loading models', nonce: this._nonce }, '*');
            return;
        }
        this.intro.style.display = 'none';
        this.consentForm.style.display = 'none';
        this.loadingSection.style.display = 'none';
        document.getElementById('model-error').style.display = 'block';
    }

    async requestWebcamAccess() {
        try {
            if(!this.promises) {
                this.displayModelError();
                return;
            }

            this.intro.style.display = 'none';
            this.consentForm.style.display = 'none';

            this.loadingSection.style.display = 'block';
            await new Promise(resolve => setTimeout(resolve, 200));
            try {
                await this.promises;
            } catch (error) {
                this.displayModelError();
                return;
            }

            this.stream = await navigator.mediaDevices.getUserMedia({ video: true });
            this.videoElement.onloadedmetadata = () => {
                this.videoElement.play();
                this.startLivenessCheck();
            };
            this.videoElement.srcObject = this.stream;
            this.webcamSection.style.display = 'block';
            this.loadingSection.style.display = 'none';
            
        } catch (error) {
            console.error('Error accessing webcam:', error);
            if(this._parentWillTakeControl) {
                window.opener.postMessage({ type: 'liveness-check-error', error: 'Error accessing webcam', nonce: this._nonce }, '*');
                return;
            }
            alert('Unable to access webcam. Please ensure you have granted permission and your webcam is working properly.');
        }
    }

    async startLivenessCheck() {
        let direction = 'to your left';
        let flipped = false;
        const processFrame = async () => {
            try {
                const detection = await faceapi.detectSingleFace(
                    this.videoElement,
                    new faceapi.TinyFaceDetectorOptions()
                ).withFaceLandmarks();

                if (detection) {
                    this.webcamSection.querySelector('p').textContent = 'Please look ' + direction;

                    //check if the face is looking to the left or right
                    let leftEye = detection.landmarks.getLeftEye()[0].x;
                    let rightEye = detection.landmarks.getRightEye()[0].x;
                    let nose = detection.landmarks.getNose()[0].x;
                    if(direction == 'to your left' && nose < leftEye) {//looking left
                        direction = 'to your right';
                    } else if(direction == 'to your left' && nose > rightEye) {//looking left flipped
                        direction = 'to your right';
                        flipped = true;
                    } else if(direction == 'to your right' && !flipped && nose > rightEye) {//looking right
                        direction = 'straight';
                    } else if(direction == 'to your right' && flipped && nose < leftEye) {//looking right flipped
                        direction = 'straight';
                    } else if(direction == 'straight' && detection.detection.score > 0.85){
                        if(this._parentWillTakeControl) {
                            this.sendLivenessToParent();
                            return;
                        }
                        this.displayLiveness();
                        return;
                    }

                } else {
                    this.webcamSection.querySelector('p').textContent = 'No face detected. Please position your face in the camera view.';
                }
            } catch (error) {
                console.error('Error processing frame:', error);
            }

            setTimeout(() => processFrame(), 250);
        };

        // Start processing frames
        processFrame();
    }

    sendLivenessToParent() {
        const checkmarkOverlay = document.getElementById('checkmark-overlay');
        checkmarkOverlay.classList.remove('hidden');
        
        setTimeout(() => {
            this.stopWebcam();
            window.opener.postMessage({ type: 'liveness-check-result', nonce: this._nonce }, '*');
        }, 1000);
    }

    displayLiveness() {
        this.webcamSection.style.display = 'none';
        const resultsSection = document.getElementById('results-section');
        resultsSection.style.display = 'block';
    }

    stopWebcam() {
        if (this.stream) this.stream.getTracks().forEach(track => track.stop());
    }
}

let main = new Main();
export default main;
