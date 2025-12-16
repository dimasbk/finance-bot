export function todayKey() {
    return new Date().toISOString().slice(0, 10);
}

export function currentMonth() {
    return new Date().toISOString().slice(0, 7);
}
