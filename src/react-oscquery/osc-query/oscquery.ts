import { hexToRgb, type RGB } from "./color";
import type { Point2D, Point3D } from "./points";

export interface SerializedOSCQueryNode {
    'DESCRIPTION': string;
    'FULL_PATH': string;
    'TYPE': typeof OSCQueryTypes.Tags[keyof typeof OSCQueryTypes.Tags] | string;
    'ACCESS'?: typeof OSCQueryAccess[keyof typeof OSCQueryAccess];
    'CONTENTS'?: { [key: string]: SerializedOSCQueryNode };
    'VALUE'?: (string | number | boolean | null)[];
    'RANGE'?: SerializedOSCRange[];
}

export interface SerializedOSCRange {
    'MIN'?: number;
    'MAX'?: number;
    'VALS'?: string[];
}

export const OSCQueryAccess = {
    NoValue: 0 as const,
    Read: 1 as const,
    Write: 2 as const,
    ReadWrite: 3 as const,
} as const;

export const OSCQueryTypes = {

    Container: "container",

    Tags: {
        Integer: "i",
        Float: "f",
        String: "s",
        Color: "r",
        Boolean: "T",
        Point2D: "ff",
        Point3D: "fff",
    },
} as const;

type NodeType = keyof typeof OSCQueryTypes.Tags | "Container";

type OSCQueryNodeType<TType extends NodeType, TExtra = {}> = {
    description: string;
    fullPath: string;
    type: TType;
    access: typeof OSCQueryAccess[keyof typeof OSCQueryAccess];
} & TExtra;

export type Range = {
    min: number;
    max: number;
}

export type OSCQueryIntNode = OSCQueryNodeType<"Integer", {
    range?: Partial<Range>;
}>;

export type OSCQueryFloatNode = OSCQueryNodeType<"Float", {
    range?: Partial<Range>;
}>;

export type OSCQueryStringNode = OSCQueryNodeType<"String", {
    enumValues?: string[];
}>;

export type OSCQueryColorNode = OSCQueryNodeType<"Color", {
}>;

export type OSCQueryBooleanNode = OSCQueryNodeType<"Boolean", {
}>;

export type OSCQueryContainerNode = OSCQueryNodeType<"Container", {
    contents: { [key: string]: OSCQueryNode };
}>;

export type OSCQueryPoint2DNode = OSCQueryNodeType<"Point2D", {
    range?: Partial<{
        x: Partial<Range>;
        y: Partial<Range>;
    }>
}>;

export type OSCQueryPoint3DNode = OSCQueryNodeType<"Point3D", {
    range?: Partial<{
        x: Partial<Range>;
        y: Partial<Range>;
        z: Partial<Range>;
    }>
}>;

export type OSCQueryNode = OSCQueryIntNode
    | OSCQueryFloatNode
    | OSCQueryStringNode
    | OSCQueryBooleanNode
    | OSCQueryColorNode
    | OSCQueryPoint2DNode
    | OSCQueryPoint3DNode
    | OSCQueryContainerNode

export type NodeWithValue<TNode extends OSCQueryNode, TValue = undefined> = {
    node: TNode;
    value: TValue;
}


export type ValueMap = { [key: string]: NodeValue };
export type NodeValue = number | string | RGB | Point2D | Point3D | boolean | ValueMap;



export type ParseNodeResult = NodeWithValue<OSCQueryIntNode, number>
    | NodeWithValue<OSCQueryFloatNode, number>
    | NodeWithValue<OSCQueryStringNode, string>
    | NodeWithValue<OSCQueryColorNode, RGB>
    | NodeWithValue<OSCQueryPoint2DNode, Point2D>
    | NodeWithValue<OSCQueryPoint3DNode, Point3D>
    | NodeWithValue<OSCQueryBooleanNode, boolean>
    | NodeWithValue<OSCQueryContainerNode, ValueMap>

