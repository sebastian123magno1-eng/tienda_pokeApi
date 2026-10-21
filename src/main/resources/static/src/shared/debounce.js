/**
 * Debounce helper: delays the execution of `callback` until `delayMs`
 * milliseconds have passed since the last call. Every new call restarts the timer.
 *
 * Optional `onTick(remainingMs, progress)` is called every 100 ms so the UI
 * can show a countdown / progress bar while waiting.
 */
export function debounce(callback, delayMs, onTick = null) {
    let timeoutId = null;
    let intervalId = null;

    function cancel() {
        clearTimeout(timeoutId);
        clearInterval(intervalId);
    }

    function debounced(...args) {
        cancel();
        const startedAt = Date.now();

        if (onTick) {
            onTick(delayMs, 0);
            intervalId = setInterval(() => {
                const elapsed = Date.now() - startedAt;
                onTick(Math.max(0, delayMs - elapsed), Math.min(1, elapsed / delayMs));
            }, 100);
        }

        timeoutId = setTimeout(() => {
            clearInterval(intervalId);
            callback(...args);
        }, delayMs);
    }

    debounced.cancel = cancel;
    return debounced;
}
