export const colorFormats = [
    "rgb",
    "rgba",
    "hsv",
    "hsva",
    "hsl",
    "hsla",
    "hex",
    "named"
] as const;

export type ColorFormat = typeof colorFormats[number];

export type RGB = {
    r: number; // 0-255
    g: number; // 0-255 
    b: number; // 0-255
}

export type RGBA = RGB & {
    a: number; // 0-1
}

export type HSV = {
    h: number; // 0-360
    s: number; // 0-100
    v: number; // 0-100
}

export type HSVA = HSV & {
    a: number; // 0-1
}

export type NumberArrayColor = [
    number, // 0-1
    number, // 0-1
    number, // 0-1
    number, // 0-1
]

export type HEX = string; // #RRGGBB or #RRGGBBAA

export const namedColors = [
    "aliceblue",
    "antiquewhite",
    "aqua",
    "aquamarine",
    "azure",
    "beige",
    "bisque",
    "black",
    "blanchedalmond",
    "blue",
    "blueviolet",
    "brown",
    "burlywood",
    "cadetblue",
    "chartreuse",
    "chocolate",
    "coral",
    "cornflowerblue",
    "cornsilk",
    "crimson",
    "cyan",
    "darkblue",
    "darkcyan",
    "darkgoldenrod",
    "darkgray",
    "darkgreen",
    "darkgrey",
    "darkkhaki",
    "darkmagenta",
    "darkolivegreen",
    "darkorange",
    "darkorchid",
    "darkred",
    "darksalmon",
    "darkseagreen",
    "darkslateblue",
    "darkslategray",
    "darkslategrey",
    "darkturquoise",
    "darkviolet",
    "deeppink",
    "deepskyblue",
    "dimgray",
    "dimgrey",
    "dodgerblue",
    "firebrick",
    "floralwhite",
    "forestgreen",
    "fuchsia",
    "gainsboro",
    "ghostwhite",
    "gold",
    "goldenrod",
    "gray",
    "green",
    "greenyellow",
    "grey",
    "honeydew",
    "hotpink",
    "indianred",
    "indigo",
    "ivory",
    "khaki",
    "lavender",
    "lavenderblush",
    "lawngreen",
    "lemonchiffon",
    "lightblue",
    "lightcoral",
    "lightcyan",
    "lightgoldenrodyellow",
    "lightgray",
    "lightgreen",
    "lightgrey",
    "lightpink",
    "lightsalmon",
    "lightseagreen",
    "lightskyblue",
    "lightslategray",
    "lightslategrey",
    "lightsteelblue",
    "lightyellow",
    "lime",
    "limegreen",
    "linen",
    "magenta",
    "maroon",
    "mediumaquamarine",
    "mediumblue",
    "mediumorchid",
    "mediumpurple",
    "mediumseagreen",
    "mediumslateblue",
    "mediumspringgreen",
    "mediumturquoise",
    "mediumvioletred",
    "midnightblue",
    "mintcream",
    "mistyrose",
    "moccasin",
    "navajowhite",
    "navy",
    "oldlace",
    "olive",
    "olivedrab",
    "orange",
    "orangered",
    "orchid",
    "palegoldenrod",
    "palegreen",
    "paleturquoise",
    "palevioletred",
    "papayawhip",
    "peachpuff",
    "peru",
    "pink",
    "plum",
    "powderblue",
    "purple",
    "rebeccapurple",
    "red",
    "rosybrown",
    "royalblue",
    "saddlebrown",
    "salmon",
    "sandybrown",
    "seagreen",
    "seashell",
    "sienna",
    "silver",
    "skyblue",
    "slateblue",
    "slategray",
    "slategrey",
    "snow",
    "springgreen",
    "steelblue",
    "tan",
    "teal",
    "thistle",
    "tomato",
    "turquoise",
    "violet",
    "wheat",
    "white",
    "whitesmoke",
    "yellow",
    "yellowgreen",
] as const;

export type NamedColor = typeof namedColors[number];

export type Color = RGB | RGBA | HSV | HEX | NamedColor | NumberArrayColor;

