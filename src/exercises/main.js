import { drawPoint } from "./utilitiesCanvas";

import exercise2 from "./../videos/s1_2.mp4";
import exercise3 from "./../videos/s1_3.mp4";
import { pauseVideo } from "../components/VideoComponent";
import { shapeSimilarity } from "curve-matcher";
import { detectPose } from "./detector";

let exerciseState = "test";

let exerciseVideoPoses = null;
let exerciseVideoCurve = null;

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
  exercisePoses,
  canvasRef
) {
  const ctx = canvasRef.current.getContext("2d");
  canvasRef.current.width = videoWidth;
  canvasRef.current.height = videoHeight;

  mirror(ctx, videoWidth);

  //checkTime();
  switch (exerciseState) {
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

      // if (exerciseVideoPoses === null) {
      //   console.log("typeOfexvidref " + typeof exerciseVideoRef);
      //   exerciseVideoPoses = await detectPose(exerciseVideoRef);
      // }

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

      exerciseVideoCurve = [
        {
          x: exercisePoses[0]["keypoints"][4].x,
          y: exercisePoses[0]["keypoints"][4].y,
        },
        {
          x: exercisePoses[0]["keypoints"][2].x,
          y: exercisePoses[0]["keypoints"][2].y,
        },
        {
          x: exercisePoses[0]["keypoints"][0].x,
          y: exercisePoses[0]["keypoints"][0].y,
        },
        {
          x: exercisePoses[0]["keypoints"][1].x,
          y: exercisePoses[0]["keypoints"][1].y,
        },
        {
          x: exercisePoses[0]["keypoints"][3].x,
          y: exercisePoses[0]["keypoints"][3].y,
        },
      ];

      const similarity = shapeSimilarity(webcamCurve, exerciseVideoCurve);
      console.log(similarity);

    // if (
    //   exerciseVideoPoses !== null &&
    //   exerciseVideoPoses &&
    //   Object.keys(exerciseVideoPoses).length === 0 &&
    //   Object.getPrototypeOf(exerciseVideoPoses) === Object.prototype
    // ) {
    //   console.log(typeof exerciseVideoPoses);
    //   exerciseVideoCurve = [
    //     {
    //       x: exercisePoses[0]["keypoints"][4].x,
    //       y: exercisePoses[0]["keypoints"][4].y,
    //     },
    //     {
    //       x: exercisePoses[0]["keypoints"][2].x,
    //       y: exercisePoses[0]["keypoints"][2].y,
    //     },
    //     {
    //       x: exercisePoses[0]["keypoints"][0].x,
    //       y: exercisePoses[0]["keypoints"][0].y,
    //     },
    //     {
    //       x: exercisePoses[0]["keypoints"][1].x,
    //       y: exercisePoses[0]["keypoints"][1].y,
    //     },
    //     {
    //       x: exercisePoses[0]["keypoints"][3].x,
    //       y: exercisePoses[0]["keypoints"][3].y,
    //     },
    //   ];

    //   const similarity = shapeSimilarity(webcamCurve, exerciseVideoCurve);
    //   console.log(similarity);
    // } else {
    //   console.log("else");
    // }

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

export function playExerciseVideo(exerciseVideo) {
  exerciseVideo.play();
}
