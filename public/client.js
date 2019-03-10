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
      duration: "100%"
    })
      .setPin(slide)
      .addTo(controller);
  });

  // Fetch data from Marvel API

  setTimeout(function () {
    fetch('/character').then(resp => resp.json()).then((data) => {
      console.log(data);

      let comicsAll = [];
      let eventsAll = [];
      let mainData = [];
      let teamData = [];
      let main = [
        { name: 'Spider-Man', id: '1009610' },
        { name: 'Wolverine', id: '1009718' },
        { name: 'Iron-man', id: '1009368' },
        { name: 'Captain America', id: '1009220' },
        { name: 'Thor', id: '1009664' },
        { name: 'Hulk', id: '1009351' }
      ];

      let teams = [
        { name: 'Avengers', id: '1009165' },
        { name: 'X-men', id: '1009726' },
        { name: 'Fantastic Four', id: '1009299' }
      ];

      // Create arrays with all character data
      data.forEach((group) => {
        group.forEach((character) => {
          comicsAll.push(character);
          eventsAll.push(character);
        });
      });

      // Filter data by selected character ids
      function filter(array) {
        let filteredData = [];
        for (let i = 0; i < array.length; i++) {
          data.forEach((group) => {
            group.forEach((character) => {
              if (character.id == array[i].id) {
                filteredData.push(character);
              }
            });
          });
        }
        return filteredData;
      }

      mainData = filter(main);
      teamData = filter(teams);

      // Alphabetically order data using character names
      mainData.sort(names);
      teamData.sort(names);

      console.log("team", teamData);

      let panel1Content = document.getElementById("panel1__content");
      let panel2Content = document.getElementById("panel2__content");

      function cards(array, id, shape, size) {
        array.forEach((item) => {
          let div = document.createElement("div");
          let divClass = document.createAttribute("class");
          divClass.value = "panel__card";
          div.setAttributeNode(divClass);
          let img = document.createElement("img");
          let src = document.createAttribute("src");
          src.value = `${item.thumbnail.path}/${shape}_${size}.${item.thumbnail.extension}`;
          img.setAttributeNode(src);
          let h2 = document.createElement("h2");
          h2.innerText = item.name;
          let p = document.createElement("p");
          let pClass = document.createAttribute("class");
          pClass.value = "hidden";
          p.innerText = item.description;
          p.setAttributeNode(pClass);
          div.appendChild(img);
          div.appendChild(h2);
          div.appendChild(p);
          id.appendChild(div);
        });
      }

      cards(mainData, panel1Content, 'landscape', 'xlarge');
      cards(teamData, panel2Content, 'portrait', 'uncanny');


      // CHART.JS

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

      comicsAll.sort(comics); // Sort characters by highest number of comics
      eventsAll.sort(events); // Sort characters by highest number of events

      let comicsShort = comicsAll.slice(0, 30); // 30 characters with the most comics
      let eventsShort = eventsAll.slice(0, 30); // 30 characters with the most events

      // https://stackoverflow.com/questions/1584370/how-to-merge-two-arrays-in-javascript-and-de-duplicate-items
      function removeDuplicates(array) {
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

      // Merge comicsShort and eventsShort arrays with duplicates removed
      let joined = removeDuplicates(comicsShort.concat(eventsShort));
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
            text: '36 Most Common Marvel Characters'
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
                return label + ': (' + tooltipItem.xLabel + ' events, ' + tooltipItem.yLabel + ' comics)';
              }
            }
          }
        }
      });

    });
  }, 300);
}

document.addEventListener("DOMContentLoaded", init);