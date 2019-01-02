import * as React from 'react';
import { StatelessComponent } from 'react';

import { Navbar } from '../Navbar';
import { PredictPage } from '../PredictPage';

import './App.scss';

export const App: StatelessComponent = () => (
  <div className="app">
    <Navbar />
    <PredictPage />
  </div>
);
