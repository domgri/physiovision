import { drawPoint } from "./utilitiesCanvas";

import notificationSoundSource from "./../audio/notification.wav";
// import exercise2 from "./../videos/s1_2.mp4";
// import exercise3 from "./../videos/s1_3.mp4";
import { pauseVideo } from "../components/VideoComponent";
import { shapeSimilarity } from "curve-matcher";
import { detectPose } from "./detector";

// "fitToCamera", "up", "right", "left", "down"
let exerciseSubstate = "fitToCamera";

let pausePoints = [0, 8, 24, 34, 40, 47, 52, 53],
  currentPausePointIndex = 1,
  currentPauseTime = pausePoints[currentPausePointIndex];

let positionCounter = 0;

let exerciseVideoPoses = null;
let exerciseVideoCurve = null;

let capturedPoses = { up: null, right: null, down: null, left: null };

function mirror(ctx, videoWidth) {
  ctx.translate(videoWidth, 0);
  ctx.scale(-1, 1);
}

export async function checkPosition(
  webcamPoses,
  webcamVideo,
  videoWidth,
  videoHeight,
  exerciseVideoRef,
  //exercisePoses,
  canvasRef,
  appState,
  setAppState,
  interval
) {
  const ctx = canvasRef.current.getContext("2d");
  canvasRef.current.width = videoWidth;
  canvasRef.current.height = videoHeight;

  mirror(ctx, videoWidth);
  checkTime(exerciseVideoRef, interval, setAppState);

  //TODO: make loading screen activ euntil detector properly loads...

  switch (appState) {
    case "prepare":
      console.log(exerciseSubstate);
      switch (exerciseSubstate) {
        case "fitToCamera":
          // If fits, move on, else wait until fits
          // Check by checking all five head points' confidence. Should be above 50.

          if (exerciseVideoRef.current.paused) {
            if (
              webcamPoses[0]["keypoints"][0].score * 100 > 50 &&
              webcamPoses[0]["keypoints"][1].score * 100 > 50 &&
              webcamPoses[0]["keypoints"][2].score * 100 > 50 &&
              webcamPoses[0]["keypoints"][3].score * 100 > 50 &&
              webcamPoses[0]["keypoints"][4].score * 100 > 50
            ) {
              Promise.all([
                playNotification(),
                exerciseVideoRef.current.play(),
              ]);

              setTimeout(() => {
                exerciseSubstate = "up";
              }, 1000);
            }
          }

          // if (
          //   webcamPoses[0]["keypoints"][0].score * 100 > 50 &&
          //   webcamPoses[0]["keypoints"][1].score * 100 > 50 &&
          //   webcamPoses[0]["keypoints"][2].score * 100 > 50 &&
          //   webcamPoses[0]["keypoints"][3].score * 100 > 50 &&
          //   webcamPoses[0]["keypoints"][4].score * 100 > 50
          // ) {
          //   console.log("in screen");
          //   console.log(exerciseVideoRef.current);
          // } else {
          //   console.log("not in screen");
          //   console.log(exerciseVideoRef.current.paused);
          // }
          // console.log(webcamPoses[0]["keypoints"][0].score);
          // console.log(webcamPoses[0]["keypoints"][1].score);
          // console.log(webcamPoses[0]["keypoints"][2].score);
          // console.log(webcamPoses[0]["keypoints"][3].score);
          // console.log(webcamPoses[0]["keypoints"][4].score);
          //console.log("fitToCamera");

          //playNotification()

          //exerciseSubstate = "up";
          break;
        case "up":
          // Tell to move head upward as much as possible and stay still until hear notification sound. It is normal to not see the screen while doing an exercise.
          // Capture and store pose before notification sound. move substate to next.
          console.log("up");

          if (exerciseVideoRef.current.paused) {
            console.log("inside1");
            Promise.all([
              (capturedPoses.up = [
                webcamPoses[0]["keypoints"][0],
                webcamPoses[0]["keypoints"][1],
                webcamPoses[0]["keypoints"][2],
                webcamPoses[0]["keypoints"][3],
                webcamPoses[0]["keypoints"][4],
              ]),
              console.log("inside2"),
              playNotification(),
              exerciseVideoRef.current.play(),
            ]);
            console.log("inside3");
            await setTimeout(() => {
              exerciseSubstate = "right";
            }, 1000);

            // setTimeout(() => {

            // }, 1000);

            // if (
            //   webcamPoses[0]["keypoints"][0].score * 100 > 50 &&
            //   webcamPoses[0]["keypoints"][1].score * 100 > 50 &&
            //   webcamPoses[0]["keypoints"][2].score * 100 > 50 &&
            //   webcamPoses[0]["keypoints"][3].score * 100 > 50 &&
            //   webcamPoses[0]["keypoints"][4].score * 100 > 50
            // ) {
            //   exerciseSubstate = "up";
            //   playNotification();
            //   setTimeout(() => {
            //     exerciseVideoRef.current.play();
            //   }, 1000);
            // }
          }

          //exerciseSubstate = "right";
          break;
        case "right":
          // repeat insttructions
          // capture the same
          console.log("right");
          //exerciseSubstate = "down";

          if (exerciseVideoRef.current.paused) {
            Promise.all([
              (capturedPoses.right = [
                webcamPoses[0]["keypoints"][0],
                webcamPoses[0]["keypoints"][1],
                webcamPoses[0]["keypoints"][2],
                webcamPoses[0]["keypoints"][3],
                webcamPoses[0]["keypoints"][4],
              ]),
              playNotification(),
              exerciseVideoRef.current.play(),
            ]);
            await setTimeout(() => {
              exerciseSubstate = "down";
            }, 1000);
          }

          break;
        case "down":
          // repeat insttructions
          // capture the same
          console.log("down");

          if (exerciseVideoRef.current.paused) {
            console.log("inside1");
            Promise.all([
              (capturedPoses.down = [
                webcamPoses[0]["keypoints"][0],
                webcamPoses[0]["keypoints"][1],
                webcamPoses[0]["keypoints"][2],
                webcamPoses[0]["keypoints"][3],
                webcamPoses[0]["keypoints"][4],
              ]),
              console.log("inside2"),
              playNotification(),
              exerciseVideoRef.current.play(),
            ]);
            console.log("inside3");
            await setTimeout(() => {
              exerciseSubstate = "left";
            }, 1000);
          }

          break;
        case "left":
          // repeat insttructions
          // capture the same
          console.log("left");

          if (exerciseVideoRef.current.paused) {
            Promise.all([
              (capturedPoses.left = [
                webcamPoses[0]["keypoints"][0],
                webcamPoses[0]["keypoints"][1],
                webcamPoses[0]["keypoints"][2],
                webcamPoses[0]["keypoints"][3],
                webcamPoses[0]["keypoints"][4],
              ]),
              playNotification(),
              exerciseVideoRef.current.play(),
            ]);
            await setTimeout(() => {
              exerciseSubstate = "exit_test";
            }, 1000);
          }

          break;
        case "exit_test":
          console.log(capturedPoses);
          break;
        default:
          console.log("something is wrong with subState");
      }
      break;
    case "test":
      // works
      //pauseVideo(exerciseVideoRef);

      //exerciseVideoRef.current.play();
      //playExerciseVideo(exerciseVideoRef);
      //   exerciseVideo.pause();
      //   setTimeout(() => {
      //     exerciseVideo.play();
      //   }, 1000);

      drawPoint(
        ctx,
        webcamPoses[0]["keypoints"][0].y * 1,
        webcamPoses[0]["keypoints"][0].x * 1,
        3,
        "orange"
      );

      drawPoint(
        ctx,
        webcamPoses[0]["keypoints"][1].y * 1,
        webcamPoses[0]["keypoints"][1].x * 1,
        3,
        "orange"
      );
      drawPoint(
        ctx,
        webcamPoses[0]["keypoints"][2].y * 1,
        webcamPoses[0]["keypoints"][2].x * 1,
        3,
        "orange"
      );
      drawPoint(
        ctx,
        webcamPoses[0]["keypoints"][3].y * 1,
        webcamPoses[0]["keypoints"][3].x * 1,
        3,
        "orange"
      );
      drawPoint(
        ctx,
        webcamPoses[0]["keypoints"][4].y * 1,
        webcamPoses[0]["keypoints"][4].x * 1,
        3,
        "orange"
      );

      // From left ear to right ear
      const webcamCurve = [
        {
          x: webcamPoses[0]["keypoints"][4].x,
          y: webcamPoses[0]["keypoints"][4].y,
        },
        {
          x: webcamPoses[0]["keypoints"][2].x,
          y: webcamPoses[0]["keypoints"][2].y,
        },
        {
          x: webcamPoses[0]["keypoints"][0].x,
          y: webcamPoses[0]["keypoints"][0].y,
        },
        {
          x: webcamPoses[0]["keypoints"][1].x,
          y: webcamPoses[0]["keypoints"][1].y,
        },
        {
          x: webcamPoses[0]["keypoints"][3].x,
          y: webcamPoses[0]["keypoints"][3].y,
        },
      ];

    // exerciseVideoCurve = [
    //   {
    //     x: exercisePoses[0]["keypoints"][4].x,
    //     y: exercisePoses[0]["keypoints"][4].y,
    //   },
    //   {
    //     x: exercisePoses[0]["keypoints"][2].x,
    //     y: exercisePoses[0]["keypoints"][2].y,
    //   },
    //   {
    //     x: exercisePoses[0]["keypoints"][0].x,
    //     y: exercisePoses[0]["keypoints"][0].y,
    //   },
    //   {
    //     x: exercisePoses[0]["keypoints"][1].x,
    //     y: exercisePoses[0]["keypoints"][1].y,
    //   },
    //   {
    //     x: exercisePoses[0]["keypoints"][3].x,
    //     y: exercisePoses[0]["keypoints"][3].y,
    //   },
    // ];

    // const similarity = shapeSimilarity(webcamCurve, exerciseVideoCurve);
    // console.log(similarity);

    //drawSegment([poses[0]["keypoints"][1].y, poses[0]["keypoints"][1].x], [ poses[0]["keypoints"][3].y,  poses[0]["keypoints"][3].x], colour2, SCALE, ctx)

    case "HANDS_UP":
      // mirrored first
      // mirror(ctx, videoWidth);

      // // Exercise specific keypoints
      // // right elbow
      // drawPoint(ctx, pose[0]["keypoints"][8].y * 1, pose[0]["keypoints"][8].x * 1, 3, "red");
      // //left elbow
      // drawPoint(ctx, pose[0]["keypoints"][7].y * 1, pose[0]["keypoints"][7].x * 1, 3, "aqua");
      // //right ear
      // drawPoint(ctx, pose[0]["keypoints"][4].y * 1, pose[0]["keypoints"][4].x * 1, 3, "orange");
      // //left ear
      // drawPoint(ctx, pose[0]["keypoints"][3].y * 1, pose[0]["keypoints"][3].x * 1, 3, "blue");

      // areHandsUp(
      //   pose[0]["keypoints"][7].y,
      //   pose[0]["keypoints"][3].y,
      //   pose[0]["keypoints"][8].y,
      //   pose[0]["keypoints"][4].y
      // );

      break;

    case "LEAN_LEFT":
      // mirrored first
      // mirror(ctx, videoWidth);

      // // Exercise specific keypoints
      // // left wrist
      // drawPoint(ctx, pose[0]["keypoints"][9].y * 1, pose[0]["keypoints"][9].x * 1, 3, "red");

      // //right elbow
      // drawPoint(ctx, pose[0]["keypoints"][8].y * 1, pose[0]["keypoints"][8].x * 1, 3, "aqua");
      // //right shoulder
      // drawPoint(ctx, pose[0]["keypoints"][6].y * 1, pose[0]["keypoints"][6].x * 1, 3, "blue");

      // isLeanCorrect(
      //   pose[0]["keypoints"][6].x,
      //   pose[0]["keypoints"][6].y,
      //   pose[0]["keypoints"][8].y,
      //   pose[0]["keypoints"][9].x
      // );

      // if (
      //   !isHandStraight(
      //     pose[0]["keypoints"][5],
      //     pose[0]["keypoints"][7],
      //     pose[0]["keypoints"][9]
      //   )
      // ) {
      //   failedPositions.add(points.indexOf(points[index]) + ", leaning left");
      //   drawLowerArmWrong(
      //     ctx,
      //     pose[0]["keypoints"][5],
      //     pose[0]["keypoints"][7],
      //     pose[0]["keypoints"][9]
      //   );
      // }

      break;

    case "LEAN_RIGHT":
      // mirrored first
      // mirror(ctx, videoWidth);

      // // Exercise specific keypoints
      // // right wrist
      // drawPoint(ctx, pose[0]["keypoints"][10].y * 1, pose[0]["keypoints"][10].x * 1, 3, "red");

      // //left elbow
      // drawPoint(ctx, pose[0]["keypoints"][7].y * 1, pose[0]["keypoints"][7].x * 1, 3, "aqua");
      // //left shoulder
      // drawPoint(ctx, pose[0]["keypoints"][5].y * 1, pose[0]["keypoints"][5].x * 1, 3, "blue");

      // isLeanCorrect(
      //   pose[0]["keypoints"][5].x,
      //   pose[0]["keypoints"][5].y,
      //   pose[0]["keypoints"][7].y,
      //   pose[0]["keypoints"][10].x
      // );

      // if (
      //   !isHandStraight(
      //     pose[0]["keypoints"][6],
      //     pose[0]["keypoints"][8],
      //     pose[0]["keypoints"][10]
      //   )
      // ) {
      //   failedPositions.add(
      //     points.indexOf(points[index]) + ", leaning right"
      //   );
      //   drawLowerArmWrong(
      //     ctx,
      //     pose[0]["keypoints"][6],
      //     pose[0]["keypoints"][8],
      //     pose[0]["keypoints"][10]
      //   );
      // }

      break;

    default:
      console.log("exercise state error occured. Restart page.");
  }
}

function checkTime(exerciseVideoRef, interval, setAppState) {
  console.log(
    "1- " + currentPauseTime + "  ,2- " + pausePoints[pausePoints.length - 1]
  );
  if (currentPauseTime === pausePoints[pausePoints.length - 1]) {
    exerciseVideoRef.current.pause();
    clearInterval(interval);
    setAppState("end");
    // failedPositions.forEach((element) =>
    //   setFailedPositionsState((currentState) => [...currentState, element])
    // );
  }
  if (exerciseVideoRef.current.currentTime >= currentPauseTime) {
    // if position is not yet done, pause
    if (positionCounter < currentPausePointIndex) {
      exerciseVideoRef.current.pause();
    }

    if (pausePoints.length > ++currentPausePointIndex) {
      // increase index and get next time
      currentPauseTime = pausePoints[currentPausePointIndex];
    } else {
      // or loop/next...
      // done
    }
  }
}

async function playNotification() {
  let audio = new Audio(notificationSoundSource);

  await audio.play();
}
