
import React, { useRef, useState, useEffect, useLayoutEffect} from "react";

import * as poseDetection from '@tensorflow-models/pose-detection';
import '@tensorflow/tfjs-backend-webgl';

import { drawKeypoints, drawSkeleton, drawSpecific, drawSegment, drawText, drawCircle, drawPoint } from "./utilities";
import Webcam from "react-webcam";
import MediaQuery from 'react-responsive'
import FPSStats from "react-fps-stats"


import { Button } from "../common/Button";

import { Row, Col } from 'antd';

import { Content } from "./styles";

import { lazy } from "react";
const Container = lazy(() => import("../common/Container"));



function ShoulderExercise() {

  
  const [globalState, setGlobalState] = useState("pre-start");
  const globalStates = ["pre-start", "crossroad", "tutorial", "crossroad2", "device-tutorial", "exercise", "finish"];

  const [appState, setAppState] = useState("stop");

   const exerciseStates = ["setup", "run", "finish"]
   const armStates = ["inside", "outside"]

  const [webcamEnabled, setWebcamEnabled] = useState(false); 

  const webcamRef = useRef(null);
  const canvasRef = useRef(null);

  var list = []

    var vWidth = window.innerWidth;
    var vHeight = window.innerHeight;

  const WIDTH = 640
  const HEIGHT = 480

  const [size, setSize] = useState([0, 0]);

  const [screenWidth, setScreenWidth] = useState(0);
  const [screenHeight, setScreenHeight] = useState(0);


  const REPETITIONS = 10

  var setupReady = false;
  const [working, setWorking] = useState(false)


  if (appState == "run") {

    const detectorConfig = {modelType: poseDetection.movenet.modelType.SINGLEPOSE_THUNDER};

    var detector = null;

    var currentExerciseState = "setup";
    var currentArmState = "inside";


    var count = 0
    var st = 0

    const FPS = 60

    const PX_THRESHOLD = 10
    const SCALE = 1



    const colour1 = "#FE7624"
    const colour2 = "#2E186A"

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

    //const isArmAside = async (leftShoulder, leftElbow, ctx, canvas, videoWidth) {
    
    function isArmAside (leftShoulder, leftElbow, ctx, canvas, videoWidth) {
    
      if (Math.abs(leftShoulder.x - leftElbow.x) > PX_THRESHOLD * 5) {

        drawSegment([leftShoulder.y, leftShoulder.x], [leftElbow.y, leftElbow.x], colour2, SCALE, ctx )

        mirror(ctx, videoWidth)
        
        drawText(50, 100, "Make sure your arm is aside", 24, colour2, SCALE, ctx)

        mirror(ctx, videoWidth)

        return false

      }

      return true

    }


    function isWristAlgned (leftElbow, leftWrist, ctx, canvas, videoWidth) {
      
      if (Math.abs(leftElbow.y - leftWrist.y) > PX_THRESHOLD * 5) {

        drawSegment([leftElbow.y, leftElbow.x - 100], [leftElbow.y, leftElbow.x + 100], colour2, SCALE, ctx )

        mirror(ctx, videoWidth)

        drawText(50, 150, "Maintain horizontal line of a wrist", 24, colour2, SCALE, ctx)

        mirror(ctx, videoWidth)

        return false

      }

      return true
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

      detector = await poseDetection.createDetector(poseDetection.SupportedModels.MoveNet, detectorConfig);
      setupReady = true;
    
    }
    
    function runDetection() {

      if (!setupReady) {
        return
      }

      if (currentExerciseState == exerciseStates[2]) {
        return
      }

      interval = setInterval(() => {
        //console.log("interval")

        detect();
        
      }, 1000/FPS);

        
    }

    const detect = async () => {


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
    



      drawCanvas(poses, video, videoWidth, videoHeight, canvasRef);

      }
    }

    function mirror(ctx, videoWidth) {
        ctx.translate(videoWidth, 0);
        ctx.scale(-1, 1);

    }


    var wristError = false
    var upperArmError = false

    

    function drawCanvas (pose, video, videoWidth, videoHeight, canvas) {
      const ctx = canvas.current.getContext("2d");
      //const ctxEx = canvas.current.getContext("2d");
      canvas.current.width = videoWidth;
      canvas.current.height = videoHeight;


      
      //const [mirroredState, setMirroredState] = useState(true);
      
      
      
      wristError = false
      upperArmError = false


      


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

        drawText(50, 50, "Put left palm on your body where a circle is to begin", 18, colour1, SCALE, ctx)


          
          break;       
        case "run":


        // mirrored first (roughyl, some methods do that inside)
        mirror(ctx, videoWidth)

        // Check if arm is located aside body, warn if not
        upperArmError = isArmAside(pose[0]["keypoints"][5], pose[0]["keypoints"][7], ctx, canvas, videoWidth)
        
        wristError = isWristAlgned(pose[0]["keypoints"][7], pose[0]["keypoints"][9], ctx, canvas, videoWidth)




        // normal second
        mirror(ctx, videoWidth)

        if (currentArmState === armStates[0]) {
          drawText(50, 50, "Move arm outside", 24, colour1, SCALE, ctx)

        } else {
          drawText(50, 50, "Move arm inside", 24, colour1, SCALE, ctx)
        }
        
        // storeExerciseErrors(count, wristError, upperArmError)
        
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

  
     
          
     const run = async () => { 
        if (working) {
          return
        }
        setWorking(true)
        await setupDetector();
        runDetection();
        
      }

      // main

      run();
      
      

  }

  function setExerciseState(state) {
    currentExerciseState = state
  }


  // States of exercise pipeline

  function PreStartState(props) {
    return (<div><h6>Left shoulder external rotation</h6>
      <Content>{"Open beta"}</Content>
     <Button onClick={() => {setGlobalState("crossroad")}}> Try now</Button>
     </div>);

  }

  
  function CrossroadState(props) {
    return (<div><h6>Watch tutorial or start straight away?</h6>
    
    <Row>
    <Col xs={24} lg={8}>
    <Button  color="#fff"  onClick={() => {setGlobalState("tutorial");}}>  Exercise Tutorial </Button>
    </Col>
    <Col xs={24} lg={8}>
    <Button  color="#fff"  onClick={() => {setGlobalState("device-tutorial")}}> Where to put device?</Button>
    </Col>
    <Col xs={24} lg={8}>
    <Button  onClick={() => {setGlobalState("exercise"); setAppState("run"); setWebcamEnabled(true)}}> Start!</Button>
    </Col>
  </Row>

    
    
     
     
     
     </div>);
  }


  // for auto play https://stackoverflow.com/questions/37463832/how-to-play-pause-video-in-react-without-external-library

  // const vidRef = useRef(null);
  // const handlePlayVideo = () => {
  //   console.log(vidRef)
  //   vidRef.current.play();
  // }

  function TutorialState(props) {
    return (<div><h6>Tutorial</h6>
  
    <div>
    <video style={{width: "75%"}} src="/tutorials/leftshoulder.mp4" controls="controls" type="video/mp4"></video>
    </div>

    <Button  color="#fff"  onClick={() => {setGlobalState("crossroad2")}}> Continue</Button>


     
     </div>);
  }

  function Crossroad2State(props) {
    return (<div><h6>Begin the exercise?</h6>

    <Row>
      <Col xs={24} lg={12}>
      <Button  color="#fff"  onClick={() => {setGlobalState("device-tutorial")}}> Where to put device?</Button>
      </Col>
      <Col xs={24} lg={12}>
      <Button  onClick={() => {setGlobalState("exercise"); setAppState("run");  setWebcamEnabled(true)}}> Yes!</Button>
      </Col>
    </Row>
     
    
     </div>);
  }

  function DeviceTutorialState(props) {
    return (<div><h6>DeviceTutorial</h6>
    <div>
    <video style={{width: "75%"}} src="/tutorials/device.mp4" controls="controls" type="video/mp4"></video>
    </div>
     <Button  onClick={() => {setGlobalState("exercise"); setAppState("run"); setWebcamEnabled(true)}}> Begin exercise</Button>
     </div>);
  }

  function ExerciseState(props) {
    return (
      <div>

      {webcamEnabled ? (
        <>

        
        <MediaQuery minWidth={768}>
        <div style={{width : WIDTH, height : HEIGHT}}>

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

        
        <Button color="#fff"  onClick={() => {setGlobalState("finish"); setAppState("stop"); currentExerciseState = exerciseStates[2]; clearInterval(interval); }}>
        Finish early
        </Button>
        <Content>{"You will be asked to allow camera access. Caputured data does not leave your browser."}</Content>
     
        </div>
        </MediaQuery>
       
        
        

        
        <MediaQuery maxWidth={767}>
        <div style={{width : WIDTH/2, height : HEIGHT/2}}>
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

      <div id='button-exercise-mobile'>
      
        <Button color="#fff"  onClick={() => {setGlobalState("finish"); setAppState("stop")}}>
        Finish early
        </Button>
        <Content>{"You will be asked to allow camera access. Caputured data does not leave your browser."}</Content>
        </div> 

        </div>
      </MediaQuery>

      
      </>
        
      ) : ""}  

      </div>

      

    );

  }


  function FinishState(props) {

    // if (globalState == "finish") {
    //   setExerciseErrors(exerciseInformation.getDetails())
    // }
    // globalState === "exercise" ? setWrists(calculateWrists) : console.log("no")
    
    return (<div><h6><strong>Physioloop</strong></h6>
    {/*exerciseErrors*/}
    {/* { globalState === "exercise" ? setWrists(calculateWrists) : console.log("no")} */}
     {/* <button  onClick={() => {setGlobalState("pre-start"); count = 0; setExerciseState(exerciseStates[0]) }}> Once again</button> */}
     <Row>
      <Col xs={24} lg={12}>
      <Button onClick={() => scrollTo("contact")}> Leave feedback</Button>
      </Col>
      <Col xs={24} lg={12}>
      <Button color="#fff" onClick={() => {window.location.reload(false);}}> Once again</Button>
      </Col>
    </Row>
     
     
     
     </div>);
  }

  // UI function

  const scrollTo = (id) => {
    const element = document.getElementById(id);
    element.scrollIntoView({
      behavior: "smooth",
    });
  }

//===
 


    return (
      <>

       

         {/* <div className="App">
       <header className="App-header"> */}

      {/* THrows error!!!!!
      <Helmet>
          <meta name="viewport" content="width=device-width, initial-scale=1.0"></meta>
          <title>Prototype exercise 1.0.2</title>
         
      </Helmet> */}


       {/* <Container> */}
      
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
      {/* </Container> */}



      {/* <FPSStats /> */}

      {/* </header>
     </div> */}

      </>

     
    )
}


export default ShoulderExercise;