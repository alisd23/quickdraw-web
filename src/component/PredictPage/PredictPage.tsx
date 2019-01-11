import * as React from 'react';
import { FunctionComponent, useRef, useState } from 'react';
import { throttle } from 'lodash';
import { default as axios } from 'axios';
import { Button, Segment, Icon } from 'semantic-ui-react';

import { IBoundingBox, IPrediction } from '../../type';
import { DrawCanvas } from '../DrawCanvas';
import { WindowResize } from '../WindowResize';
import { PredictionBar } from '../PredictionBar';
import { PredictionLegend } from '../PredictionLegend';
import { CategoryListPopup } from '../CategoryListPopup';
import { padImage, hexToRgb, extractScaledImageData, imageDataToNormalised2dArray } from './image-utils';

import './PredictPage.scss';

const REQUEST_THROTTLE = 2000;
const IMAGE_PREDICTION_SIZE = 28;
const IMAGE_PADDING = 0;
const PEN_RADIUS = 8;
const CLOUD_FUNCTION_URL = 'https://europe-west1-quickdraw-227116.cloudfunctions.net/predict';
const TOP_N_PREDICTIONS = 4;
const OTHER_COLOUR = '#DDDDDD';
const SCORE_PRECISION = 2;

const colours = [
  '#6B2D5C',
  '#FCAA67',
  '#69B578',
  '#6A4EC4',
  OTHER_COLOUR,
];

async function getPredictions(imageData: number[][]): Promise<IPrediction[]> {
  const result = await axios.post<IPrediction[]>(CLOUD_FUNCTION_URL, imageData);
  const predictions = result.data
    .slice(0, TOP_N_PREDICTIONS)
    .map(prediction => ({
      ...prediction,
      score: (Number(prediction.score) * 100).toFixed(SCORE_PRECISION),
    }));

  const remainingScore = 100 - predictions.reduce((sum, prediction) => sum + Number(prediction.score), 0);
  predictions.push({
    class: 'other',
    score: remainingScore.toFixed(SCORE_PRECISION),
  });
  return predictions;
}

export const PredictPage: FunctionComponent = () => {
  async function onDraw(canvas: HTMLCanvasElement, boundingBox: IBoundingBox | null) {
    if (!boundingBox || !penRgbColour || boundingBox.isEmpty) {
      setPredictions(null);
      return;
    }

    // Scale image to size with additional 2 pixels of padding (1 on each side)
    const scaledImageData = extractScaledImageData(canvas, boundingBox, IMAGE_PREDICTION_SIZE - (IMAGE_PADDING * 2));
    const paddedImage = padImage(
      imageDataToNormalised2dArray(scaledImageData, penRgbColour),
      IMAGE_PREDICTION_SIZE
    );

    try {
      const predictionRequest = getPredictions(paddedImage);
      activeRequest.current = predictionRequest;
      const newPredictions = await predictionRequest;
      if (activeRequest.current === predictionRequest) {
        setPredictions(newPredictions);
      }
    } catch {
      setPredictions(null);
    }
  }
  
  // Colours
  const penHexColour = '#ff9a1a';
  const penRgbColour = hexToRgb(penHexColour);

  // Hooks
  const canvasRef = useRef<DrawCanvas>(null);
  const onDrawRef = useRef(onDraw);
  const activeRequest = useRef<Promise<IPrediction[]> | null>(null);
  const [predictions, setPredictions] = useState<IPrediction[] | null>(null);

  const throttledOnDraw = useRef(throttle(onDrawRef.current, REQUEST_THROTTLE, {
    leading: true,
    trailing: true,
  }));

  function onClear() {
    canvasRef.current!.clear();
    activeRequest.current = null;
    throttledOnDraw.current.flush();
  }

  return (
    <div className="predict-page">
      <div className="canvas-wrapper">
        <WindowResize>
          {
            (width, height) => (
              <DrawCanvas
                ref={canvasRef}
                penColour={penHexColour}
                penRadius={PEN_RADIUS}
                width={width || 0}
                height={height || 0}
                onDraw={throttledOnDraw.current}
              />
            )
          }
        </WindowResize>
        <div className="canvas-actions">
          <Button icon onClick={onClear}>
            <Icon name='erase' />
          </Button>
          <CategoryListPopup />
        </div>
        {
          predictions && predictions.length && (
            <div className="canvas-predictions-legend">
              <Segment raised>
                <PredictionLegend
                  predictions={predictions}
                  colours={colours}            
                />
              </Segment>
            </div>
          )
        }
      </div>
      <PredictionBar
        predictions={predictions}
        colours={colours}
      />
    </div>
  );
}