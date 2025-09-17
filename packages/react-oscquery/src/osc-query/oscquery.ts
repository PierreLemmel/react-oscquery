import { type RGB } from "./color";
import { sanitizeOSCPath } from "./osc";
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

export type NodeType = keyof typeof OSCQueryTypes.Tags | "Container";
export type NodeTypeValue<TType extends NodeType> = TType extends "Integer" ? number :
    TType extends "Float" ? number :
    TType extends "String" ? string :
    TType extends "Color" ? RGB :
    TType extends "Point2D" ? Point2D :
    TType extends "Point3D" ? Point3D :
    TType extends "Boolean" ? boolean :
    TType extends "Container" ? ValueMap : never;

export type OSCQueryNodeBase = {
    description: string;
    fullPath: string;
    access: typeof OSCQueryAccess[keyof typeof OSCQueryAccess];
    type: NodeType;
}
type OSCQueryNodeContent<TType extends NodeType, TExtra = {}> = OSCQueryNodeBase & {
    type: TType;
} & TExtra;

export type Range = {
    min: number;
    max: number;
}

export type OSCQueryIntNode = OSCQueryNodeContent<"Integer", {
    range?: Partial<Range>;
}>;

export type OSCQueryFloatNode = OSCQueryNodeContent<"Float", {
    range?: Partial<Range>;
}>;

export type OSCQueryStringNode = OSCQueryNodeContent<"String", {
    enumValues?: string[];
}>;

export type OSCQueryColorNode = OSCQueryNodeContent<"Color", {
}>;

export type OSCQueryBooleanNode = OSCQueryNodeContent<"Boolean", {
}>;

export type OSCQueryContainerNode = OSCQueryNodeContent<"Container", {
    contents: { [key: string]: OSCQueryNode };
}>;

export type OSCQueryPoint2DNode = OSCQueryNodeContent<"Point2D", {
    range?: Partial<{
        x: Partial<Range>;
        y: Partial<Range>;
    }>
}>;

export type OSCQueryPoint3DNode = OSCQueryNodeContent<"Point3D", {
    range?: Partial<{
        x: Partial<Range>;
        y: Partial<Range>;
        z: Partial<Range>;
    }>
}>;



export type OSCQueryNode = OSCQueryIntNode
    | OSCQueryFloatNode
    | OSCQueryStringNode
    | OSCQueryColorNode
    | OSCQueryPoint2DNode
    | OSCQueryPoint3DNode
    | OSCQueryBooleanNode
    | OSCQueryContainerNode;

export type MappedOSCQueryNode<TNode = "Container"> =
    TNode extends "Integer" ? OSCQueryIntNode :
    TNode extends "Float" ? OSCQueryFloatNode :
    TNode extends "String" ? OSCQueryStringNode :
    TNode extends "Color" ? OSCQueryColorNode :
    TNode extends "Point2D" ? OSCQueryPoint2DNode :
    TNode extends "Point3D" ? OSCQueryPoint3DNode :
    TNode extends "Container" ? OSCQueryContainerNode : never;

export type NodeWithValue<TNode extends OSCQueryNodeBase, TValue = undefined> = {
    type: TNode["type"];
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
            return {
                type: "Integer",
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
                type: "Float",
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
                type: "String",
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
                type: "Boolean",
                node: booleanNode,
                value: booleanValue,
            };

        case OSCQueryTypes.Tags.Color:

            const uint32 = ((value![0] ?? 0)as number);
            const r = (uint32 >> 24) & 0xFF;
            const g = (uint32 >> 16) & 0xFF;
            const b = (uint32 >> 8) & 0xFF;
            const a = uint32 & 0xFF;
            const rgbColor = { r, g, b, a };

            const colorNode: OSCQueryColorNode = {
                description,
                fullPath,
                type: "Color",
                access,
            };
            return {
                type: "Color",
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
                type: "Point2D",
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
                type: "Point3D",
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
        contents: nodeMap as { [key: string]: OSCQueryNode },
    };
    return {
        type: "Container",
        node: containerNode,
        value: valueMap,
    };
}