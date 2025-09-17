export { useOSCQuery, type OSCQueryOptions, type UseOSCQueryResult } from './hooks/useOSCQuery';
export { useEffectAsync } from './hooks/useEffectAsync';

export {
    type NodeType,
    type NodeTypeValue,
    type NodeValue,
    type ValueMap,
    
    type OSCQueryNode,
    type OSCQueryNodeBase,
    type OSCQueryIntNode,
    type OSCQueryFloatNode,
    type OSCQueryStringNode,
    type OSCQueryColorNode,
    type OSCQueryBooleanNode,
    type OSCQueryContainerNode,
    type OSCQueryPoint2DNode,
    type OSCQueryPoint3DNode,
    type MappedOSCQueryNode,
    
    type SerializedOSCQueryNode,
    type SerializedOSCRange,
    
    OSCQueryAccess,
    OSCQueryTypes,

    type Range,
    
    type NodeWithValue,


    type ParseNodeResult,
    

    parseNode
} from './osc-query/oscquery';


export {
    OSCQueryClient,
    type OSCQueryClientOptions,
    type OSCQueryClientState,
    type SetValueCallback,
    type OSCNodeValueInfo,
    type EventType,
    type SyncListener,
    type ErrorListener,
    type LogListener,
    type PathAddedListener,
    type PathRemovedListener,
    type PathChangedListener,
    type NodeListener
} from './osc-query/oscquery-client';

export {
    type OSCPath,
    isOSCPath,
    sanitizeOSCPath,
    parseOscMessage
} from './osc-query/osc';

export {
    type RGB,
    type RGBA,
    type HSV,
    type HSVA,
    type HEX,
    type NamedColor,
    type Color,
    type ColorFormat,
    type NumberArrayColor,
    colorFormats,
    namedColors,
    rgbToHex,
    hexToRgb,
    rgbToHsv,
    hsvToRgb,
    rgbToNamedColor,
    namedColorToRgb,
    isRgb,
    isRgba,
    isHex,
    isNamedColor,
    isHsv,
    isHsva,
    isHexColor,
    colorToRgba,
    numberArrayToRgba,
    rgbaToNumberArray,
    parseColorString,
    colorsRegexes
} from './osc-query/color';

export {
    type Point2D,
    type Point3D
} from './osc-query/points';

export {
    clamp,
    type Result,
    ok,
    err
} from './utils';
