import logo from './logo.svg';
import './App.css';
import './css.css';

import React, { useRef, useState, useEffect} from "react";
import * as poseDetection from '@tensorflow-models/pose-detection';
import * as tf from '@tensorflow/tfjs-core';
// Register one of the TF.js backends.
import '@tensorflow/tfjs-backend-webgl';

import Webcam from "react-webcam";

import { drawKeypoints, drawSkeleton, drawSpecific, drawSegment, drawText, drawCircle, drawPoint } from "./utilities";

import FPSStats from "react-fps-stats"

//import MetaTags from 'react-meta-tags';

import {Helmet} from "react-helmet";

import MediaQuery from 'react-responsive'


function App() {
  
  

  const [appState, setAppState] = useState("stop");

   const exerciseStates = ["setup", "run", "finish"]
   const armStates = ["inside", "outside"]

  const webcamRef = useRef(null);
  const canvasRef = useRef(null);

  var list = []

  var videoWidth = 640
  var videoHeight = 480

  //console.log(appState)

  if (appState == "run") {

    //console.log(appState + " run")

    const detectorConfig = {modelType: poseDetection.movenet.modelType.SINGLEPOSE_THUNDER};

    var detector = null;

    

    var currentExerciseState = "setup";
    var currentArmState = "inside";


    var count = 0
    var st = 0

    const FPS = 60

    const PX_THRESHOLD = 10
    const SCALE = 1

    const REPETITIONS = 10

    const colour1 = "#F5CAC3"
    const colour2 = "#F7EDE2"

    var interval = null;





    // functions

    function determineExerciseState(leftShoulderX, leftWristX) {

      if (((leftWristX) > leftShoulderX) && (currentArmState != "outside")) {
        currentArmState = "outside";

        
      }
      else if ((leftWristX < leftShoulderX)  && (currentArmState != "inside")) {
        currentArmState = "inside";

        count += 1;

      }

      if (count >= REPETITIONS) {
        currentExerciseState = exerciseStates[2]
      }
      
    }

    function drawRepetitions(ctx, canvas){

      drawText(canvas.current.width - 50, 50, count +"/"+ REPETITIONS, 24, colour1, SCALE, ctx)

    }

    const isArmAside = async (leftShoulder, leftElbow, ctx, canvas) => {
    
      if (Math.abs(leftShoulder.x - leftElbow.x) > PX_THRESHOLD * 5) {

        drawSegment([leftShoulder.y, leftShoulder.x], [leftElbow.y, leftElbow.x], colour2, SCALE, ctx )
        
        drawText(50, 100, "Make sure your arm is aside", 24, colour2, SCALE, ctx)

      }

    }


    const isWristAlgned = async (leftElbow, leftWrist, ctx, canvas) => {
      
      if (Math.abs(leftElbow.y - leftWrist.y) > PX_THRESHOLD * 5) {

        drawSegment([leftElbow.y, leftElbow.x - 100], [leftElbow.y, leftElbow.x + 100], colour2, SCALE, ctx )

        drawText(50, 150, "Maintain horizontal line of a wrist", 24, colour2, SCALE, ctx)

      }
    }

    function isReadyToStart(leftShoulder, rightShoulder, leftElbow, leftWrist,  ctx) {

      //console.log("sh: "+ Math.abs((rightShoulder.x - leftShoulder.x)) )
      //console.log(leftWrist.x)
      //console.log("r: " + (Math.abs((rightShoulder.x - leftShoulder.x)) - leftWrist.x))
      // Wrist is around the middle of a chest

      const positionX = Math.abs((rightShoulder.x - leftShoulder.x)/2 + leftShoulder.x)
      const positionY = leftElbow.y
      drawCircle(positionX, positionY, PX_THRESHOLD, ctx)
      
      if (((Math.abs(leftWrist.x - positionX) < PX_THRESHOLD * 5) && (positionX > 0))
        && (Math.abs(leftWrist.y - positionY) < PX_THRESHOLD * 5) && (positionY > 0)) {

        currentExerciseState = exerciseStates[1]
        //console.log(rightShoulder.x )
        //console.log(leftShoulder.x)
        //console.log(leftWrist.x)
        //console.log(Math.abs(rightShoulder.x - leftShoulder.x) - leftWrist.x)

      }

    }





    const setupDetector = async () => {

      //console.log("setupDetector A")

      detector = await poseDetection.createDetector(poseDetection.SupportedModels.MoveNet, detectorConfig);
      //console.log("setupDetector B")
    
    }
    
    function runDetection() {

      //console.log("runDetection A")

      if (currentExerciseState == exerciseStates[2]) {
        return
      }

      console.log("runDetection B")

      // if (detector === null) {
      //   return
      // }

      interval = setInterval(() => {
        console.log("interval")

        detect();
        
      }, 1000/FPS);

        
    

      //clearInterval(interval)
    }

    const detect = async () => {

      //console.log("detect A")

      if (detector === null) {
        return
      }

      if (
        typeof webcamRef.current !== "undefined" &&
        webcamRef.current !== null &&
        webcamRef.current.video.readyState === 4
      ) {

        // Get Video Properties
        const video = webcamRef.current.video;
        videoWidth = webcamRef.current.video.videoWidth;
        videoHeight = webcamRef.current.video.videoHeight;

        // Set video width
        webcamRef.current.video.width = videoWidth;
        webcamRef.current.video.height = videoHeight;
    
        //var startTime = performance.now()
      const poses = await detector.estimatePoses(video);
      //var endTime = performance.now()
        //console.log(`Call to doSomething took ${endTime - startTime} milliseconds`)
    
      console.log(videoWidth)
      drawCanvas(poses, video, videoWidth, videoHeight, canvasRef);

      }
    }

    function drawCanvas (pose, video, videoWidth, videoHeight, canvas) {
      const ctx = canvas.current.getContext("2d");
      canvas.current.width = videoWidth;
      canvas.current.height = videoHeight;

      //console.log(currentExerciseState)

      switch(currentExerciseState) {
        case "setup":
          
          // Exercise specific keypoints
          //drawSpecific(pose[0]["keypoints"], 0.3, ctx)
          drawPoint(ctx, pose[0]["keypoints"][9].y * 1, pose[0]["keypoints"][9].x * 1, 3, "aqua");

          drawText(50, 50, "Put left palm on your body where a circle is to begin", 24, colour1, SCALE, ctx)

          isReadyToStart(pose[0]["keypoints"][5], pose[0]["keypoints"][6], pose[0]["keypoints"][7], pose[0]["keypoints"][9], ctx)

          
          break;       
        case "run":


          if (currentArmState === armStates[0]) {
            drawText(50, 50, "Move arm outside", 24, colour1, SCALE, ctx)

          } else {
            drawText(50, 50, "Move arm inside", 24, colour1, SCALE, ctx)
          }
          
          drawRepetitions(ctx, canvas)
          determineExerciseState(pose[0]["keypoints"][5].x, pose[0]["keypoints"][9].x)     
          // Check if arm is located aside body, warn if not
          isArmAside(pose[0]["keypoints"][5], pose[0]["keypoints"][7], ctx, canvas)
          //isShoulderStationary(pose[0]["keypoints"][5], pose[0]["keypoints"][6], ctx)
          isWristAlgned(pose[0]["keypoints"][7], pose[0]["keypoints"][9], ctx, canvas)
          
          break;
        case "finish":
          drawText(50, 50, "Exercise finished", 24, colour1,  SCALE, ctx)
          setAppState("stop")
          currentExerciseState = exerciseStates[2]
          clearInterval(interval)

          break;
        default:
          console.log("exercise state error occured. Restart page.");
      } 

      
    };

      // main

          
      setupDetector()
      runDetection();

      


  }

  function setExerciseState(state) {
    currentExerciseState = state
  }

  return (
    <div className="App">
      <header className="App-header">
      {/* <MetaTags>
        <meta name="viewport" content="width=device-width, initial-scale=1.0"></meta>
      </MetaTags> */}

      <Helmet>
          <meta name="viewport" content="width=device-width, initial-scale=1.0"></meta>
          <title>Prototype exercise 1.0.1</title>
          {/* <link rel="canonical" href="http://mysite.com/example" /> */}
      </Helmet>

      <MediaQuery minWidth={1224}>
        <Webcam
              ref={webcamRef}
              style={{
                position: "absolute",
                marginLeft: "auto",
                marginRight: "auto",
                left: 0,
                right: 0,
                textAlign: "center",
                zindex: 9,
                width: 640,
                height: 480,
              }}
            />

        <canvas
          ref={canvasRef}
          style={{
            position: "absolute",
            marginLeft: "auto",
            marginRight: "auto",
            left: 0,
            right: 0,
            textAlign: "center",
            zindex: 9,
            width: 640,
            height: 480,
          }}
      />

        <div id='button'>
        <button  onClick={() => {setAppState("run")}}>
        (Re)Start
        </button>
        </div>


      </MediaQuery>

      <MediaQuery maxWidth={640}>
        <Webcam
              ref={webcamRef}
              style={{
                position: "absolute",
                marginLeft: "auto",
                marginRight: "auto",
                left: 0,
                right: 0,
                textAlign: "center",
                zindex: 9,
                width: 320,
                height: 240,
              }}
            />

        <canvas
          ref={canvasRef}
          style={{
            position: "absolute",
            marginLeft: "auto",
            marginRight: "auto",
            left: 0,
            right: 0,
            textAlign: "center",
            zindex: 9,
            width: 320,
            height: 240,
          }}
      />

        <div id='button'>
        <button  onClick={() => {setAppState("run")}}>
        (Re)Start
        </button>
        </div>


      </MediaQuery>

        

      

      {/* <button onClick={() => {setAppState("stop"); setExerciseState(exerciseStates[2]); clearInterval(interval)}}>
      Stop
      </button> */}
      <FPSStats />



      </header>
    </div>
  );
}

export default App;
