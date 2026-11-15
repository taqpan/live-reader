// fetch の Response.text() は常に UTF-8 として扱うため、
// Shift_JIS や EUC-JP のフィードは文字化けする。
// 旧実装（XMLHttpRequest）と同様に、Content-Type → BOM → XML 宣言の順で文字コードを決める。

function charsetFromContentType(contentType: string | null): string | null {
    const match = contentType?.match(/charset\s*=\s*"?([^";\s]+)"?/i);
    return match?.[1] ?? null;
}

function charsetFromBom(bytes: Uint8Array): string | null {
    if (bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf) return "utf-8";
    if (bytes[0] === 0xfe && bytes[1] === 0xff) return "utf-16be";
    if (bytes[0] === 0xff && bytes[1] === 0xfe) return "utf-16le";
    return null;
}

function charsetFromXmlDeclaration(bytes: Uint8Array): string | null {
    // 先頭部分だけを ASCII として読み、encoding="..." を探す
    const head = new TextDecoder("latin1").decode(bytes.subarray(0, 1024));
    const match = head.match(/^\s*<\?xml[^>]*\bencoding\s*=\s*["']([^"']+)["']/i);
    return match?.[1] ?? null;
}

function createDecoder(charset: string | null): TextDecoder | null {
    if (!charset) return null;
    try {
        return new TextDecoder(charset);
    } catch {
        return null;
    }
}

export function decodeBody(buffer: ArrayBuffer, contentType: string | null): string {
    const bytes = new Uint8Array(buffer);
    const decoder = createDecoder(charsetFromBom(bytes))
        ?? createDecoder(charsetFromContentType(contentType))
        ?? createDecoder(charsetFromXmlDeclaration(bytes))
        ?? new TextDecoder("utf-8");
    return decoder.decode(bytes);
}
