import logo from './logo.svg';
import './App.css';
import './css.css';

import React from "react";
import * as poseDetection from '@tensorflow-models/pose-detection';
import * as tf from '@tensorflow/tfjs-core';
// Register one of the TF.js backends.
import '@tensorflow/tfjs-backend-webgl';


import { getByPlaceholderText } from '@testing-library/react';

import ShoulderExercise from './exercises/ShoulderExercise';


function App() {


  return (
    
    <ShoulderExercise />
         
     
  );
}

export default App;
