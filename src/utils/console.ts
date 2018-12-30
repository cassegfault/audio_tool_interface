export function debug(...args: any){
    console.log('[ DEBUG ]', ...args);
}

export function log(...args: any) {
    console.log(...args);
}

export function warn(...args: any) {
    console.warn(...args);
}

export function error(...args: any) {
    console.error(...args);
}