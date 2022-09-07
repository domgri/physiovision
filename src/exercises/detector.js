import * as poseDetection from "@tensorflow-models/pose-detection";
import "@tensorflow/tfjs-backend-webgl";

import { checkPosition } from "./main";

let detector = null;
const detectorConfig = {
  modelType: poseDetection.movenet.modelType.SINGLEPOSE_THUNDER,
};

export const setupDetector = async () => {
  detector = await poseDetection.createDetector(
    poseDetection.SupportedModels.MoveNet,
    detectorConfig
  );
  console.log("detector" + detector);
};

// export function runDetection(webcamRef, canvasRef, exerciseVideo) {
//   console.log("runDetection");
//   let interval = null;
//   interval = setInterval(() => {
//     console.log("interval");

//     detect(webcamRef, canvasRef, exerciseVideo);

//     // }, 1000 / FPS);
//   }, 500);
// }

export const detect = async (webcamRef) => {
  if (detector === null) {
    return;
  }

  if (
    typeof webcamRef.current !== "undefined" &&
    webcamRef.current !== null &&
    webcamRef.current.video.readyState === 4
  ) {
    // Get Video Properties
    const webcamVideo = webcamRef.current.video;
    const videoWidth = webcamRef.current.video.videoWidth;
    const videoHeight = webcamRef.current.video.videoHeight;

    // Set video width
    webcamRef.current.video.width = videoWidth;
    webcamRef.current.video.height = videoHeight;

    const poses = await detector.estimatePoses(webcamVideo);

    // problem with returning data, possibly because of await....
    // otherwise, can play video only muted... Think for solution...

    let returnObject = {
      poses: poses,
      webcamVideo: webcamVideo,
      videoWidth: videoWidth,
      videoHeight: videoHeight,
    };
    console.log("return " + returnObject);

    return returnObject;

    // checkPosition(
    //   poses,
    //   webcamVideo,
    //   videoWidth,
    //   videoHeight,
    //   exerciseVideoRef,
    //   canvasRef
    // );
  }
};

// function checkPosition(
//   pose,
//   video,
//   videoWidth,
//   videoHeight,
//   canvas,
//   exerciseState
// ) {
//   const ctx = canvas.current.getContext("2d");
//   //const ctxEx = canvas.current.getContext("2d");
//   canvas.current.width = videoWidth;
//   canvas.current.height = videoHeight;

//   //const [mirroredState, setMirroredState] = useState(true);

//   //checkTime();
//   switch (exerciseState) {
//     case "test":
//       drawPoint(
//         ctx,
//         pose[0]["keypoints"][4].y * 1,
//         pose[0]["keypoints"][4].x * 1,
//         3,
//         "orange"
//       );

//     case "HANDS_UP":
//       // mirrored first
//       // mirror(ctx, videoWidth);

//       // // Exercise specific keypoints
//       // // right elbow
//       // drawPoint(ctx, pose[0]["keypoints"][8].y * 1, pose[0]["keypoints"][8].x * 1, 3, "red");
//       // //left elbow
//       // drawPoint(ctx, pose[0]["keypoints"][7].y * 1, pose[0]["keypoints"][7].x * 1, 3, "aqua");
//       // //right ear
//       // drawPoint(ctx, pose[0]["keypoints"][4].y * 1, pose[0]["keypoints"][4].x * 1, 3, "orange");
//       // //left ear
//       // drawPoint(ctx, pose[0]["keypoints"][3].y * 1, pose[0]["keypoints"][3].x * 1, 3, "blue");

//       // areHandsUp(
//       //   pose[0]["keypoints"][7].y,
//       //   pose[0]["keypoints"][3].y,
//       //   pose[0]["keypoints"][8].y,
//       //   pose[0]["keypoints"][4].y
//       // );

//       break;

//     case "LEAN_LEFT":
//       // mirrored first
//       // mirror(ctx, videoWidth);

//       // // Exercise specific keypoints
//       // // left wrist
//       // drawPoint(ctx, pose[0]["keypoints"][9].y * 1, pose[0]["keypoints"][9].x * 1, 3, "red");

//       // //right elbow
//       // drawPoint(ctx, pose[0]["keypoints"][8].y * 1, pose[0]["keypoints"][8].x * 1, 3, "aqua");
//       // //right shoulder
//       // drawPoint(ctx, pose[0]["keypoints"][6].y * 1, pose[0]["keypoints"][6].x * 1, 3, "blue");

//       // isLeanCorrect(
//       //   pose[0]["keypoints"][6].x,
//       //   pose[0]["keypoints"][6].y,
//       //   pose[0]["keypoints"][8].y,
//       //   pose[0]["keypoints"][9].x
//       // );

//       // if (
//       //   !isHandStraight(
//       //     pose[0]["keypoints"][5],
//       //     pose[0]["keypoints"][7],
//       //     pose[0]["keypoints"][9]
//       //   )
//       // ) {
//       //   failedPositions.add(points.indexOf(points[index]) + ", leaning left");
//       //   drawLowerArmWrong(
//       //     ctx,
//       //     pose[0]["keypoints"][5],
//       //     pose[0]["keypoints"][7],
//       //     pose[0]["keypoints"][9]
//       //   );
//       // }

//       break;

//     case "LEAN_RIGHT":
//       // mirrored first
//       // mirror(ctx, videoWidth);

//       // // Exercise specific keypoints
//       // // right wrist
//       // drawPoint(ctx, pose[0]["keypoints"][10].y * 1, pose[0]["keypoints"][10].x * 1, 3, "red");

//       // //left elbow
//       // drawPoint(ctx, pose[0]["keypoints"][7].y * 1, pose[0]["keypoints"][7].x * 1, 3, "aqua");
//       // //left shoulder
//       // drawPoint(ctx, pose[0]["keypoints"][5].y * 1, pose[0]["keypoints"][5].x * 1, 3, "blue");

//       // isLeanCorrect(
//       //   pose[0]["keypoints"][5].x,
//       //   pose[0]["keypoints"][5].y,
//       //   pose[0]["keypoints"][7].y,
//       //   pose[0]["keypoints"][10].x
//       // );

//       // if (
//       //   !isHandStraight(
//       //     pose[0]["keypoints"][6],
//       //     pose[0]["keypoints"][8],
//       //     pose[0]["keypoints"][10]
//       //   )
//       // ) {
//       //   failedPositions.add(
//       //     points.indexOf(points[index]) + ", leaning right"
//       //   );
//       //   drawLowerArmWrong(
//       //     ctx,
//       //     pose[0]["keypoints"][6],
//       //     pose[0]["keypoints"][8],
//       //     pose[0]["keypoints"][10]
//       //   );
//       // }

//       break;

//     default:
//       console.log("exercise state error occured. Restart page.");
//   }
// }
