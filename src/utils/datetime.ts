export const format = (date: Date): string => {
    const y = date.getFullYear();
    const m = ("0" + (date.getMonth() + 1)).slice(-2);
    const d = ("0" + (date.getDate())).slice(-2);
    const h = ("0" + (date.getHours())).slice(-2);
    const mi = ("0" + (date.getMinutes())).slice(-2);
    return `${y}-${m}-${d} ${h}:${mi}`;
};

export const timeDifference = (date: Date): string => {
    const diff = (Date.now() - date.getTime()) / 1000;
    const abs = Math.abs(diff);

    if (abs < 60) {
        return "just now";
    }

    const suffix = diff < 0 ? "after" : "ago";
    if (abs < 3600) {
        const n = Math.floor(abs / 60);
        return `${n} minute${n === 1 ? "" : "s"} ${suffix}`
    }

    if (abs < 86400) {
        const n = Math.floor(abs / 3600);
        return `${n} hour${n === 1 ? "" : "s"} ${suffix}`
    }

    if (abs < 604800) {
        const n = Math.floor(abs / 86400);
        return `${n} day${n === 1 ? "" : "s"} ${suffix}`
    }

    const n = Math.floor(abs / 604800);
    return `${n} week${n === 1 ? "" : "s"} ${suffix}`
};
