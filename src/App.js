import logo from './logo.svg';
import './App.css';
import './css.css';

import React, { useRef, useState, useEffect, useLayoutEffect } from "react";
import * as poseDetection from '@tensorflow-models/pose-detection';
import * as tf from '@tensorflow/tfjs-core';
// Register one of the TF.js backends.
import '@tensorflow/tfjs-backend-webgl';

import Webcam from "react-webcam";

import { drawKeypoints, drawSkeleton, drawSpecific, drawSegment, drawText, drawCircle, drawPoint } from "./utilities";

import FPSStats from "react-fps-stats"

//import MetaTags from 'react-meta-tags';

import { Helmet } from "react-helmet";

import MediaQuery from 'react-responsive'
import { Container } from 'postcss';

import exerciseSource from "./videos/exercise.mp4";
import { nonMaxSuppressionV3Impl } from '@tensorflow/tfjs-core/dist/backends/non_max_suppression_impl';


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

  const ALLOWED_ELBOW_BEND_ANGLE = 30

  const [failedPositionsState, setFailedPositionsState] = useState([])
  

  //console.log(appState)

  if (appState == "run") {



    //console.log(appState + " run")

    const detectorConfig = { modelType: poseDetection.movenet.modelType.SINGLEPOSE_THUNDER };

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

    var points = [0, 4, 11, 15, 21, 26, 31, 35, 42],
      index = 1,
      currentStopTime = points[index];

      let failedPositions = new Set();
      //let failedPositionsIndexes = new Set()
   

    // points.forEach(element => {let number = element.toString(); failedPositions.number = "blank"; console.log(element)})
    // console.log("aa")
    // console.log(failedPositions)

    var video = document.getElementById("video");

    



    
    video.play();
    video.pause();
    setTimeout(() => {video.play();}, 3000);



    // functions

    function checkTime() {
      console.log("positionCounter: " + positionCounter)
      console.log("index: " + index)
     console.log("cst " + currentStopTime)

     if (currentStopTime === 42) {
       video.pause();
       clearInterval(interval)
       setAppState("end")
       failedPositions.forEach(element => setFailedPositionsState(currentState => [...currentState, element]))
       
       
     }
     if ((video.currentTime >= currentStopTime) ) {

       // if position is not yet done, pause
       if (positionCounter < index) {
         video.pause();
       }

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
      else if ((leftWristX < leftShoulderX) && (currentArmState != "inside")) {
        currentArmState = "inside";

        count += 1;

      }

      if (count >= REPETITIONS) {
        currentExerciseState = exerciseStates[2]
      }

    }

    function drawRepetitions(ctx, canvas) {

      drawText(canvas.current.width - 50, 50, count + "/" + REPETITIONS, 24, colour1, SCALE, ctx)

    }

    const isArmAside = async (leftShoulder, leftElbow, ctx, canvas, videoWidth) => {

      if (Math.abs(leftShoulder.x - leftElbow.x) > PX_THRESHOLD * 5) {

        drawSegment([leftShoulder.y, leftShoulder.x], [leftElbow.y, leftElbow.x], colour2, SCALE, ctx)

        mirror(ctx, videoWidth)

        drawText(50, 100, "Make sure your arm is aside", 24, colour2, SCALE, ctx)

        mirror(ctx, videoWidth)

      }

    }


    const isWristAlgned = async (leftElbow, leftWrist, ctx, canvas, videoWidth) => {

      if (Math.abs(leftElbow.y - leftWrist.y) > PX_THRESHOLD * 5) {

        drawSegment([leftElbow.y, leftElbow.x - 100], [leftElbow.y, leftElbow.x + 100], colour2, SCALE, ctx)

        mirror(ctx, videoWidth)

        drawText(50, 150, "Maintain horizontal line of a wrist", 24, colour2, SCALE, ctx)

        mirror(ctx, videoWidth)

      }
    }

    function isReadyToStart(leftShoulder, rightShoulder, leftElbow, leftWrist, ctx) {

      const positionX = Math.abs((rightShoulder.x - leftShoulder.x) / 2 + leftShoulder.x)
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

    function startInterval() {
      interval = setInterval(() => {
        console.log("interval")

        detect();

      // }, 1000 / FPS);
    }, 500);
    }

    function runDetection() {

      //console.log("runDetection A")

      // if (currentExerciseState == exerciseStates[2]) {
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
      }, time)

    }

    /*
    * Calculates the angle ABC (in radians) 
    *
    * A first point, ex: {x: 0, y: 0}
    * C second point
    * B center point
    */
    function find_angle(A,B,C) {
      var AB = Math.sqrt(Math.pow(B.x-A.x,2)+ Math.pow(B.y-A.y,2));    
      var BC = Math.sqrt(Math.pow(B.x-C.x,2)+ Math.pow(B.y-C.y,2)); 
      var AC = Math.sqrt(Math.pow(C.x-A.x,2)+ Math.pow(C.y-A.y,2));
      return (Math.acos((BC*BC+AB*AB-AC*AC)/(2*BC*AB)) * 180) / Math.PI;
    }

    function isHandStraight(shoulder, elbow, wrist) {

      console.log("is hand straight " + find_angle(shoulder, elbow, wrist))

      if ((find_angle(shoulder, elbow, wrist) - 180 + ALLOWED_ELBOW_BEND_ANGLE) < 0) {
        return false
      }

      return true

    }


    function drawLowerArmWrong(ctx, shoulder, elbow, wrist) {

      drawPoint(ctx, shoulder.y * 1, shoulder.x * 1, 3, "red");
      drawPoint(ctx, wrist.y * 1, wrist.x * 1, 3, "red");
      drawSegment([shoulder.y, shoulder.x],
      [elbow.y, elbow.x], "red", SCALE, ctx )

      drawSegment([elbow.y, elbow.x],
      [wrist.y, wrist.x], "red", SCALE, ctx )
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

        //timeout(2000)
        video.play();
        positionCounter++;



      }
    }

    function isLeanCorrect(shoulderX, shoulderY, elbowBelowY, wristX) {
      if (side === "left") {
        if ((shoulderX < wristX) && (shoulderY < elbowBelowY)) {
          console.log("GOOD LEAN left!!!")
          currentExerciseState = "HANDS_UP"
          //timeout(2000)
          video.play();
          positionCounter++;
        }
      } else {
        if ((shoulderX > wristX) && (shoulderY < elbowBelowY)) {
          console.log("GOOD LEAN right!!!")
          currentExerciseState = "HANDS_UP"
          //timeout(2000)
          video.play();
          positionCounter++;
        }
      }




    }


    function drawCanvas(pose, video, videoWidth, videoHeight, canvas) {
      const ctx = canvas.current.getContext("2d");
      //const ctxEx = canvas.current.getContext("2d");
      canvas.current.width = videoWidth;
      canvas.current.height = videoHeight;



      //const [mirroredState, setMirroredState] = useState(true);

      checkTime()
      switch (currentExerciseState) {
        case "HANDS_UP":

          // mirrored first
          mirror(ctx, videoWidth)

          // // Exercise specific keypoints
          // // right elbow
          // drawPoint(ctx, pose[0]["keypoints"][8].y * 1, pose[0]["keypoints"][8].x * 1, 3, "red");
          // //left elbow
          // drawPoint(ctx, pose[0]["keypoints"][7].y * 1, pose[0]["keypoints"][7].x * 1, 3, "aqua");
          // //right ear
          // drawPoint(ctx, pose[0]["keypoints"][4].y * 1, pose[0]["keypoints"][4].x * 1, 3, "orange");
          // //left ear
          // drawPoint(ctx, pose[0]["keypoints"][3].y * 1, pose[0]["keypoints"][3].x * 1, 3, "blue");

          areHandsUp(pose[0]["keypoints"][7].y, pose[0]["keypoints"][3].y, pose[0]["keypoints"][8].y, pose[0]["keypoints"][4].y)

          break;

        case "LEAN_LEFT":

          // mirrored first
          mirror(ctx, videoWidth)

          // // Exercise specific keypoints
          // // left wrist
          // drawPoint(ctx, pose[0]["keypoints"][9].y * 1, pose[0]["keypoints"][9].x * 1, 3, "red");

          // //right elbow
          // drawPoint(ctx, pose[0]["keypoints"][8].y * 1, pose[0]["keypoints"][8].x * 1, 3, "aqua");
          // //right shoulder
          // drawPoint(ctx, pose[0]["keypoints"][6].y * 1, pose[0]["keypoints"][6].x * 1, 3, "blue");

          isLeanCorrect(pose[0]["keypoints"][6].x, pose[0]["keypoints"][6].y, pose[0]["keypoints"][8].y, pose[0]["keypoints"][9].x)

          if(!isHandStraight(pose[0]["keypoints"][5], pose[0]["keypoints"][7], pose[0]["keypoints"][9])) {
            failedPositions.add(points.indexOf(points[index]) + ", leaning left")
            drawLowerArmWrong(ctx, pose[0]["keypoints"][5], pose[0]["keypoints"][7], pose[0]["keypoints"][9])
          }


          break;

        case "LEAN_RIGHT":

          // mirrored first
          mirror(ctx, videoWidth)

          // // Exercise specific keypoints
          // // right wrist
          // drawPoint(ctx, pose[0]["keypoints"][10].y * 1, pose[0]["keypoints"][10].x * 1, 3, "red");

          // //left elbow
          // drawPoint(ctx, pose[0]["keypoints"][7].y * 1, pose[0]["keypoints"][7].x * 1, 3, "aqua");
          // //left shoulder
          // drawPoint(ctx, pose[0]["keypoints"][5].y * 1, pose[0]["keypoints"][5].x * 1, 3, "blue");

          isLeanCorrect(pose[0]["keypoints"][5].x, pose[0]["keypoints"][5].y, pose[0]["keypoints"][7].y, pose[0]["keypoints"][10].x)

          if(!isHandStraight(pose[0]["keypoints"][6], pose[0]["keypoints"][8], pose[0]["keypoints"][10])) {
            failedPositions.add(points.indexOf(points[index]) + ", leaning right")
            drawLowerArmWrong(ctx, pose[0]["keypoints"][6], pose[0]["keypoints"][8], pose[0]["keypoints"][10])
          }


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

  function setSizeUsingBrowserWidth() {

    var browserWidth = window.innerWidth
    console.log(browserWidth)

    if (browserWidth >= 1280) {
      return WIDTH
    } else if (browserWidth >= 1024) {
      return Math.round(WIDTH / 1.5)
    } 

    return Math.round(WIDTH/ 2)

  }

  function hideLoadingScreenAfterTime(time) {

    setTimeout(function () {
      document.getElementById('loadingScreen').style.display="none"
  }, time);
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


        
          <div id="loadingScreen" class="absolute bg-white bg-opacity-60 z-10 h-full w-full flex items-center justify-center">
            <div class="flex items-center">
              <div style={{display : appState === 'begin' ? 'block' : 'none'}}>
                <button className="text-4xl bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded" onClick={() => { setAppState("run"); hideLoadingScreenAfterTime(2000)}}>
                  Begin
                </button>
              </div>
              <div style={{display : appState === 'run' ? 'block' : 'none'}}>
                <svg class="animate-spin h-10 w-10 text-blue-700" xmlns="http://www.w3.org/2000/svg" fill="none"
                viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                </path>
              </svg>
              </div>
            
              {/* <span class="text-3xl mr-4">Loading</span> */}
          
              {/* <svg class="animate-spin h-5 w-5 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none"
                viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                </path>
              </svg> */}
          
            </div>
          </div>

        

        
       

    
    




        <div class="flex-col space-y-4">
          <div class="flex space-x-4 ">
            <div class="basis-1/3 text-xl">
              physioloop.io
            </div>
            <div>

            </div>
            {/* <div class="basis-1/3 rounded border-solid border-2 border-blue-600 hover:bg-sky-700 text-2xl ">
            </div> */}
            <div class="basis-1/3 text-xl">
              
            </div>
          </div>
          <div class="flex special">
            <div class="basis-1/2">
              <video id="video" width="640" height="480" autoPlay="autoplay" style={{
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
            <div class="relative basis-1/2" >
              <div className="webcam">
                <Webcam
                  ref={webcamRef}
                  mirrored
                  style={{
                    position: "absolute",
                    marginLeft: "auto",
                    marginRight: "auto",
                    paddingTop: 20,
                    left: 0,
                    right: 0,
                    textAlign: "center",
                    // zindex: 0,
                    width: setSizeUsingBrowserWidth(),
                    // height: setSizeUsingBrowserHeight(),
                  }}
                />
              </div>
              
              
              <div className="canvas"> 
                <canvas
                  ref={canvasRef}
                  style={{
                    position: "absolute",
                    marginLeft: "auto",
                    marginRight: "auto",
                    paddingTop: 20,
                    left: 0,
                    right: 0,
                    textAlign: "center",
                    // "z-index": 2,
                    width: setSizeUsingBrowserWidth(),
                    // height: setSizeUsingBrowserHeight(),
                  }}
                />
              </div>
            </div>
          </div>
        </div>


{/** end message template */}

        <div style={{display : appState === 'end' ? 'block' : 'none'}}>

{/*https://tailwindui.com/components/application-ui/overlays/modals*/}

<div class="relative z-10" aria-labelledby="modal-title" role="dialog" aria-modal="true">

  <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>

  <div class="fixed z-10 inset-0 overflow-y-auto">
    <div class="flex items-end sm:items-center justify-center min-h-full p-4 text-center sm:p-0">

      <div class="relative bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:max-w-lg ">
        <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
          <div class="sm:flex sm:items-start">
            <div class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-green-100 sm:mx-0 sm:h-10 sm:w-10">
         
            <svg width="512px" height="512px" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><path fill="#000" d="M256 16C123.5 16 16 123.5 16 256c0 132.6 107.5 240 240 240 132.6 0 240-107.4 240-240S388.6 16 256 16zm0 60c99.4 0 180 80.6 180 180s-80.6 180-180 180S76 355.4 76 256 156.6 76 256 76zm91.3 64.2c-6.5 0-12.5 2.4-16.8 8.2-52 70.1-69 96.5-106 169.8-8.4-11.1-65.6-72.4-93.9-94.1-14.2-10.9-41.3 27.2-31.6 37.1C142.6 306.1 220.1 406 232.7 405c21.4-1.7 75.1-136.8 148.8-233.7 8-10.4-15-31.3-34.2-31.1z"/></svg>
            </div>
            <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
              <h3 class="text-lg leading-6 font-medium text-gray-900" id="modal-title">Exercise finished</h3>
              <div class="mt-2">
                <p class="text-sm text-gray-500">Your score is </p> 
                <h4 class="text-lg leading-6 font-medium text-gray-900">{100 - 5 * Object.keys(failedPositionsState).length}</h4>
              </div>
              <div class="mt-2">
                <p class="text-sm text-gray-500">Failed positions </p> 
                <h4 class="text-lg leading-6 font-medium text-gray-900">{failedPositionsState.map((item) => (<> <span>{item}</span>  <hr /></>))}</h4>
              </div>
            </div>
          </div>
        </div>
        <div class="bg-gray-50 px-2 py-2 mx-10">
          <button type="button" onClick={(e) => {e.preventDefault(); window.location.href='www.physioloop.io';}}  class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm">Improve</button>
          <button type="button" onClick={(e) => {e.preventDefault(); window.location.href='www.physioloop.io';}} class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">Rest</button>
        </div>
      </div>
    </div>
  </div>
</div>
</div>

{/* 
      <FPSStats /> */}

      </header>
    </div>
  );
}

export default App;
