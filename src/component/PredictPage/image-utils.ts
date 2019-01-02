import { IBoundingBox } from '../../type';

export interface IRGB {
  red: number;
  green: number;
  blue: number;
}

export function hexToRgb(hex: string): IRGB | null {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    red: parseInt(result[1], 16),
    green: parseInt(result[2], 16),
    blue: parseInt(result[3], 16)
  } : null;
}

export function averageColour(colour: IRGB) {
  return (colour.red + colour.green + colour.blue) / 3;
}

export function invertColourValue(colourValue: number) {
  return 255 - colourValue;
}

export function normalisePixel(pixelColour: IRGB, baseColour: IRGB) {
  const normalisedPixelColour = invertColourValue(averageColour(pixelColour));
  const normalisedBaseColour = invertColourValue(averageColour(baseColour));
  return Math.min(1, normalisedPixelColour / normalisedBaseColour);
}

export function padImage(image: number[][], targetSize: number): number[][] {
  const defaultPixelValue = 0;

  // Pad rows if necessary
  let appendAtTop = true;
  while (image.length < targetSize) {
    const newRow = new Array(targetSize).fill(defaultPixelValue);
    if (appendAtTop) {
      image.unshift(newRow)
    } else {
      image.push(newRow);
    }
    // Invert flag to append to opposite edge of image on next iteration
    appendAtTop = !appendAtTop;
  }

  // Pad columns if necessary.
  // For each row add extra default pixels to alternating ends of the row
  for (const row of image) {
    let appendAtStart = true;
    while (row.length < targetSize) {
      if (appendAtStart) {
        row.unshift(defaultPixelValue)
      } else {
        row.push(defaultPixelValue);
      }
      // Invert flag to append to opposite edge of image on next iteration
      appendAtStart = !appendAtStart;
    }
  }

  return image;
}

export function extractScaledImageData(
  canvas: HTMLCanvasElement,
  boundingBox: IBoundingBox,
  targetSize: number
): ImageData {  
  const { minX, maxX, minY, maxY } = boundingBox;
  const imageData = canvas.getContext('2d')!.getImageData(minX, minY, maxX - minX, maxY - minY);

  // const imageData = canvas.getContext('2d')!.getImageData()
  const scaleFactor = targetSize / Math.max(imageData.width, imageData.height);
  // // Width between 0 and targetSize pixels
  const newWidth = imageData.width * scaleFactor;
  // // Width between 0 and targetSize pixels
  const newHeight = imageData.height * scaleFactor;
  
  const newCanvas = document.createElement('canvas');

  newCanvas.setAttribute('width', `${newWidth}px`);
  newCanvas.setAttribute('height', `${newHeight}px`);

  const newContext = newCanvas.getContext('2d');
  newContext!.drawImage(canvas, minX, minY, maxX - minX, maxY - minY, 0, 0, newWidth, newHeight);

  // document.body.appendChild(newCanvas);

  return newContext!.getImageData(0, 0, newWidth, newHeight);
}

export function imageDataToNormalised2dArray(
  imageData: ImageData,
  baseColour: IRGB
): number[][] {
  const resultPixels: number[][] = [];

  for (let row = 0; row < imageData.height; row++) {
    const rowPixels = [];
    for (let column = 0; column < imageData.width; column++) {
      const startIndex = ((row * imageData.width) + column) * 4;
      const pixelData = imageData.data.slice(startIndex, startIndex + 4);
      const pixelColour = {
        red: pixelData[0],
        green: pixelData[1],
        blue: pixelData[2],
      };
      rowPixels.push(normalisePixel(pixelColour, baseColour));      
    }
    resultPixels.push(rowPixels);
  }

  return resultPixels;
}
