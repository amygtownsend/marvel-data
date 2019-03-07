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

  setTimeout(function () {
    fetch('/character').then(resp => resp.json()).then((data) => {
      console.log(data);

      let comicsAll = [];
      let eventsAll = [];

      data.forEach((group) => {
        group.forEach((character) => {
          comicsAll.push(character);
          eventsAll.push(character);
        });
      });

      // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort
      function names(a, b) {
        var nameA = a.name.toUpperCase(); // ignore upper and lowercase
        var nameB = b.name.toUpperCase(); // ignore upper and lowercase
        if (nameA < nameB) {
          return -1;
        }
        if (nameA > nameB) {
          return 1;
        }
        return 0;
      }

      function comics(a, b) {
        return b.comics.available - a.comics.available;
      }

      function events(a, b) {
        return b.events.available - a.events.available;
      }

      comicsAll.sort(comics);
      eventsAll.sort(events);

      let comicsShort = comicsAll.slice(0, 30);
      let eventsShort = eventsAll.slice(0, 30);

      // https://stackoverflow.com/questions/1584370/how-to-merge-two-arrays-in-javascript-and-de-duplicate-items
      function arrayUnique(array) {
        var a = array.concat();
        for (var i = 0; i < a.length; ++i) {
          for (var j = i + 1; j < a.length; ++j) {
            if (a[i] === a[j]) {
              a.splice(j--, 1);
            }
          }
        }

        return a;
      }

      // Merges both arrays and gets unique items
      let joined = arrayUnique(comicsShort.concat(eventsShort));
      let scatterCharacters = joined.sort(names);
      console.log(scatterCharacters);

      let scatterLabels = [];
      let scatterData = [];

      scatterCharacters.forEach((character) => {
        scatterLabels.push(character.name);
        scatterData.push({ x: character.events.available, y: character.comics.available });
      });

      let ctx = document.getElementById("chart").getContext('2d');
      Chart.defaults.global.elements.point.radius = 5;
      Chart.defaults.global.elements.point.hoverRadius = 6;
      Chart.defaults.global.defaultFontFamily = "'Overpass', sans-serif";
      Chart.defaults.global.defaultFontColor = '#22262a';
      var scatterChart = new Chart(ctx, {
        type: 'scatter',
        data: {
          labels: scatterLabels,
          datasets: [{
            label: 'Marvel Characters',
            data: scatterData,
            backgroundColor: 'rgba(237, 29, 36, .5)',
            borderColor: 'rgba(237, 29, 36)',
            borderWidth: 1
          }]
        },
        options: {
          aspectRatio: 1.5,
          legend: {
            display: false
          },
          title: {
            display: true,
            fontSize: '16',
            text: 'Marvel Characters: Comics and Events'
          },
          scales: {
            xAxes: [{
              type: 'linear',
              position: 'bottom',
              scaleLabel: {
                labelString: '# of Events',
                display: true,
                fontColor: 'rgb(237, 29, 36)',
                fontStyle: 'bold'
              }
            }],
            yAxes: [{
              type: 'linear',
              scaleLabel: {
                labelString: '# of Comics',
                display: true,
                fontColor: 'rgb(237, 29, 36)',
                fontStyle: 'bold'
              }
            }]
          },
          // https://stackoverflow.com/questions/44661671/chart-js-scatter-chart-displaying-label-specific-to-point-in-tooltip
          tooltips: {
            callbacks: {
              label: function (tooltipItem, data) {
                var label = data.labels[tooltipItem.index];
                return label + ': (' + tooltipItem.xLabel + ' comics, ' + tooltipItem.yLabel + ' events)';
              }
            }
          }
        }
      });

    });
  }, 300);
}

document.addEventListener("DOMContentLoaded", init);