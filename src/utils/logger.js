export function log(...msg) {
    console.log(new Date().toISOString(), "[INFO]", ...msg);
}

export function error(...msg) {
    console.error(new Date().toISOString(), "[ERROR]", ...msg);
}