const namedColorMap: { [key in NamedColor]: RGB } = {
    aliceblue: { r: 240, g: 248, b: 255 },
    antiquewhite: { r: 250, g: 235, b: 215 },
    aqua: { r: 0, g: 255, b: 255 },
    aquamarine: { r: 127, g: 255, b: 212 },
    azure: { r: 240, g: 255, b: 255 },
    beige: { r: 245, g: 245, b: 220 },
    bisque: { r: 255, g: 228, b: 196 },
    black: { r: 0, g: 0, b: 0 },
    blanchedalmond: { r: 255, g: 235, b: 205 },
    blue: { r: 0, g: 0, b: 255 },
    blueviolet: { r: 138, g: 43, b: 226 },
    brown: { r: 165, g: 42, b: 42 },
    burlywood: { r: 222, g: 184, b: 135 },
    cadetblue: { r: 95, g: 158, b: 160 },
    chartreuse: { r: 127, g: 255, b: 0 },
    chocolate: { r: 210, g: 105, b: 30 },
    coral: { r: 255, g: 127, b: 80 },
    cornflowerblue: { r: 100, g: 149, b: 237 },
    cornsilk: { r: 255, g: 248, b: 220 },
    crimson: { r: 220, g: 20, b: 60 },
    cyan: { r: 0, g: 255, b: 255 },
    darkblue: { r: 0, g: 0, b: 139 },
    darkcyan: { r: 0, g: 139, b: 139 },
    darkgoldenrod: { r: 184, g: 134, b: 11 },
    darkgray: { r: 169, g: 169, b: 169 },
    darkgreen: { r: 0, g: 100, b: 0 },
    darkgrey: { r: 169, g: 169, b: 169 },
    darkkhaki: { r: 189, g: 183, b: 107 },
    darkmagenta: { r: 139, g: 0, b: 139 },
    darkolivegreen: { r: 85, g: 107, b: 47 },
    darkorange: { r: 255, g: 140, b: 0 },
    darkorchid: { r: 153, g: 50, b: 204 },
    darkred: { r: 139, g: 0, b: 0 },
    darksalmon: { r: 233, g: 150, b: 122 },
    darkseagreen: { r: 143, g: 188, b: 143 },
    darkslateblue: { r: 72, g: 61, b: 139 },
    darkslategray: { r: 47, g: 79, b: 79 },
    darkslategrey: { r: 47, g: 79, b: 79 },
    darkturquoise: { r: 0, g: 206, b: 209 },
    darkviolet: { r: 148, g: 0, b: 211 },
    deeppink: { r: 255, g: 20, b: 147 },
    deepskyblue: { r: 0, g: 191, b: 255 },
    dimgray: { r: 105, g: 105, b: 105 },
    dimgrey: { r: 105, g: 105, b: 105 },
    dodgerblue: { r: 30, g: 144, b: 255 },
    firebrick: { r: 178, g: 34, b: 34 },
    floralwhite: { r: 255, g: 250, b: 240 },
    forestgreen: { r: 34, g: 139, b: 34 },
    fuchsia: { r: 255, g: 0, b: 255 },
    gainsboro: { r: 220, g: 220, b: 220 },
    ghostwhite: { r: 248, g: 248, b: 255 },
    gold: { r: 255, g: 215, b: 0 },
    goldenrod: { r: 218, g: 165, b: 32 },
    gray: { r: 128, g: 128, b: 128 },
    green: { r: 0, g: 128, b: 0 },
    greenyellow: { r: 173, g: 255, b: 47 },
    grey: { r: 128, g: 128, b: 128 },
    honeydew: { r: 240, g: 255, b: 240 },
    hotpink: { r: 255, g: 105, b: 180 },
    indianred: { r: 205, g: 92, b: 92 },
    indigo: { r: 75, g: 0, b: 130 },
    ivory: { r: 255, g: 255, b: 240 },
    khaki: { r: 240, g: 230, b: 140 },
    lavender: { r: 230, g: 230, b: 250 },
    lavenderblush: { r: 255, g: 240, b: 245 },
    lawngreen: { r: 124, g: 252, b: 0 },
    lemonchiffon: { r: 255, g: 250, b: 205 },
    lightblue: { r: 173, g: 216, b: 230 },
    lightcoral: { r: 240, g: 128, b: 128 },
    lightcyan: { r: 224, g: 255, b: 255 },
    lightgoldenrodyellow: { r: 250, g: 250, b: 210 },
    lightgray: { r: 211, g: 211, b: 211 },
    lightgreen: { r: 144, g: 238, b: 144 },
    lightgrey: { r: 211, g: 211, b: 211 },
    lightpink: { r: 255, g: 182, b: 193 },
    lightsalmon: { r: 255, g: 160, b: 122 },
    lightseagreen: { r: 32, g: 178, b: 170 },
    lightskyblue: { r: 135, g: 206, b: 250 },
    lightslategray: { r: 119, g: 136, b: 153 },
    lightslategrey: { r: 119, g: 136, b: 153 },
    lightsteelblue: { r: 176, g: 196, b: 222 },
    lightyellow: { r: 255, g: 255, b: 224 },
    lime: { r: 0, g: 255, b: 0 },
    limegreen: { r: 50, g: 205, b: 50 },
    linen: { r: 250, g: 240, b: 230 },
    magenta: { r: 255, g: 0, b: 255 },
    maroon: { r: 128, g: 0, b: 0 },
    mediumaquamarine: { r: 102, g: 205, b: 170 },
    mediumblue: { r: 0, g: 0, b: 205 },
    mediumorchid: { r: 186, g: 85, b: 211 },
    mediumpurple: { r: 147, g: 112, b: 219 },
    mediumseagreen: { r: 60, g: 179, b: 113 },
    mediumslateblue: { r: 123, g: 104, b: 238 },
    mediumspringgreen: { r: 0, g: 250, b: 154 },
    mediumturquoise: { r: 72, g: 209, b: 204 },
    mediumvioletred: { r: 199, g: 21, b: 133 },
    midnightblue: { r: 25, g: 25, b: 112 },
    mintcream: { r: 245, g: 255, b: 250 },
    mistyrose: { r: 255, g: 228, b: 225 },
    moccasin: { r: 255, g: 228, b: 181 },
    navajowhite: { r: 255, g: 222, b: 173 },
    navy: { r: 0, g: 0, b: 128 },
    oldlace: { r: 253, g: 245, b: 230 },
    olive: { r: 128, g: 128, b: 0 },
    olivedrab: { r: 107, g: 142, b: 35 },
    orange: { r: 255, g: 165, b: 0 },
    orangered: { r: 255, g: 69, b: 0 },
    orchid: { r: 218, g: 112, b: 214 },
    palegoldenrod: { r: 238, g: 232, b: 170 },
    palegreen: { r: 152, g: 251, b: 152 },
    paleturquoise: { r: 175, g: 238, b: 238 },
    palevioletred: { r: 219, g: 112, b: 147 },
    papayawhip: { r: 255, g: 239, b: 213 },
    peachpuff: { r: 255, g: 218, b: 185 },
    peru: { r: 205, g: 133, b: 63 },
    pink: { r: 255, g: 192, b: 203 },
    plum: { r: 221, g: 160, b: 221 },
    powderblue: { r: 176, g: 224, b: 230 },
    purple: { r: 128, g: 0, b: 128 },
    rebeccapurple: { r: 102, g: 51, b: 153 },
    red: { r: 255, g: 0, b: 0 },
    rosybrown: { r: 188, g: 143, b: 143 },
    royalblue: { r: 65, g: 105, b: 225 },
    saddlebrown: { r: 139, g: 69, b: 19 },
    salmon: { r: 250, g: 128, b: 114 },
    sandybrown: { r: 244, g: 164, b: 96 },
    seagreen: { r: 46, g: 139, b: 87 },
    seashell: { r: 255, g: 245, b: 238 },
    sienna: { r: 160, g: 82, b: 45 },
    silver: { r: 192, g: 192, b: 192 },
    skyblue: { r: 135, g: 206, b: 235 },
    slateblue: { r: 106, g: 90, b: 205 },
    slategray: { r: 112, g: 128, b: 144 },
    slategrey: { r: 112, g: 128, b: 144 },
    snow: { r: 255, g: 250, b: 250 },
    springgreen: { r: 0, g: 255, b: 127 },
    steelblue: { r: 70, g: 130, b: 180 },
    tan: { r: 210, g: 180, b: 140 },
    teal: { r: 0, g: 128, b: 128 },
    thistle: { r: 216, g: 191, b: 216 },
    tomato: { r: 255, g: 99, b: 71 },
    turquoise: { r: 64, g: 224, b: 208 },
    violet: { r: 238, g: 130, b: 238 },
    wheat: { r: 245, g: 222, b: 179 },
    white: { r: 255, g: 255, b: 255 },
    whitesmoke: { r: 245, g: 245, b: 245 },
    yellow: { r: 255, g: 255, b: 0 },
    yellowgreen: { r: 154, g: 205, b: 50 }
};

