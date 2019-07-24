import * as React from "react";

function xFromEvent(e: any): number {
  return (
    e.pageX ||
    (e.touches && e.touches[0] && e.touches[0].pageX) ||
    (e.changedTouches && e.changedTouches[e.changedTouches.length - 1].pageX)
  );
}
function yFromEvent(e: any): number {
  return (
    e.pageY ||
    (e.touches && e.touches[0] && e.touches[0].pageY) ||
    (e.changedTouches && e.changedTouches[e.changedTouches.length - 1].pageY)
  );
}

export function useDragHandler(
  elementRef: React.RefObject<HTMLElement>,
  drag: (horz: number, vert: number) => void
) {
  React.useEffect(() => {
    if (!elementRef.current) return;
    let dragging = false;
    let prevX = 0;
    let prevY = 0;
    let onMouseMove = (e: any) => {
      if (!dragging) return;

      if (e.preventDefault) {
        e.preventDefault();
      }

      onDrag(e);
    };
    function onMouseUp(e: any) {
      cleanUp();
      if (!dragging) return;
      onDrag(e);
      dragging = false;
    }
    function cleanUp() {
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("touchend", onMouseUp);
      window.removeEventListener("touchmove", onMouseMove);
    }
    function onDrag(e: any) {
      let x = xFromEvent(e);
      let y = yFromEvent(e);
      drag(x - prevX, y - prevY);
      prevX = x;
      prevY = y;
    }
    function onMouseDown(e: any) {
      if (e.button !== 0) return;

      dragging = true;
      prevX = xFromEvent(e);
      prevY = yFromEvent(e);

      window.addEventListener("mouseup", onMouseUp);
      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("touchend", onMouseUp);
      window.addEventListener("touchmove", onMouseMove);
    }
    elementRef.current.addEventListener("mousedown", onMouseDown);
    elementRef.current.addEventListener("touchstart", onMouseDown);
    return cleanUp;
  }, [elementRef, drag]);
}
