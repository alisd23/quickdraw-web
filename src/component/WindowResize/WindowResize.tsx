import * as React from 'react';
import { StatelessComponent, useState, useRef, useEffect, CSSProperties } from 'react';

interface IWindowResizeProps {
  children(width: number, height: number): JSX.Element;
}

const elementStyle: CSSProperties = {
  width: '100%',
  height: '100%',
}

export const WindowResize: StatelessComponent<IWindowResizeProps> = ({ children }) => {
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const elementRef = useRef<HTMLDivElement>(null);

  function onResize() {
    if (!elementRef.current) {
      return;
    }
    setHeight(elementRef.current.offsetHeight);
    setWidth(elementRef.current.offsetWidth);
  }

  useEffect(
    () => {
      window.addEventListener('resize', onResize);
      onResize();
      return () => window.removeEventListener('resize', onResize);
    },
    []
  );

  return (
    <div
      ref={elementRef}
      style={elementStyle}
    >
      {children(width, height)}
    </div>
  );
}
