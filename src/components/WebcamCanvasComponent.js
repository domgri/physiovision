import React from "react";
import Webcam from "react-webcam";

import { setSizeUsingBrowserWidth } from "./../exercises/utils";

const WebcamCanvasComponent = ({ webcamRef, canvasRef, width }) => {
  return (
    <>
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
            width: setSizeUsingBrowserWidth(width),
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
            width: setSizeUsingBrowserWidth(width),
          }}
        />
      </div>
    </>
  );
};

export default WebcamCanvasComponent;
