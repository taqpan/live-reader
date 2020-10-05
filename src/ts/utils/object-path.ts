export function resolveObjectPath(obj: any, path: string): any {
    return path.split(".").reduce((prev, k) => prev ? prev[k] : undefined, obj);
}
