import React, { useRef, useState } from "react";

import "./App.css";
import "./css.css";

import {
  hideLoadingScreenAfterTime,
  setSizeUsingBrowserWidth,
} from "./exercises/utils";
import { setupDetector, runDetection } from "./exercises/detector";

import prepVideo from "./videos/prep.mp4";
import exercise1 from "./videos/s1_1.mp4";
import { checkPosition, playExerciseVideo } from "./exercises/main";

import { detect } from "./exercises/detector";
import LoadingScreen from "./components/LoadingScreen";
import VideoComponent from "./components/VideoComponent";
import WebcamCanvasComponent from "./components/WebcamCanvasComponent";

function App() {
  // "begin", "prepare", "run", "end"
  const [appState, setAppState] = useState("begin");

  const [exerciseNumber, setExerciseNumber] = useState(0);

  // Webcam setup
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);

  const exerciseVideoRef = useRef(null);
  //let exerciseVideo = document.getElementById("video");

  // CONSTS

  const WIDTH = 640;
  //const HEIGHT = 480;

  if (appState === "prepare") {
    // Start detection
    setupDetector();

    let interval = null;

    interval = setInterval(() => {
      detect(
        webcamRef,
        canvasRef,
        exerciseVideoRef,
        appState,
        setAppState,
        interval
      );
      // }, 1000 / FPS);
    }, 500);
  } else if (appState === "run") {
  }

  return (
    <div className="App">
      <header className="App-header">
        <LoadingScreen
          appState={appState}
          setAppState={setAppState}
          exerciseVideoRef={exerciseVideoRef}
        />

        <div className="flex-col space-y-4">
          <div className="flex space-x-4 ">
            <div className="basis-1/3 text-xl">physioloop.io</div>
            <div></div>
            {/* <div className="basis-1/3 rounded border-solid border-2 border-blue-600 hover:bg-sky-700 text-2xl ">
            </div> */}
            <div className="basis-1/3 text-xl"></div>
          </div>
          <div className="flex special">
            <div className="basis-1/2">
              <VideoComponent
                exerciseVideoRef={exerciseVideoRef}
                videoSrc={prepVideo}
              />
            </div>
            <div className="relative basis-1/2">
              <WebcamCanvasComponent
                webcamRef={webcamRef}
                canvasRef={canvasRef}
                width={WIDTH}
              />
            </div>
          </div>
        </div>

        {/** end message template */}
        {/*https://tailwindui.com/components/application-ui/overlays/modals*/}

        {/* <div style={{ display: appState === "end" ? "block" : "none" }}>
         

          <div
            className="relative z-10"
            aria-labelledby="modal-title"
            role="dialog"
            aria-modal="true"
          >
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>

            <div className="fixed z-10 inset-0 overflow-y-auto">
              <div className="flex items-end sm:items-center justify-center min-h-full p-4 text-center sm:p-0">
                <div className="relative bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:max-w-lg ">
                  <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                    <div className="sm:flex sm:items-start">
                      <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-green-100 sm:mx-0 sm:h-10 sm:w-10">
                        <svg
                          width="512px"
                          height="512px"
                          viewBox="0 0 512 512"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            fill="#000"
                            d="M256 16C123.5 16 16 123.5 16 256c0 132.6 107.5 240 240 240 132.6 0 240-107.4 240-240S388.6 16 256 16zm0 60c99.4 0 180 80.6 180 180s-80.6 180-180 180S76 355.4 76 256 156.6 76 256 76zm91.3 64.2c-6.5 0-12.5 2.4-16.8 8.2-52 70.1-69 96.5-106 169.8-8.4-11.1-65.6-72.4-93.9-94.1-14.2-10.9-41.3 27.2-31.6 37.1C142.6 306.1 220.1 406 232.7 405c21.4-1.7 75.1-136.8 148.8-233.7 8-10.4-15-31.3-34.2-31.1z"
                          />
                        </svg>
                      </div>
                      <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                        <h3
                          className="text-lg leading-6 font-medium text-gray-900"
                          id="modal-title"
                        >
                          Exercise finished
                        </h3>
                        <div className="mt-2">
                          <p className="text-sm text-gray-500">Your score is </p>
                          <h4 className="text-lg leading-6 font-medium text-gray-900">
                            {100 - 5 * Object.keys(failedPositionsState).length}
                          </h4>
                        </div>
                        <div className="mt-2">
                          <p className="text-sm text-gray-500">Failed positions </p>
                          <h4 className="text-lg leading-6 font-medium text-gray-900">
                            {failedPositionsState.map((item) => (
                              <>
                                {" "}
                                <span>{item}</span> <hr />
                              </>
                            ))}
                          </h4>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 px-2 py-2 mx-10">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        window.location.href = "www.physioloop.io";
                      }}
                      className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                    >
                      Improve
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        window.location.href = "www.physioloop.io";
                      }}
                      className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                    >
                      Rest
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div> */}
      </header>
    </div>
  );
}

export default App;
