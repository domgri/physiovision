export function hideLoadingScreenAfterTime(time) {
  setTimeout(function () {
    document.getElementById("loadingScreen").style.display = "none";
  }, time);
}

export function setSizeUsingBrowserWidth(width) {
  var browserWidth = window.innerWidth;

  if (browserWidth >= 1280) {
    return width;
  } else if (browserWidth >= 1024) {
    return Math.round(width / 1.5);
  }

  return Math.round(width / 2);
}
