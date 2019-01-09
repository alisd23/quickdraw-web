import * as React from 'react';
import { Component } from 'react';

import { IBoundingBox } from '../../type';

interface IDrawCanvasProps {
  penRadius: number,
  penColour: string,
  width: number,
  height: number,
  onDraw?(canvas: HTMLCanvasElement, boundingBox: IBoundingBox | null): void;
}

interface IPoint {
  x: number;
  y: number;
}

interface IPositionEvent {
  clientX: number;
  clientY: number;
}

export class DrawCanvas extends Component<IDrawCanvasProps> {
  private drawing = false;
  private canvas: HTMLCanvasElement | null = null;
  private canvasContext: CanvasRenderingContext2D | null = null;
  private lastMousePos: IPoint | null = null;
  private boundingBox: IBoundingBox = this.getClearedBoundingBox();

  private getClearedBoundingBox(): IBoundingBox {
    return {
      minX: Number.MAX_SAFE_INTEGER,
      maxX: Number.MIN_SAFE_INTEGER,
      minY: Number.MAX_SAFE_INTEGER,
      maxY: Number.MIN_SAFE_INTEGER,
      isEmpty: true,
    };
  }

  private getUpdatedBoundingBox(newPoint: IPoint, radius: number): IBoundingBox {
    const newBoundingBox = {
      ...this.boundingBox,
      isEmpty: false,
    };

    // Handle new minimum X value
    const minXCandidate = newPoint.x - radius;
    if (minXCandidate < newBoundingBox.minX) {
      newBoundingBox.minX = minXCandidate;
    }
    // Handle new maximum X value
    const maxXCandidate = newPoint.x + radius;
    if (maxXCandidate > newBoundingBox.maxX) {
      newBoundingBox.maxX = maxXCandidate;
    }
    // Handle new minimum Y value
    const minYCandidate = newPoint.y - radius;
    if (minYCandidate < newBoundingBox.minY) {
      newBoundingBox.minY = minYCandidate;
    }
    // Handle new maximum X value
    const maxYCandidate = newPoint.y + radius;
    if (maxYCandidate > newBoundingBox.maxY) {
      newBoundingBox.maxY = maxYCandidate;
    }

    return newBoundingBox;
  }

  private getBoundedImageData(): ImageData | null {
    if (!this.canvasContext) {
      return null;
    }
    const { minX, maxX, minY, maxY } = this.boundingBox;
    return this.canvasContext.getImageData(minX, minY, maxX - minX, maxY - minY);
  }

  private draw = (point?: IPoint) => {
    if (!this.canvasContext || !point) {
      return;
    }

    const { x, y } = point;

    this.canvasContext.beginPath();

    // Set line colour and width
    this.canvasContext.fillStyle = this.props.penColour;
    this.canvasContext.strokeStyle = this.props.penColour;
    this.canvasContext.lineWidth = this.props.penRadius * 2;

    // Draw line from last recorded mouse position to ensure no gaps in the line
    if (this.lastMousePos) {
      this.canvasContext.moveTo(this.lastMousePos.x, this.lastMousePos.y);
      this.canvasContext.lineTo(x, y);
      this.canvasContext.closePath();
      this.canvasContext.stroke();
    }
    // Draw circle at current mouse position to round off any lines drawn
    this.canvasContext.arc(x, y, this.props.penRadius, 0, 2 * Math.PI);
    this.canvasContext.fill();
    this.lastMousePos = { x, y };

    // Update running bounding box of current drawing
    this.boundingBox = this.getUpdatedBoundingBox(this.lastMousePos, this.props.penRadius);
  }

  private getMousePos = (e: IPositionEvent) => {
    if (!this.canvas) {
      return;
    }

    const rect = this.canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  }

  // Specific TOUCH handlers - calls the draw methods below
  private onTouchStart = (e: TouchEvent) => {
    e.preventDefault();
    if (e.touches.length) {
      this.onDrawStart(e.touches[0]);
    }
  }

  private onTouchMove = (e: TouchEvent) => {
    e.preventDefault();
    if (e.touches.length) {
      this.onDraw(e.touches[0]);
    }
  }

  private onTouchEnd = () => {
    this.onDrawStop();
  }

  // DRAW handlers (start, move, stop)
  private onDrawStart = (e: IPositionEvent) => {
    this.drawing = true;
    this.draw(this.getMousePos(e));
  }

  private onDraw = (e: IPositionEvent) => {
    if (this.drawing) {
      this.draw(this.getMousePos(e));
    }
  }

  private onDrawStop = () => {
    this.drawing = false;
    this.lastMousePos = null;

    if (!this.props.onDraw || !this.canvas) {
      return;
    }

    if (this.boundingBox.isEmpty) {
      this.props.onDraw(this.canvas, null);
      return;
    }

    const imageData = this.getBoundedImageData();

    if (imageData) {
      this.props.onDraw(this.canvas, this.boundingBox);
    }
  }

  public componentDidUpdate(nextProps: IDrawCanvasProps) {
    if (
      nextProps.height !== this.props.height ||
      nextProps.width !== this.props.width
    ) {
      this.clear();
    }
  }

  public componentDidMount() {
    this.canvasContext = this.canvas && this.canvas.getContext('2d');

    this.canvas!.addEventListener('touchmove', this.onTouchMove, { passive: false });
    this.canvas!.addEventListener('touchstart', this.onTouchStart, { passive: false });

    this.clear();
  }

  public componentWillUnmount() {
    this.canvas!.removeEventListener('touchmove', this.onTouchMove);
    this.canvas!.removeEventListener('touchstart', this.onTouchStart);
  }

  public clear = () => {
    if (!this.canvasContext || !this.canvas) {
      return;
    }
    this.canvasContext.fillStyle = '#ffffff';
    this.canvasContext.rect(0, 0, this.canvas.offsetWidth, this.canvas.offsetHeight);
    this.canvasContext.fill();

    this.boundingBox = this.getClearedBoundingBox();

    if (this.props.onDraw) {
      this.props.onDraw(this.canvas, null);
    }
  }

  public render() {
    return (
      <canvas
        ref={el => (this.canvas = el)}
        width={this.props.width}
        height={this.props.height}
        // Mouse events
        onMouseDown={this.onDrawStart}
        onMouseOut={this.onDrawStop}
        onMouseUp={this.onDrawStop}
        onMouseLeave={this.onDrawStop}
        onMouseMove={this.onDraw}
        // Touch events (excluding touch and start)
        onTouchEnd={this.onTouchEnd}
        onTouchCancel={this.onTouchEnd}
      />
    );
  }
}
