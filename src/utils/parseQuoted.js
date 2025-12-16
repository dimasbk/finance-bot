export function extractQuoted(text) {
    const match = text.match(/"([^"]+)"/);
    return match ? match[1] : null;
}