export function rgbToHex(rgb: RGB|RGBA): HEX {
    const r = rgb.r.toString(16).padStart(2, '0');
    const g = rgb.g.toString(16).padStart(2, '0');
    const b = rgb.b.toString(16).padStart(2, '0');

    if (isRgba(rgb)) {
        const a = Math.round(rgb.a * 255).toString(16).padStart(2, '0');
        return `#${r}${g}${b}${a}`;
    }
    else {
        return `#${r}${g}${b}`;
    }
}

export const colorsRegexes = {
    rgba: /^(?:rgb|rgba)\(\s*(\d+)\s*[,;]?\s*(\d+)\s*[,;]?\s*(\d+)\s*(?:[,;]?\s*([\d.]+)\s*)?\)$/,
    hsv: /^(?:hsv|hsva|hsl|hsla)\(\s*(\d+)\s*[,;]?\s*(\d+)\s*[,;]?\s*(\d+)\s*(?:[,;]?\s*([\d.]+)\s*)?\)$/,
    hex: /^#?([0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/,
    numberArray: /^\[(\s*(\d+)\s*[,;]?\s*(\d+)\s*[,;]?\s*(\d+)\s*(?:[,;]?\s*([\d.]+)\s*)?)\]$/,
} as const;

export function hexToRgb(hex: HEX): RGB|RGBA {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})([a-f\d]{2}?)$/i.exec(hex);
    if (!result) throw new Error('Invalid hex color');

    const r = parseInt(result[1], 16);
    const g = parseInt(result[2], 16);
    const b = parseInt(result[3], 16);
    const a = result[4] ? parseInt(result[4], 16) / 255 : undefined;

    return a !== undefined ? { r,g,b,a } : { r,g,b };
}


