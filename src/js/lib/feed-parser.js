'use strict';

import _ from 'lodash';
import xmljs from 'xml-js';

function asArray(node) {
    if (!node) return [];
    return Array.isArray(node) ? node : [node];
}

function asText(node) {
    if (!node) return '';
    return node._text || node._cdata || '';
}

function parseXmlLikeRss1(obj) {
    const r = { type: 'rss1' };

    const channel = obj.channel;
    if (!channel) throw new Error('[feed-parser] rss1: No channel');

    r.title = asText(channel.title);
    r.url = asText(channel.link);
    r.items = [];
    
    const items = asArray(obj.item);
    asArray(_.get(channel, 'items.rdf:Seq.rdf:li')).forEach((li) => {
        const url = _.get(li, '_attributes.rdf:resource') || null;
        if (url) {
            const item = items.find((item) => _.get(item, '_attributes.rdf:about') === url);
            if (item) {
                const title = asText(item.title);
                r.items.push({ title, url });
            }
        }
    });

    return r;
}


function parseXmlLikeRss2(obj) {
    const r = { type: 'rss2' };

    const channel = obj.channel;
    if (!channel) throw new Error('[feed-parser] rss2: No channel');

    r.title = asText(channel.title);
    r.url = asText(channel.link);
    r.items = [];

    if (channel.item) {
        asArray(channel.item).forEach((item) => {
            const title = asText(item.title);
            const url = asText(item.link);
            if (title && url) {
                r.items.push({ title, url });
            }
        });
    }

    return r;
}


function parseXmlLikeAtom(obj) {
    const r = { type: 'atom' };

    r.title = asText(obj.title);

    const links = asArray(obj.link)
        .filter(link => _.get(link, '_attributes.rel') === 'alternate');
    r.url = _.get(links[0], '_attributes.href') || '';

    r.items = [];
    if (obj.entry) {
        asArray(obj.entry).forEach((entry) => {
            const title = asText(entry.title);
            const url = _.get(entry, 'link._attributes.href') || '';
            if (title && url) {
                r.items.push({ title, url });
            }
        });
    }
    
    return r;
}


function parseFeed(body) {
    const obj = xmljs.xml2js(body, { compact: true });

    if (obj.hasOwnProperty('rdf:RDF')) {
        return parseXmlLikeRss1(obj['rdf:RDF']);
    }
    if (obj.hasOwnProperty('rss')) {
        return parseXmlLikeRss2(obj['rss']);
    }
    if (obj.hasOwnProperty('feed')) {
        return parseXmlLikeAtom(obj['feed']);
    }
    throw new Error('[feed-parser] Unknown feed format.');
}


export async function parse(feedUrl) {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.timeout = 15000;
        xhr.onreadystatechange = () => {
            if (xhr.readyState !== XMLHttpRequest.DONE) {
                return;
            }

            if (xhr.status !== 200) {
                reject(`HTTP Error ${feedUrl}`);
                return;
            }

            try {
                const result = parseFeed(xhr.response);
                // console.log('[feed-parser]', result);
                resolve(result);
            } catch (err) {
                reject(`Failed to parse a feed: ${feedUrl}`);
            }
        };
    
        xhr.open('GET', feedUrl, true);
        xhr.responseType = 'text';
        xhr.send();
    });
}