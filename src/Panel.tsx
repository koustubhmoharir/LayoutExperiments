import * as React from "react";
import { FlexDirectionProperty } from "csstype";
import * as _ from "lodash";
import { useDragHandler } from "./Draggable";

type PanelDirection = "vertical" | "horizontal";
type PanelItemAlignment = "start" | "end" | "center" | "stretch";
type Thickness = number | [number, number] | [number, number, number, number];
type BorderStyle =
  | "none"
  | "hidden"
  | "dotted"
  | "dashed"
  | "solid"
  | "double"
  | "groove"
  | "ridge"
  | "inset"
  | "outset";

interface BorderProps {
  borderColor?: string | [string, string] | [string, string, string, string];
  border?: Thickness;
  borderStyle?:
    | BorderStyle
    | [BorderStyle, BorderStyle]
    | [BorderStyle, BorderStyle, BorderStyle, BorderStyle];
}

interface PanelProps extends BorderProps {
  direction: PanelDirection;
  children?: React.ReactElement<PanelItemProps> | PanelChildElement[];
  padding?: Thickness;
  spacingBetweenItems?: number;
  leftOverSpace?:
    | "start"
    | "end"
    | "start-end"
    | "between-items"
    | "around-items";
  alignItems?: PanelItemAlignment;
  background?: string;
}

interface PanelItemProps extends BorderProps {
  fill?: number;
  children?: React.ReactNode;
  align?: PanelItemAlignment;
  padding?: Thickness;
  height?: number;
  width?: number;
  scrollHorizontally?: boolean;
  scrollVertically?: boolean;
  background?: string;
}

interface PanelSplitterProps {
  size?: number;
  resize?: "auto" | "previous" | "next";
  background?: string;
}

type PanelChildElement = React.ReactElement<
  PanelItemProps | PanelSplitterProps
>;

interface ParentPanelProps {
  direction?: PanelDirection;
  alignItems?: string;
  spacingBetweenItems: number;
  itemProps: PanelItemProps[];
  setItemSize: ((delta?: number) => void)[];
}

const ParentPanelContext = React.createContext<ParentPanelProps>({
  direction: "horizontal",
  alignItems: "stretch",
  spacingBetweenItems: 0,
  itemProps: [],
  setItemSize: []
});

export function Panel(props: PanelProps) {
  let [itemProps] = React.useState([] as PanelItemProps[]);
  let [setItemSize] = React.useState([] as ((delta?: number) => void)[]);
  let flexDirection: FlexDirectionProperty =
    props.direction === "vertical" ? "column" : "row";
  let extraSpace = props.leftOverSpace || "end";
  let justifyContent =
    extraSpace === "start"
      ? "flex-end"
      : extraSpace === "end"
      ? "flex-start"
      : extraSpace === "start-end"
      ? "center"
      : extraSpace === "between-items"
      ? "space-between"
      : extraSpace === "around-items"
      ? "space-evenly"
      : "flex-end";
  let alignItems =
    props.alignItems || (props.direction === "vertical" ? "stretch" : "center");
  let flexAlignItems =
    alignItems === "start"
      ? "flex-start"
      : alignItems === "end"
        ? "flex-end"
        : alignItems;
  let padding = v124ToString(props.padding, "rem");
  let background = props.background;
  return (
    <ParentPanelContext.Provider
      value={{
        direction: props.direction,
        alignItems,
        spacingBetweenItems: props.spacingBetweenItems || 0,
        itemProps,
        setItemSize
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection,
          justifyContent,
          alignItems: flexAlignItems,
          padding,
          background,
          ...borderPropsToStyle(props)
        }}
      >
        {createPanelChildren(
          props.children,
          props.spacingBetweenItems || 0,
          props.direction
        )}
      </div>
    </ParentPanelContext.Provider>
  );
}
function v124ToString<T>(p: T | [T, T] | [T, T, T] | [T, T, T, T], units = "") {
  let paddingStr: string | undefined;
  if (_.isArray(p)) {
    if (p.length === 2) {
      paddingStr = `${p[0]}${units} ${p[1]}${units}`;
    } else if (p.length === 3) {
      paddingStr = `${p[0]}${units} ${p[1]}${units} ${p[2]}${units} ${
        p[1]
      }${units}`;
    } else if (p.length === 4) {
      paddingStr = `${p[0]}${units} ${p[1]}${units} ${p[2]}${units} ${
        p[3]
      }${units}`;
    }
  } else paddingStr = `${p}${units}`;
  return paddingStr;
}

function borderPropsToStyle(props: BorderProps) {
  if (
    props.border == null &&
    props.borderColor == null &&
    props.borderStyle == null
  )
    return undefined;
  let bt = props.border == null ? 1 : props.border;
  let bs = props.borderStyle == null ? "solid" : props.borderStyle;
  let bc = props.borderColor == null ? "gray" : props.borderColor;
  if (
    !_.isArray(props.border) &&
    !_.isArray(props.borderColor) &&
    !_.isArray(props.borderStyle)
  ) {
    return { border: `${bt}px ${bs} ${bc}` };
  }
  return {
    borderWidth: v124ToString(bt, "px"),
    borderStyle: v124ToString(bs),
    borderColor: v124ToString(bc)
  };
}

