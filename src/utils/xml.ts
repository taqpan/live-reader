import { XMLParser } from "fast-xml-parser";

/** 属性名に付ける接頭辞（子要素名との衝突を避けるため） */
export const ATTR = "@_";
/** テキストノード（CDATA を含む）のキー */
export const TEXT = "#text";

// DOMParser を使わない XML パーサ。
// MV3 の service worker には DOMParser がないため、background でもパースできるようにする。
const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: ATTR,
    textNodeName: TEXT,
    alwaysCreateTextNode: true,
    parseTagValue: false,
    parseAttributeValue: false,
    trimValues: true,
    processEntities: true,
    htmlEntities: true,
    ignoreDeclaration: true,
    ignorePiTags: true,
});

export type XmlNode = Record<string, unknown>;

export function parseXml(xml: string): XmlNode {
    return parser.parse(xml) as XmlNode;
}

/** ルート要素の名前と中身を返す */
export function rootElement(doc: XmlNode): [string, XmlNode] | null {
    const name = Object.keys(doc).find((k) => !k.startsWith("?") && k !== TEXT);
    if (!name) return null;
    const node = doc[name];
    return [name, isNode(node) ? node : {}];
}

export function isNode(value: unknown): value is XmlNode {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function asArray(value: unknown): XmlNode[] {
    if (value === undefined || value === null) return [];
    const list = Array.isArray(value) ? value : [value];
    return list.map((v) => (isNode(v) ? v : { [TEXT]: String(v) }));
}

export function child(node: unknown, name: string): XmlNode | undefined {
    if (!isNode(node)) return undefined;
    return asArray(node[name])[0];
}

export function text(node: unknown): string {
    if (!isNode(node)) return "";
    const value = node[TEXT];
    return typeof value === "string" ? value.trim() : "";
}

export function attr(node: unknown, name: string): string {
    if (!isNode(node)) return "";
    const value = node[ATTR + name];
    return typeof value === "string" ? value.trim() : "";
}
