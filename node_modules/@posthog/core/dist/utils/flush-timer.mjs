import { safeSetTimeout } from "./index.mjs";
class FlushTimer {
    constructor(_onFire){
        this._onFire = _onFire;
        this._firesAt = 0;
    }
    get pending() {
        return !!this._timer;
    }
    arm(delayMs) {
        this.clear();
        this._firesAt = Date.now() + delayMs;
        this._timer = safeSetTimeout(()=>{
            this._timer = void 0;
            this._onFire();
        }, delayMs);
    }
    armNoEarlierThan(delayMs) {
        if (this._timer && Date.now() + delayMs <= this._firesAt) return;
        this.arm(delayMs);
    }
    clear() {
        if (this._timer) {
            clearTimeout(this._timer);
            this._timer = void 0;
        }
    }
}
export { FlushTimer };
