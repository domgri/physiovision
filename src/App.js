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
import { Container } from 'postcss';

import exerciseSource from "./videos/exercise.mp4";


// Todo:
// 1. Start with fitting in a screen with hands up (2 sec?) alligned (check by wrist positions)
// 2. start exercise by leaning to one side (5 sec)
// 3. then lean to another side
// 4. repeat 5 times
// 5. minotor that hands are still straight

// 1. Elbows above ears, and wrists visible - stop video until position is reached
// 2. elbow below shoulder, wrist further than shoulder - stop until done
// 1. again
// 3. - 2 but in other side



function App() {

  const [appState, setAppState] = useState("begin");
  const [appInterval, setAppInterval] = useState();

   const exerciseStates = ["HANDS_UP", "LEAN_RIGHT", "LEAN_LEFT"]
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

  const [seconds, setSeconds] = useState(0)
  const [isCorrectPose, setIsCorrectPose] = useState("no")
  

  //console.log(appState)

  if (appState == "run") {

    

    //console.log(appState + " run")

    const detectorConfig = {modelType: poseDetection.movenet.modelType.SINGLEPOSE_THUNDER};

    var detector = null;

    var currentExerciseState = "HANDS_UP";
    var side = "left"
    var positionCounter = 0


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

    var points = [0,4,11,15,21,26,31,35,42],
    index = 1,
    currentStopTime = points[index];

    var video = document.getElementById("exerciseVideo"); 
    video.play();

    var token;
    var sec = 0

    var setTimerIsSet = false


    async function setTimer() {

      console.log("setTimer!")

      if (sec > 0) {
        return
      }
      
      console.log("setTimer2")
      sec = 5
      setSeconds(sec)
      token = await setInterval(updateTimer, 1000)
      console.log("setTimer!3")
    }

    // functions

    function updateTimer() {
      sec -= 1
      setSeconds(seconds => sec)

      if (sec===0) {
        clearInterval(token)
      }
    }

    function once(fn, context) { 
      var result;
      return function() { 
          if (fn) {
              result = fn.apply(context || this, arguments);
              fn = null;
          }
          return result;
      };
  }


    function checkTime() {
      // console.log("positionCounter: " + positionCounter)
      // console.log("index: " + index)
      if ((video.currentTime >= currentStopTime) && (positionCounter < index)) {
          video.pause();
          
          if (points.length > ++index) {       // increase index and get next time
              currentStopTime = points[index]
          }
          else {                               // or loop/next...
              // done
          }
      }
  }

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

    function startInterval () {
      interval = setInterval(() => {
        //console.log("interval")

        detect();
        
      }, 1000/FPS);
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

      

      startInterval()
      

      // clearInterval(interval)

      // console.log(interval + " a")
      // appInterval(interval)

        
    

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
    
      // console.log(vWidth + " " + vHeight)
      // console.log(WIDTH+ " " + HEIGHT)
      // console.log(WIDTH * (vWidth / WIDTH)+ " " + HEIGHT * (vHeight / HEIGHT))
      // console.log("--")



      drawCanvas(poses, video, videoWidth, videoHeight, canvasRef);

      }
    }

    function mirror(ctx, videoWidth) {
        ctx.translate(videoWidth, 0);
        ctx.scale(-1, 1);

    }

    function timeout(time) {
      clearInterval(interval)
          setTimeout(() => {
            startInterval()
          }, 1000)

    }

    function areHandsUp(leftElbowY, leftEarY, rightElbowY, rightEarY) {
        if ((leftElbowY < leftEarY) && (rightElbowY < rightEarY)) {
          console.log(leftElbowY + " " + leftEarY)
          console.log(rightElbowY + " " + rightEarY)
          console.log("----")
          // const sleep = ms => new Promise(r => setTimeout(r, ms));
          // sleep(2000);
          console.log("YES!!!!!!!!!!!!")
          
          if (side === "left") {
            currentExerciseState = "LEAN_LEFT"
            side = "right"
          } else {
            currentExerciseState = "LEAN_RIGHT"
            side = "left"
          }
          
          
          // setIsCorrectPose("yess")
          // setTimeout(() => {
          //   setIsCorrectPose("no");
          // }, 1000);
            //setTimer()
            // if (!setTimerIsSet) {
            //   once(setTimer())
            //   setTimerIsSet = true
            // }
              
          
          video.play();
          positionCounter++;

          
          
        }
    }

    function isLeanCorrect(shoulderX, shoulderY, elbowBelowY, wristX) {
      if (side === "left") {
        if ((shoulderX < wristX) && (shoulderY < elbowBelowY)) {
          console.log ("GOOD LEAN left!!!")
          currentExerciseState = "HANDS_UP"
          //setTimer()

          
          video.play();
          positionCounter++;
        }
      } else {
        if ((shoulderX > wristX) && (shoulderY < elbowBelowY)) {
          console.log ("GOOD LEAN right!!!")
          currentExerciseState = "HANDS_UP"
          //setTimer()
          video.play();
          positionCounter++;
        }
      }

      
      

    }


    function drawCanvas (pose, video, videoWidth, videoHeight, canvas) {
      const ctx = canvas.current.getContext("2d");
      //const ctxEx = canvas.current.getContext("2d");
      canvas.current.width = videoWidth;
      canvas.current.height = videoHeight;


      
      //const [mirroredState, setMirroredState] = useState(true);

      checkTime()
      //console.log("seconds = " + seconds)
      switch(currentExerciseState) {
        case "HANDS_UP":

          // mirrored first
          mirror(ctx, videoWidth)

          // Exercise specific keypoints
          // right elbow
          //drawPoint(ctx, pose[0]["keypoints"][8].y * 1, pose[0]["keypoints"][8].x * 1, 3, "red");
          //left elbow
         // drawPoint(ctx, pose[0]["keypoints"][7].y * 1, pose[0]["keypoints"][7].x * 1, 3, "aqua");
          //right ear
          //drawPoint(ctx, pose[0]["keypoints"][4].y * 1, pose[0]["keypoints"][4].x * 1, 3, "orange");
          //left ear
         //drawPoint(ctx, pose[0]["keypoints"][3].y * 1, pose[0]["keypoints"][3].x * 1, 3, "blue");

       
            areHandsUp(pose[0]["keypoints"][7].y, pose[0]["keypoints"][3].y, pose[0]["keypoints"][8].y, pose[0]["keypoints"][4].y)
          
          

          break;
        
        case "LEAN_LEFT":

          // mirrored first
          mirror(ctx, videoWidth)

          // Exercise specific keypoints
          // left wrist
          //drawPoint(ctx, pose[0]["keypoints"][9].y * 1, pose[0]["keypoints"][9].x * 1, 3, "red");

          //right elbow
          //drawPoint(ctx, pose[0]["keypoints"][8].y * 1, pose[0]["keypoints"][8].x * 1, 3, "aqua");
          //right shoulder
          //drawPoint(ctx, pose[0]["keypoints"][6].y * 1, pose[0]["keypoints"][6].x * 1, 3, "blue");
          
    
            isLeanCorrect(pose[0]["keypoints"][6].x, pose[0]["keypoints"][6].y, pose[0]["keypoints"][8].y, pose[0]["keypoints"][9].x)

         
          
          break;

        case "LEAN_RIGHT":

          // mirrored first
          mirror(ctx, videoWidth)

          // Exercise specific keypoints
          // right wrist
          //drawPoint(ctx, pose[0]["keypoints"][10].y * 1, pose[0]["keypoints"][10].x * 1, 3, "red");

          //left elbow
          //drawPoint(ctx, pose[0]["keypoints"][7].y * 1, pose[0]["keypoints"][7].x * 1, 3, "aqua");
          //left shoulder
          //drawPoint(ctx, pose[0]["keypoints"][5].y * 1, pose[0]["keypoints"][5].x * 1, 3, "blue");

 
            isLeanCorrect(pose[0]["keypoints"][5].x, pose[0]["keypoints"][5].y, pose[0]["keypoints"][7].y, pose[0]["keypoints"][10].x)
 
         
          
          break;    




        // // mirrored first
        // mirror(ctx, videoWidth)

        // // Exercise specific keypoints
        // //drawSpecific(pose[0]["keypoints"], 0.3, ctx)
        // drawPoint(ctx, pose[0]["keypoints"][9].y * 1, pose[0]["keypoints"][9].x * 1, 3, "aqua");

        // isReadyToStart(pose[0]["keypoints"][5], pose[0]["keypoints"][6], pose[0]["keypoints"][7], pose[0]["keypoints"][9], ctx)


        // // normal second
        // mirror(ctx, videoWidth)

        // drawText(50, 50, "Put left palm on your body where a circle is to begin", 24, colour1, SCALE, ctx)


          
        
        // case "run":


        // // mirrored first (roughyl, some methods do that inside)
        // mirror(ctx, videoWidth)

        // // Check if arm is located aside body, warn if not
        // isArmAside(pose[0]["keypoints"][5], pose[0]["keypoints"][7], ctx, canvas, videoWidth)
        
        // isWristAlgned(pose[0]["keypoints"][7], pose[0]["keypoints"][9], ctx, canvas, videoWidth)




        // // normal second
        // mirror(ctx, videoWidth)

        //   if (currentArmState === armStates[0]) {
        //     drawText(50, 50, "Move arm outside", 24, colour1, SCALE, ctx)

        //   } else {
        //     drawText(50, 50, "Move arm inside", 24, colour1, SCALE, ctx)
        //   }
          
        //   drawRepetitions(ctx, canvas)

        //   determineExerciseState(pose[0]["keypoints"][5].x, pose[0]["keypoints"][9].x)     
          
        //   //isShoulderStationary(pose[0]["keypoints"][5], pose[0]["keypoints"][6], ctx)
          
          
        //   break;
        // case "finish":
        //   drawText(50, 50, "Exercise finished", 24, colour1,  SCALE, ctx)
        //   setAppState("stop")
        //   currentExerciseState = exerciseStates[2]
        //   clearInterval(interval)

        //   break;
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

  return (
    
    <div className="App">
      <header className="App-header">



      {/* <div style={{display : appState === 'begin' ? 'block' : 'none'}}>
      <button onClick={() =>  setAppState("run")} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" >
        Begin
      </button>
      </div>
      <div style={{display : appState === 'run' ? 'block' : 'none'}}>
      <button onClick={() =>  {setAppState("stop"); console.log("interval= " + interval); clearInterval(interval)}} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" >
        Early stop
      </button>
      </div>
      <div style={{display : appState === 'stop' ? 'block' : 'none'}}>
      <button onClick={() =>  {setAppState("run"); clearInterval(interval)}} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" >
        Continue
      </button>
      </div> */}

{/*  
      <div style={{display : appState === 'begin' ? 'block' : 'none'}}>

      </div>

      <div style={{display : appState === 'begin' ? 'block' : 'none'}}>

      </div> */}

      <div class="flex flex-col space-y-4 ...">


      <div class="flex flex-row space-x-4 my-5">
        <div class="basis-1/3 rounded border-solid text-xl">
          physioloop.io
        
{/*        
        <button  onClick={() => {setAppState("run")}}>
        (Re)Start
        </button> */}
       

        </div>
        <div class="basis-1/3 rounded border-solid border-2 border-blue-600 hover:bg-sky-700 text-2xl ">

                 
        <button  onClick={() => {setAppState("run")}}>
        Begin
        </button>
        </div>
        <div class="basis-1/3 rounded border-solid "> </div>
      
      </div>

      <div class="flex flex-row  flex-wrap rounded border-solid border-2 border-blue-600">
       <div class=' h-128  max-h-full  grow'> 
       
       <div className="video">

        <video id="exerciseVideo" width="640" height="480" autoPlay="autoplay" style={{
          position: "relative",
          marginLeft: "auto",
          marginRight: "auto",
          paddingTop: 20,
          left: 0,
          right: 0,
          // "z-index": 1,
        }}>

<source src={exerciseSource} type="video/mp4" />
      </video>

       </div>
       
       </div>


       <div className = "webcam">

       <Webcam 
              ref={webcamRef}
              mirrored
              style={{
                position: "relative",
                marginLeft: "auto",
                marginRight: "auto",
                paddingTop: 20,
                left: 0,
                right: 0,
                textAlign: "center",
                // zindex: 0,
                width: 640,
                height: 480,
              }}
            /> 

       </div>
        
        <div className="canvas">
        <canvas
          ref={canvasRef}
          style={{
            position: "absolute",
            marginLeft: "860px",
            marginRight: "auto",
            paddingTop: 20,
            left: 0,
            right: 0,
            textAlign: "center",
            // "z-index": 2,
            width: 640,
            height: 480,
          }}
        />

        </div>

       
        
        
     
      </div>
      

      <div class="flex flex-row">
        <div class="basis-1/3"></div>
        <div class="basis-1/3"></div>
        <div class="basis-1/3">Exercise credits: <a href="https://www.youtube.com/c/YogawithUliana">Yoga with Uliana </a></div>
      </div>

      </div> 
      
      

      {/* <Helmet>
          <meta name="viewport" content="width=device-width, initial-scale=1.0"></meta>
          <title>Physioloop.io strech exercise</title>
      </Helmet>
      <h1 className="text-3xl font-bold underline">
      Hello world!
    </h1>
      <div> state: {currentExerciseState }</div>

      <MediaQuery minWidth={1224}>
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
              mirrored
              style={{
                position: "absolute",
                marginLeft: "auto",
                marginRight: "auto",
                left: 0,
                right: 0,
                textAlign: "center",
                zindex: 9,
                width: (WIDTH * (vWidth / WIDTH)) * 0.8,
                height: (HEIGHT * (vHeight / HEIGHT)) * 0.8,
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
            width: (WIDTH * (vWidth / WIDTH)) * 0.8,
            height: (HEIGHT * (vHeight / HEIGHT)) * 0.8,
            
          }}
      />

        <div id='button'>
        <button  onClick={() => {setAppState("run")}}>
        (Re)Start
        </button>
        </div>


      </MediaQuery>

      <FPSStats /> */}

      </header>
    </div>
  );
}

export default App;
