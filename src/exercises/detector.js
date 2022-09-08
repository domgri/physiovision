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
  console.log("is detector null? =" + detector);
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

    checkPosition(
      poses,
      webcamVideo,
      videoWidth,
      videoHeight,
      exerciseVideoRef,
      canvasRef
    );
  }
};
