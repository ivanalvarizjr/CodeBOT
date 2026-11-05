import { platform, release } from "node:os";
import { osResourceAttributes } from "@posthog/core";
function hostOsResourceAttributes() {
    let osName;
    let osVersion;
    try {
        osName = platform();
        osVersion = release();
    } catch  {}
    return osResourceAttributes(osName, osVersion);
}
export { hostOsResourceAttributes };
