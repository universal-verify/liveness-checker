# Liveness Checker

A privacy-focused tool for checking that a user is real using their webcome and local facial recognition. All processing happens on the user's device - no data is ever sent to any servers.

## Live Demo

Try the liveness checker directly: [https://universal-verify.github.io/liveness-checker/](https://universal-verify.github.io/liveness-checker/)

## Integration Examples

See how to integrate the liveness checker into your website: [https://universal-verify.github.io/liveness-checker/examples](https://universal-verify.github.io/liveness-checker/examples)

## Installation

```bash
npm install liveness-checker
```

## Usage

```javascript
import livenessChecker from 'liveness-checker';

// Basic usage with async/await
try {
    await livenessChecker.checkLiveness();
    console.log('Liveness check passed');
} catch (error) {
    console.error('Liveness check failed:', error);
}

// Or with .then/.catch
livenessChecker.checkLiveness()
    .then(() => {
        console.log('Liveness check passed');
    })
    .catch((error) => {
        console.error('Liveness check failed:', error);
    });
```

### API Reference

#### `checkLiveness()`

Opens the liveness checker in a new tab and returns a Promise that resolves on success or rejects on error (or if the tab is closed or popup is blocked).

##### Returns

- `Promise<void>`: Resolves if the liveness check is successful, rejects with an error code if it fails, the tab is closed, or the popup is blocked.

##### Possible Rejection Error Codes

- `CANCELLED`: The user closed the liveness check tab before completing the process.
- `POPUP_BLOCKED`: The browser blocked the popup window from opening.
- `WEBCAM_ERROR`: There was an issue accessing the user's webcam (e.g., permission denied or device not found).
- `INTERNAL_ERROR`: An unexpected error occurred during the liveness check process.

## Privacy

The liveness checker processes all data locally on the user's device:

- Video from the user's camera is processed in real-time
- No video or biometric data is ever sent to any servers
- If directed from another website, only the liveness result is shared
- All processing happens in the user's browser

## Legal

This liveness checker provides a basic level of evidence that a user is physically present and real through facial analysis. For use cases requiring higher confidence, we recommend using a comprehensive identity verification solution like [Universal Verify](https://universalverify.com).

The liveness checker is provided "as is" without any warranties, express or implied. Users are responsible for ensuring compliance with applicable laws and regulations regarding identity verification in their jurisdiction.

## License

MPL-2.0

## Credits

This project uses [face-api.js](https://github.com/justadudewhohacks/face-api.js) for facial detection and liveness checking. All processing is done locally on the user's device.