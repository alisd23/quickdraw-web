export interface IBoundingBox {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  isEmpty: boolean;
}

export interface IPrediction {
  class: string;
  score: string;
}