export const parseNode = (node: SerializedOSCQueryNode): ParseNodeResult => {

    const {
        DESCRIPTION: description,
        FULL_PATH: inPath,
        TYPE: typeTag,
        ACCESS: access = OSCQueryAccess.ReadWrite,
        CONTENTS: contents,
        VALUE: value,
        RANGE: range,
    } = node;

    const fullPath = sanitizeOSCPath(inPath);
    const rangeToRange = (range: SerializedOSCRange|undefined): Partial<Range>|undefined => {
        if (!range) return undefined;
        return {
            min: range.MIN,
            max: range.MAX,
        };
    }
    
    
    switch (typeTag) {
        case OSCQueryTypes.Tags.Integer:
            const intNode: OSCQueryIntNode = {
                description,
                fullPath,
                type: "Integer",
                access,
                range: rangeToRange(range?.[0]),
            };
            return  {
                node: intNode,
                value: (value![0] ?? 0) as number,
            };

        case OSCQueryTypes.Tags.Float:
            const floatNode: OSCQueryFloatNode = {
                description,
                fullPath,
                type: "Float",
                access,
                range: rangeToRange(range?.[0]),
            };
            return {
                node: floatNode,
                value: (value![0] ?? 0) as number,
            };

        case OSCQueryTypes.Tags.String:
            const stringNode: OSCQueryStringNode = {
                description,
                fullPath,
                type: "String",
                access,
                enumValues: range?.[0]?.VALS,
            };
            return {
                node: stringNode,
                value: (value![0] ?? "") as string,
            };

        case OSCQueryTypes.Tags.Boolean:

            const rawBoolValue = value![0];
            const booleanValue = typeof rawBoolValue === "boolean" ? rawBoolValue : rawBoolValue !== 0;
            const booleanNode: OSCQueryBooleanNode = {
                description,
                fullPath,
                type: "Boolean",
                access,
            };
            return {
                node: booleanNode,
                value: booleanValue,
            };

        case OSCQueryTypes.Tags.Color:

            const hexColor = value![0] as string;
            const rgbColor = hexToRgb(hexColor);

            const colorNode: OSCQueryColorNode = {
                description,
                fullPath,
                type: "Color",
                access,
            };
            return {
                node: colorNode,
                value: rgbColor,
            };

        case OSCQueryTypes.Tags.Point2D:
            const point2DNode: OSCQueryPoint2DNode = {
                description,
                fullPath,
                type: "Point2D",
                access,
                range: {
                    x: rangeToRange(range?.[0]),
                    y: rangeToRange(range?.[1]),
                },
            };
            return {
                node: point2DNode,
                value: {
                    x: (value![0] ?? 0) as number,
                    y: (value![1] ?? 0) as number,
                },
            };

        case OSCQueryTypes.Tags.Point3D:
            const point3DNode: OSCQueryPoint3DNode = {
                description,
                fullPath,
                type: "Point3D",
                access,
            };
            return {
                node: point3DNode,
                value: {
                    x: (value![0] ?? 0) as number,
                    y: (value![1] ?? 0) as number,
                    z: (value![2] ?? 0) as number,
                },
            };
    }

    const children = Object.entries(contents ?? {}).map(([key, sn]) => {

        const { node, value} = parseNode(sn);
        return {
            key,
            node,
            value,
        };
    });

    const nodeMap = Object.fromEntries(children.map(({ key, node }) => [key, node]));
    const valueMap = Object.fromEntries(children.map(({ key, value }) => [key, value]));

    
    const containerNode: OSCQueryContainerNode = {
        description,
        fullPath,
        type: "Container",
        access,
        contents: nodeMap,
    };
    return {
        node: containerNode,
        value: valueMap,
    };
}


export const sanitizeOSCPath = (path: string): string => {

    if (!path.startsWith("/")) path = "/" + path;

    return path
        .replace(/\/+/g, "/")
        .replace(/ /g, "_");
}