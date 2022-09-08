import React from "react";

import { hideLoadingScreenAfterTime } from "./../exercises/utils";
import { playVideo } from "./VideoComponent";

const LoadingScreen = ({ appState, setAppState, exerciseVideoRef }) => {
  return (
    <>
      <div
        id="loadingScreen"
        className="absolute bg-white bg-opacity-60 z-10 h-full w-full flex items-center justify-center"
      >
        <div className="flex items-center">
          <div style={{ display: appState === "begin" ? "block" : "none" }}>
            <button
              className="text-4xl bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded"
              onClick={() => {
                setAppState("prepare");
                //setAppState("run");
                hideLoadingScreenAfterTime(2000);
                playVideo(exerciseVideoRef);
              }}
            >
              Begin
            </button>
          </div>
          <div style={{ display: appState === "prepare" ? "block" : "none" }}>
            <svg
              className="animate-spin h-10 w-10 text-blue-700"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          </div>
        </div>
      </div>
      ;
    </>
  );
};

export default LoadingScreen;
