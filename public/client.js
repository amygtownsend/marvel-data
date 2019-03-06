/* global ScrollMagic */
// client-side js

let init = function () {
  console.log("init called");

  // SCROLLMAGIC

  // Natural screen wipes using example code: http://scrollmagic.io/examples/basic/section_wipes_natural.html

  // init controller
  let controller = new ScrollMagic.Controller({
    globalSceneOptions: {
      triggerHook: 'onLeave'
    }
  });

  // get all slides
  let slides = document.querySelectorAll("section.panel");

  // create a scene for every slide
  slides.forEach((slide) => {
    new ScrollMagic.Scene({
      triggerElement: slide,
      duration: "150%"
    })
      .setPin(slide)
      .addTo(controller);
  });

  // CHART.JS

  // Add Chart.js code...
}

document.addEventListener("DOMContentLoaded", init);