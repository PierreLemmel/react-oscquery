import type { RGBA } from "./color";

export type OSCPath = `/${string}`;

export const isOSCPath = (path: string): path is OSCPath => {
    const oscPathRegex = /^\/([#A-Za-z0-9_\-]+(\/[#A-Za-z0-9_\-]+)*)?$/;
    return oscPathRegex.test(path);
}

export const sanitizeOSCPath = (path: string): string => {

    if (!path.startsWith("/")) path = "/" + path;

    return path
        .replace(/\/+/g, "/")
        .replace(/ /g, "_");
}

type OSCArg = number | string | Uint8Array | boolean | null | RGBA;

interface OSCMessage {
    address: string;
    args: OSCArg[];
}

type ValueNewOffset<T> = {
    value: T;
    newOffset: number;
}

function readOscString(dataView: DataView, offset: number): ValueNewOffset<string> {
    let endIndex = offset;
    while (dataView.getUint8(endIndex) !== 0x00) {
        endIndex++;
    }

    const stringBytes = new Uint8Array(dataView.buffer, offset, endIndex - offset);
    const value = new TextDecoder().decode(stringBytes);


    const paddedLength = Math.ceil((endIndex - offset + 1) / 4) * 4;
    return { value, newOffset: offset + paddedLength };
}


function readOscBlob(dataView: DataView, offset: number): ValueNewOffset<Uint8Array> {
    const size = dataView.getInt32(offset);
    offset += 4;

    const value = new Uint8Array(dataView.buffer, offset, size);

    const paddedLength = Math.ceil(size / 4) * 4;
    return { value, newOffset: offset + paddedLength };
}


export function parseOscMessage(dataView: DataView): OSCMessage | null {
    let offset = 0;

    // 1. Read Address Pattern
    const { value: address, newOffset: addressOffset } = readOscString(
        dataView,
        offset,
    );
    offset = addressOffset;

    if (!address.startsWith('/')) {
        console.error('OSC message address must start with "/"');
        return null;
    }


    // 2. Read Type Tag String
    const { value: typeTags, newOffset: typeTagsOffset } = readOscString(
        dataView,
        offset,
    );
    offset = typeTagsOffset;

    if (typeTags.length > 0 && typeTags[0] !== ',') {
        console.error('OSC type tag string must be empty or start with ","');
        return null;
    }

    const args: OSCArg[] = [];
    const actualTypeTags = typeTags.slice(1); // Remove the leading comma

    
    // 3. Read Arguments based on Type Tags
    for (let i = 0; i < actualTypeTags.length; i++) {
        const tag = actualTypeTags[i];

        switch (tag) {
            case 'i':
                args.push(dataView.getInt32(offset));
                offset += 4;
                break;
            case 'f':
                args.push(dataView.getFloat32(offset));
                offset += 4;
                break;
            case 's':
                {
                    const { value, newOffset } = readOscString(dataView, offset);
                    args.push(value);
                    offset = newOffset;
                }
                break;
            case 'b':
                {
                    const { value, newOffset } = readOscBlob(dataView, offset);
                    args.push(value);
                    offset = newOffset;
                }
                break;
            case 'h':
                args.push(dataView.getInt32(offset));
                args.push(dataView.getUint32(offset + 4));
                offset += 8;
                break;
            case 't':
                args.push(dataView.getInt32(offset));
                args.push(dataView.getUint32(offset + 4));
                offset += 8;
                break;
            case 'd':
                args.push(dataView.getFloat64(offset));
                offset += 8;
                break;
            case 'S':
                {
                    const { value, newOffset } = readOscString(dataView, offset);
                    args.push(value);
                    offset = newOffset;
                }
                break;
            case 'c':
                args.push(String.fromCharCode(dataView.getUint8(offset)));
                offset += 1;
                break;
            case 'm':
                args.push(new Uint8Array(dataView.buffer, offset, 4));
                offset += 4;
                break;
            case 'T':
                args.push(true);
                break;
            case 'F':
                args.push(false);
                break;
            case 'N':
                args.push(null);
                break;
            case 'I':
                break;
            case 'r':
                const uint32 = dataView.getUint32(offset);
                const r = (uint32 >> 24) & 0xFF;
                const g = (uint32 >> 16) & 0xFF;
                const b = (uint32 >> 8) & 0xFF;
                const a = uint32 & 0xFF;

                args.push({
                    r: r,
                    g: g,
                    b: b,
                    a: a,
                });
                offset += 4;
                break;
            default:
                console.warn(`Unknown OSC type tag: ${tag}. Skipping argument.`);
                break;
        }
    }

    return { address, args };
}