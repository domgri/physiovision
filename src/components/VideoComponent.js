import React from "react";

export function playVideo(exerciseVideoRef) {
  exerciseVideoRef.current.play();
}

let exerciseVideo = document.getElementById("video");

const VideoComponent = ({ exerciseVideoRef, videoSrc }) => {
  return (
    <video
      ref={exerciseVideoRef}
      id="video"
      width="640"
      height="480"
      autoPlay="autoplay"
      playsInline
      style={{
        position: "relative",
        marginLeft: "auto",
        marginRight: "auto",
        paddingTop: 20,
        left: 0,
        right: 0,
        // "z-index": 1,
      }}
    >
      <source src={videoSrc} type="video/mp4" />
    </video>
  );
};

export default VideoComponent;