export function rgbToHsv(rgb: RGB|RGBA): HSV|HSVA {
    const r = rgb.r / 255;
    const g = rgb.g / 255;
    const b = rgb.b / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const diff = max - min;

    let h = 0;
    const s = max === 0 ? 0 : (diff / max) * 100;
    const v = max * 100;

    if (diff !== 0) {
        if (max === r) {
            h = 60 * ((g - b) / diff);
        } else if (max === g) {
            h = 60 * (2 + (b - r) / diff);
        } else {
            h = 60 * (4 + (r - g) / diff);
        }
    }

    if (h < 0) h += 360;

    if (isRgba(rgb)) {
        return { h, s, v, a: rgb.a };
    }
    else {
        return { h, s, v };
    }
}

export function hsvToRgb(hsv: HSV|HSVA): RGB|RGBA {
    const h = hsv.h;
    const s = hsv.s / 100;
    const v = hsv.v / 100;

    const c = v * s;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = v - c;

    let r = 0, g = 0, b = 0;

    if (h >= 0 && h < 60) {
        [r, g, b] = [c, x, 0];
    } else if (h >= 60 && h < 120) {
        [r, g, b] = [x, c, 0];
    } else if (h >= 120 && h < 180) {
        [r, g, b] = [0, c, x];
    } else if (h >= 180 && h < 240) {
        [r, g, b] = [0, x, c];
    } else if (h >= 240 && h < 300) {
        [r, g, b] = [x, 0, c];
    } else {
        [r, g, b] = [c, 0, x];
    }


    r = Math.round((r + m) * 255);
    g = Math.round((g + m) * 255);
    b = Math.round((b + m) * 255);

    if (isHsva(hsv)) {
        return { r, g, b, a: hsv.a };
    }
    else {
        return { r, g, b };
    }
}

