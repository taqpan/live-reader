export function dom2obj(element: Element) : any {
    const props = [
        ...Array.prototype.slice.call(element.attributes)
            .map((attr: Attr) => ({ name: attr.name, child: attr.textContent as any })),
        ...Array.prototype.slice.call(element.children)
            .map((child: Element) => ({ name: child.tagName, child: dom2obj(child) })),
        ...Array.prototype.slice.call(element.childNodes)
            .filter((node: Node) =>
                node.nodeType == Node.TEXT_NODE ||
                node.nodeType == Node.CDATA_SECTION_NODE)
            .map((node: Node) => ({ name: node.nodeName, child: node.textContent })),
    ];

    const map = new Map<string, any>();
    for (const prop of props) {
        if (map.has(prop.name)) {
            const v = map.get(prop.name);
            if (Array.isArray(v)) {
                map.set(prop.name, v.concat([prop.child]));
            } else {
                map.set(prop.name, [v, prop.child]);
            }
        } else {
            map.set(prop.name, prop.child);
        }
    }

    const r: any = {};
    map.forEach((v, k) => r[k] = v);
    return r;
}