function createPanelChildren(
  children: React.ReactElement<PanelItemProps> | PanelChildElement[],
  spacingBetweenItems: number,
  direction: PanelDirection
) {
  if (!_.isArray(children)) return children;
  let actual: typeof children = [];
  let spacing = `${spacingBetweenItems}rem`;
  let addSpacer = false;
  for (let index = 0; index < children.length; index++) {
    let child = children[index];
    if (child.type === PanelSplitter) addSpacer = false;
    if (child.type === PanelItem) {
      if (addSpacer && spacingBetweenItems > 0) {
        actual.push(
          <div
            key={"spacer-" + index}
            style={{
              flexShrink: 0,
              alignSelf: "stretch",
              ...(direction === "horizontal" && { width: spacing }),
              ...(direction === "vertical" && { height: spacing })
            }}
          />
        );
      }
      addSpacer = true;
    }
    actual.push(React.cloneElement(child, { index } as any));
  }
  return actual;
}

export function PanelSplitter(props: PanelSplitterProps) {
  let context = React.useContext(ParentPanelContext);
  let divRef = React.useRef<HTMLDivElement>(null);
  let index: number = (props as any).index;
  let itemProps = context.itemProps;
  let setItemSize = context.setItemSize;
  let direction = context.direction;
  let resize = props.resize;
  let drag = React.useCallback(
    (horz?: number, vert?: number) => {
      let delta = direction === "vertical" ? vert : horz;
      let revDelta = delta == null ? null : -delta;
      let auto = false;
      if (itemProps[index - 1].fill === 0) {
        setItemSize[index - 1](delta);
        auto = true;
      }
      if (itemProps[index + 1].fill === 0) {
        setItemSize[index + 1](revDelta);
        auto = true;
      }
      if (!auto) {
        if (resize === "next") setItemSize[index + 1](revDelta);
        else setItemSize[index - 1](delta);
      }
    },
    [direction, index, itemProps, setItemSize, resize]
  );
  function onDoubleClick() {
    drag();
  }
  useDragHandler(divRef, drag);
  let size = Math.max(context.spacingBetweenItems, props.size || 0.25);
  let sizeStr = `${size}rem`;
  let background = props.background;
  return (
    <div
      ref={divRef}
      onDoubleClick={onDoubleClick}
      style={{
        alignSelf: "stretch",
        flexShrink: 0,
        cursor: direction === "horizontal" ? "col-resize" : "row-resize",
        ...(direction === "horizontal" && { width: sizeStr }),
        ...(direction === "vertical" && { height: sizeStr }),
        background
      }}
    />
  );
}

export function PanelItem(props: PanelItemProps) {
  let context = React.useContext(ParentPanelContext);
  let [explSize, setExplSize] = React.useState<number | null>(null);
  let divRef = React.useRef<HTMLDivElement>(null);
  let index: number = (props as any).index;
  let isVertical = context.direction === "vertical";
  context.itemProps[index] = props;
  context.setItemSize[index] = (delta?: number) => {
    if (delta == null) setExplSize(null);
    else if (divRef.current) {
      let rect = divRef.current.getBoundingClientRect();
      let size = isVertical ? rect.bottom - rect.top : rect.right - rect.left;
      setExplSize(size + delta);
    }
  };

  let sizeProp = isVertical ? "height" : "width";
  let size =
    explSize != null
      ? `${explSize}px`
      : props[sizeProp] != null
      ? `${props[sizeProp]}rem`
      : null;
  let crossSizeProp = isVertical ? "width" : "height";
  let crossSize =
    props[crossSizeProp] != null ? `${props[crossSizeProp]}rem` : null;

  let flexGrow = (!size && props.fill) || 0;
  let alignSelf =
    props.align === "start"
      ? "flex-start"
      : props.align === "end"
      ? "flex-end"
      : props.align;
  let padding = v124ToString(props.padding, "rem");
  let className =
    (isVertical && props.fill > 0) ||
    (!isVertical && (alignSelf || context.alignItems) === "stretch")
      ? "stretch-vertical"
      : undefined;
  let scrollHorizontally =
    props.scrollHorizontally == null
      ? !isVertical && props.fill > 0
      : props.scrollHorizontally;
  let scrollVertically =
    props.scrollVertically == null
      ? isVertical && props.fill > 0
      : props.scrollVertically;

  let background = props.background;
  return (
    <div
      ref={divRef}
      style={{
        flexGrow,
        flexShrink: 0,
        flexBasis: flexGrow > 0 ? "0px" : "auto",
        alignSelf,
        padding,
        [sizeProp]: size,
        [crossSizeProp]: crossSize,
        overflowX: scrollHorizontally ? "auto" : "hidden",
        overflowY: scrollVertically ? "auto" : "hidden",
        background,
        ...borderPropsToStyle(props)
      }}
      className={className}
    >
      {props.children}
    </div>
  );
}
