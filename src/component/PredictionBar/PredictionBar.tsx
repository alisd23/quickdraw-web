import * as React from 'react';
import { FunctionComponent } from 'react';
import * as Case from 'case';

import { IPrediction } from '../../type';

import './PredictionBar.scss';

interface IPredictionBarSegmentProps extends IPrediction {
  message?: string;
  colour: string;
}

const PredictionBarSegment: FunctionComponent<IPredictionBarSegmentProps> = (props) => {
  const width = `${props.score}%`;

  return (
    <div
      className="prediction-bar-segment"
      style={{
        backgroundColor: props.colour,
        width: width,
      }}
      title={`${Case.title(props.class)} - ${width}`}
    >
      {
        props.message && <span>{props.message}</span>
      }
    </div>
  );
};

interface IPredictionBarProps {
  height?: number;
  predictions: IPrediction[] | null;
  colours: string[];
}

export const PredictionBar: FunctionComponent<IPredictionBarProps> = (props) => {
  function predictionBarSegments(predictions: IPrediction[]) {
    return predictions.map((prediction, index) => (
      <PredictionBarSegment
        key={prediction.class}
        class={prediction.class}
        score={prediction.score}
        colour={props.colours[index]}
      />
    ));
  }

  function emptyPredictionsMessage() {
    return (
      <div className="prediction-bar-message">
        <span>Draw something to see predictions</span>
      </div>
    );
  }

  return (
    <div
      className="prediction-bar"
      style={{ height: props.height || 0 }}
    >
      {
        props.predictions
          ? predictionBarSegments(props.predictions)
          : emptyPredictionsMessage()
      }
    </div>
  );
}
