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
};

export const detect = async (webcamRef, canvasRef, exerciseVideoRef) => {
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

    const webcamPoses = await detector.estimatePoses(webcamVideo);

    exerciseVideoRef.current.width = videoWidth;
    exerciseVideoRef.current.height = videoHeight;
    const exerciseVideo = exerciseVideoRef.current;
    const exercisePoses = await detector.estimatePoses(exerciseVideo);

    checkPosition(
      webcamPoses,
      webcamVideo,
      videoWidth,
      videoHeight,
      exerciseVideoRef,
      exercisePoses,
      canvasRef
    );
  }
};

export async function detectPose(videoRef) {
  console.log("aa");
  console.log(videoRef);
  const video = videoRef.current.video;
  const videoWidth = videoRef.current.videoWidth;
  const videoHeight = videoRef.current.videoHeight;
  videoRef.current.width = videoWidth;
  videoRef.current.height = videoHeight;
  console.log("bb");
  console.log(videoRef);

  return await detector.estimatePoses(video);
}