export function rgbToNamedColor(rgb: RGB): NamedColor|null {
    return Object.entries(namedColorMap).find(([key, color]) => {
        return color.r === rgb.r && color.g === rgb.g && color.b === rgb.b && key as NamedColor;
    })?.[0] as NamedColor ?? null;
}

export function namedColorToRgb(color: NamedColor): RGB {
    return namedColorMap[color];
}


export function isRgb(color: Color): color is RGB {
    return typeof color === 'object'
        && 'r' in color
        && 'g' in color
        && 'b' in color;
}

export function isRgba(color: Color): color is RGBA {
    return isRgb(color) && 'a' in color;
}

export function isHex(color: Color): color is HEX {
    return typeof color === 'string' && color.startsWith('#');
}

export function isNamedColor(color: Color): color is NamedColor {
    return typeof color === 'string' && color in namedColorMap;
}

export function isHsv(color: Color): color is HSV {
    return typeof color === 'object'
        && 'h' in color
        && 's' in color
        && 'v' in color;
}

export function isHsva(color: Color): color is HSVA {
    return isHsv(color) && 'a' in color;
}

export function isHexColor(color: Color): color is HEX {
    return typeof color === 'string' && color.startsWith('#');
}





export function colorToRgba(color: Color): RGB|RGBA {

    if (isRgb(color)) {
        return color;
    }
    else if (isHsv(color)) {
        return hsvToRgb(color);
    }
    else if (isHexColor(color)) {
        return hexToRgb(color);
    }
    else if (isNamedColor(color)) {
        return namedColorToRgb(color);
    }
    else {
        throw new Error('Invalid color');
    }
}

export const numberArrayToRgba = (numberArray: NumberArrayColor): RGBA => {
    return {
        r: numberArray[0] * 255,
        g: numberArray[1] * 255,
        b: numberArray[2] * 255,
        a: numberArray[3]
    };
}

export const rgbaToNumberArray = (rgba: RGBA): NumberArrayColor => {
    return [
        rgba.r / 255,
        rgba.g / 255,
        rgba.b / 255,
        rgba.a
    ];
}


export function parseColorString(colorString: string): RGB|RGBA|null {

    if (namedColorMap[colorString as NamedColor]) {
        return namedColorToRgb(colorString as NamedColor);
    }

    const rgbMatch = colorString.match(colorsRegexes.rgba);
    if (rgbMatch) {
        return {
            r: parseInt(rgbMatch[1]),
            g: parseInt(rgbMatch[2]),
            b: parseInt(rgbMatch[3]),
            a: rgbMatch[4] ? parseFloat(rgbMatch[4]) : 1
        };
    }

    const hsvMatch = colorString.match(colorsRegexes.hsv);
    if (hsvMatch) {
        const hsva: HSVA = {
            h: parseInt(hsvMatch[1]),
            s: parseInt(hsvMatch[2]),
            v: parseInt(hsvMatch[3]),
            a: hsvMatch[4] ? parseFloat(hsvMatch[4]) : 1
        };
        return hsvToRgb(hsva);
    }

    const hexMatch = colorString.match(colorsRegexes.hex);
    if (hexMatch) {
        return hexToRgb(hexMatch[0]);
    }

    const numberArrayMatch = colorString.match(colorsRegexes.numberArray);
    if (numberArrayMatch) {
        return {
            r: parseFloat(numberArrayMatch[1]) * 255,
            g: parseFloat(numberArrayMatch[2]) * 255,
            b: parseFloat(numberArrayMatch[3]) * 255,
            a: numberArrayMatch[4] ? parseFloat(numberArrayMatch[4]) : 1
        };
    }

    return null;
}