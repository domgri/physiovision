import logo from './logo.svg';
import './App.css';
import './css.css';

import React, { useRef, useState, useEffect, useLayoutEffect} from "react";
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
import { getByPlaceholderText } from '@testing-library/react';


  // // Get display size
    
  // function getWindowDimensions() {
  //   const { innerWidth: width, innerHeight: height } = window;
  //   return {
  //     width,
  //     height
  //   };
  // }
  
  //  function useWindowDimensions() {
  //   const [windowDimensions, setWindowDimensions] = useState(getWindowDimensions());
  
  //   useEffect(() => {
  //     function handleResize() {
  //       setWindowDimensions(getWindowDimensions());
  //     }
  
  //     window.addEventListener('resize', handleResize);
  //     return () => window.removeEventListener('resize', handleResize);
  //   }, []);
  
  //   return windowDimensions;
  // }


function App() {
  
  const [globalState, setGlobalState] = useState("pre-start");
  const globalStates = ["pre-start", "crossroad", "tutorial", "crossroad2", "device-tutorial", "exercise", "finish"];

  const [appState, setAppState] = useState("stop");

   const exerciseStates = ["setup", "run", "finish"]
   const armStates = ["inside", "outside"]

  const webcamRef = useRef(null);
  const canvasRef = useRef(null);

  var list = []

    var vWidth = window.innerWidth;
    var vHeight = window.innerHeight;

  //const {vWidth, vHeight} = useWindowDimensions();
  console.log(vWidth)

  const WIDTH = 640
  const HEIGHT = 480

  const [size, setSize] = useState([0, 0]);

  const [screenWidth, setScreenWidth] = useState(0);
  const [screenHeight, setScreenHeight] = useState(0);


  
  

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

    const isArmAside = async (leftShoulder, leftElbow, ctx, canvas, videoWidth) => {
    
      if (Math.abs(leftShoulder.x - leftElbow.x) > PX_THRESHOLD * 5) {

        drawSegment([leftShoulder.y, leftShoulder.x], [leftElbow.y, leftElbow.x], colour2, SCALE, ctx )

        mirror(ctx, videoWidth)
        
        drawText(50, 100, "Make sure your arm is aside", 24, colour2, SCALE, ctx)

        mirror(ctx, videoWidth)

      }

    }


    const isWristAlgned = async (leftElbow, leftWrist, ctx, canvas, videoWidth) => {
      
      if (Math.abs(leftElbow.y - leftWrist.y) > PX_THRESHOLD * 5) {

        drawSegment([leftElbow.y, leftElbow.x - 100], [leftElbow.y, leftElbow.x + 100], colour2, SCALE, ctx )

        mirror(ctx, videoWidth)

        drawText(50, 150, "Maintain horizontal line of a wrist", 24, colour2, SCALE, ctx)

        mirror(ctx, videoWidth)

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

      console.log(currentExerciseState)

      if (currentExerciseState == exerciseStates[2]) {
        return
      }

      // if (detector === null) {
      //   return
      // }

      interval = setInterval(() => {
        console.log("interval")
        console.log(currentExerciseState)

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
        const videoWidth = webcamRef.current.video.videoWidth;
        const videoHeight = webcamRef.current.video.videoHeight;

        // Set video width
        webcamRef.current.video.width = videoWidth;
        webcamRef.current.video.height = videoHeight;
    
        //var startTime = performance.now()
      const poses = await detector.estimatePoses(video);
      //var endTime = performance.now()
        //console.log(`Call to doSomething took ${endTime - startTime} milliseconds`)
    
      console.log(vWidth + " " + vHeight)
      console.log(WIDTH+ " " + HEIGHT)
      console.log(WIDTH * (vWidth / WIDTH)+ " " + HEIGHT * (vHeight / HEIGHT))
      console.log("--")



      drawCanvas(poses, video, videoWidth, videoHeight, canvasRef);

      }
    }

    function mirror(ctx, videoWidth) {
        ctx.translate(videoWidth, 0);
        ctx.scale(-1, 1);

    }


    function drawCanvas (pose, video, videoWidth, videoHeight, canvas) {
      const ctx = canvas.current.getContext("2d");
      //const ctxEx = canvas.current.getContext("2d");
      canvas.current.width = videoWidth;
      canvas.current.height = videoHeight;


      
      //const [mirroredState, setMirroredState] = useState(true);
      
      
      



      


      switch(currentExerciseState) {
        case "setup":

        // mirrored first
        mirror(ctx, videoWidth)

        // Exercise specific keypoints
        //drawSpecific(pose[0]["keypoints"], 0.3, ctx)
        drawPoint(ctx, pose[0]["keypoints"][9].y * 1, pose[0]["keypoints"][9].x * 1, 3, "aqua");

        isReadyToStart(pose[0]["keypoints"][5], pose[0]["keypoints"][6], pose[0]["keypoints"][7], pose[0]["keypoints"][9], ctx)


        // normal second
        mirror(ctx, videoWidth)

        drawText(50, 50, "Put left palm on your body where a circle is to begin", 24, colour1, SCALE, ctx)


          
          break;       
        case "run":


        // mirrored first (roughyl, some methods do that inside)
        mirror(ctx, videoWidth)

        // Check if arm is located aside body, warn if not
        isArmAside(pose[0]["keypoints"][5], pose[0]["keypoints"][7], ctx, canvas, videoWidth)
        
        isWristAlgned(pose[0]["keypoints"][7], pose[0]["keypoints"][9], ctx, canvas, videoWidth)




        // normal second
        mirror(ctx, videoWidth)

          if (currentArmState === armStates[0]) {
            drawText(50, 50, "Move arm outside", 24, colour1, SCALE, ctx)

          } else {
            drawText(50, 50, "Move arm inside", 24, colour1, SCALE, ctx)
          }
          
          drawRepetitions(ctx, canvas)

          determineExerciseState(pose[0]["keypoints"][5].x, pose[0]["keypoints"][9].x)     
          
          //isShoulderStationary(pose[0]["keypoints"][5], pose[0]["keypoints"][6], ctx)
          
          
          break;
        case "finish":
          drawText(50, 50, "Exercise finished", 24, colour1,  SCALE, ctx)
          setAppState("stop")
          currentExerciseState = exerciseStates[2]
          clearInterval(interval)
          setGlobalState("finish")

          break;
        default:
          console.log("exercise state error occured. Restart page.");
      } 

      
    };

  
      // main
      //const [width, height] = useWindowSize();
          
      setupDetector();
      
      runDetection();
      

  }

  function setExerciseState(state) {
    currentExerciseState = state
  }


  // States of exercise pipeline

  function PreStartState(props) {
    return (<div><h1>Left shoulder external rotation</h1>
     <button  onClick={() => {setGlobalState("crossroad")}}> Try now</button>
     </div>);
  }

  
  function CrossroadState(props) {
    return (<div><h1>Crossroad</h1>
    <div>
    <button  onClick={() => {setGlobalState("tutorial");}}>  Exercise Tutorial </button>
    </div>
     
     <button  onClick={() => {setGlobalState("device-tutorial")}}> Where to put device?</button>
     <button  onClick={() => {setGlobalState("exercise"); setAppState("run")}}> Start exercise</button>
     </div>);
  }


  // for auto play https://stackoverflow.com/questions/37463832/how-to-play-pause-video-in-react-without-external-library

  // const vidRef = useRef(null);
  // const handlePlayVideo = () => {
  //   console.log(vidRef)
  //   vidRef.current.play();
  // }

  function TutorialState(props) {
    return (<div><h1>Tutorial</h1>
    <div>
    <video src="/tutorials/placeholder.mp4" controls="controls" type="video/mp4"></video>
    </div>
     <button  onClick={() => {setGlobalState("crossroad2")}}> Continue</button>
     </div>);
  }

  function Crossroad2State(props) {
    return (<div><h1>Crossroad2</h1>
     <button  onClick={() => {setGlobalState("device-tutorial")}}> Where to put device?</button>
     <button  onClick={() => {setGlobalState("exercise"); setAppState("run")}}> Start exercise</button>
     </div>);
  }

  function DeviceTutorialState(props) {
    return (<div><h1>DeviceTutorial</h1>
    <div>
    <video src="/tutorials/placeholder.mp4" controls="controls" type="video/mp4"></video>
    </div>
     <button  onClick={() => {setGlobalState("exercise"); setAppState("run")}}> Begin exercise</button>
     </div>);
  }

  function ExerciseState(props) {
    return (
      <div>
        

<MediaQuery minWidth={767}>

         <Webcam
              ref={webcamRef}
              mirrored
              style={{
                
                  position: "absolute",
                 marginLeft: "auto",
                 marginRight: "auto",
                  left: 0,
                  right: 0,
                   top: 100,
                  // bottom: '50%',
                textAlign: "center",
                zindex: 9,
                width: WIDTH,
                height: HEIGHT,
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
               top: 100,
              // bottom: '50%',
            textAlign: "center",
            zindex: 9,
            width: WIDTH,
            height: HEIGHT,
          }}
      />

        {/* <div id='button-exercise-desktop'>
        <button  onClick={() => {setAppState("run")}}>
        (Re)Start
        </button>
        </div>  */}

       
        <div id='button-exercise-desktop'>
        <button  onClick={() => {setGlobalState("finish"); setAppState("stop"); currentExerciseState = exerciseStates[2]; clearInterval(interval)}}>
        Finish now
        </button>
        </div> 
        
      </MediaQuery>



      <MediaQuery maxWidth={767}>
         <Webcam
              ref={webcamRef}
              mirrored
              style={{
                position: "absolute",
                marginLeft: "auto",
                marginRight: "auto",
                left: 0,
                right: 0,
                top: 100,
                textAlign: "center",
                zindex: 9,
                width: WIDTH / 2,
                height: HEIGHT / 2,
                // width: (WIDTH * (vWidth / WIDTH)) * 0.8,
                // height: (HEIGHT * (vHeight / HEIGHT)) * 0.8,

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
            top: 100,
            textAlign: "center",
            zindex: 9,
            width: WIDTH / 2,
            height: HEIGHT / 2,
            
          }}
      />

        {/* <div id='button'>
        <button  onClick={() => {setAppState("run")}}>
        (Re)Start
        </button>
        </div>  */}

      <div id='button-exercise-mobile'>
        <button  onClick={() => {setGlobalState("finish"); setAppState("stop")}}>
        Finish now
        </button>
        </div> 


      </MediaQuery>



      </div>

      

    );

  }

  function FinishState(props) {
    return (<div><h1>Finish</h1>
     <button  onClick={() => {setGlobalState("pre-start")}}> Once again</button>
     </div>);
  }
 


  return (
    
    <div className="App">
      <header className="App-header">

      {/* THrows error!!!!!
      <Helmet>
          <meta name="viewport" content="width=device-width, initial-scale=1.0"></meta>
          <title>Prototype exercise 1.0.2</title>
         
      </Helmet> */}

      <div style={{display : globalState === 'pre-start' ? 'block' : 'none'}}>
      <PreStartState/>
      </div>
      <div style={{display : globalState === 'crossroad' ? 'block' : 'none'}}>
      <CrossroadState/>
      </div>
      <div style={{display : globalState === 'tutorial' ? 'block' : 'none'}}>
      <TutorialState/>
      </div>
      <div style={{display : globalState === 'device-tutorial' ? 'block' : 'none'}}>
      <DeviceTutorialState/>
      </div>
      <div style={{display : globalState === 'crossroad2' ? 'block' : 'none'}}>
      <Crossroad2State/>
      </div>
      <div id="middle" style={{display : globalState === 'exercise' ? 'block' : 'none'}}>
      <ExerciseState/>
      </div>
      <div style={{display : globalState === 'finish' ? 'block' : 'none'}}>
      <FinishState/>
      </div>
         
     


      {/* <MediaQuery minWidth={767}>

         <Webcam
              ref={webcamRef}
              mirrored
              style={{
                position: "absolute",
                marginLeft: "auto",
                marginRight: "auto",
                left: 0,
                right: 0,
                textAlign: "center",
                zindex: 9,
                width: WIDTH,
                height: HEIGHT,
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
            width: WIDTH,
            height: HEIGHT,
          }}
      />

        
        <div id='button'>
        <button  onClick={() => {setAppState("run")}}>
        (Re)Start
        </button>
        </div> 
      </MediaQuery> */}



      {/* <MediaQuery maxWidth={767}>
         <Webcam
              ref={webcamRef}
              mirrored
              style={{
                position: "absolute",
                marginLeft: "auto",
                marginRight: "auto",
                left: 0,
                right: 0,
                textAlign: "center",
                zindex: 9,
                width: WIDTH / 2,
                height: HEIGHT / 2,
                // width: (WIDTH * (vWidth / WIDTH)) * 0.8,
                // height: (HEIGHT * (vHeight / HEIGHT)) * 0.8,

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
            width: WIDTH / 2,
            height: HEIGHT / 2,
            
          }}
      />

        <div id='button'>
        <button  onClick={() => {setAppState("run")}}>
        (Re)Start
        </button>
        </div> 


      </MediaQuery> */}

        

      

      {/* <button onClick={() => {setAppState("stop"); setExerciseState(exerciseStates[2]); clearInterval(interval)}}>
      Stop
      </button> */}
      <FPSStats />



      </header>
    </div>
  );
}

export default App;
