'use strict';

import * as d3 from 'https://cdn.skypack.dev/d3@7';

function load() {
  d3.json(
    'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json'
  )
    .then(cyclistData => {
      cyclistData.forEach(cyclist => {
        const parsedScore = cyclist.Time.split(':');
        cyclist.Time = new Date(1970, 0, 1, 0, parsedScore[0], parsedScore[1]);
        cyclist.Year = new Date(cyclist.Year, 0);
      });

      const width = document.querySelector('.canvas').clientWidth,
        height = document.querySelector('.canvas').clientHeight,
        padding = 75,
        innerWidth = width - 2 * padding,
        innerHeight = height - 2 * padding;

      const scoreFormat = d3.timeFormat('%M:%S');

      const yearScale = d3
          .scaleTime()
          .domain(d3.extent(cyclistData, cyclist => cyclist.Year))
          .range([padding, padding + innerWidth]),
        scoreScale = d3
          .scaleTime()
          .domain(d3.extent(cyclistData, cyclist => cyclist.Time))
          .range([padding, padding + innerHeight]);

      const yearAxis = d3.axisBottom(yearScale),
        scoreAxis = d3.axisLeft(scoreScale).tickFormat(scoreFormat);

      const svg = d3.select('.canvas');

      svg.selectAll('circle').remove();
      svg.selectAll('g').remove();
      d3.selectAll('.legend').remove();

      // Axes.
      svg
        .append('g')
        .attr('transform', `translate(0, ${padding + innerHeight})`)
        .call(yearAxis);
      svg
        .append('g')
        .attr('transform', `translate(${padding}, 0)`)
        .call(scoreAxis);

      // Circles.
      svg
        .selectAll('circle')
        .data(cyclistData)
        .enter()
        .append('circle')
        .attr('cx', cyclist => yearScale(cyclist.Year))
        .attr('cy', cyclist => scoreScale(cyclist.Time))
        .attr('r', 5)
        .attr('class', cyclist => `circle ${cyclist.Doping ? 'red' : 'green'}`)
        .style('fill', cyclist => (cyclist.Doping ? 'red' : 'green'));

      // Legend.

      const categoryInfo = [
        {
          class: 'doping',
          text: 'Cyclists with doping allegations',
          fill: 'red',
        },
        {
          class: 'no-doping',
          text: 'Cyclists without allegations',
          fill: 'green',
        },
      ];

      // Main legend container.
      const legend = d3.select('body').append('div').attr('class', 'legend');

      // One container for each different data category.
      const categories = legend
        .selectAll('div')
        .data(categoryInfo)
        .enter()
        .append('div')
        .attr('class', item => `category ${item.class}`)
        .on('click', event => {
          const dopingCategory = document.querySelector('.doping'),
            noDopingCategory = document.querySelector('.no-doping');
          // Toggle the correspinding .category div's inactive class.
          // Edit the CSS so that categories with the inactive class have a faded out text.
          // Then, toggle all of the corresponding circles' 'hide' class.
          if (event.path.includes(dopingCategory)) {
            dopingCategory.classList.toggle('inactive');
            document
              .querySelectorAll('.red')
              .forEach(circle => circle.classList.toggle('hide'));
          } else {
            noDopingCategory.classList.toggle('inactive');
            document
              .querySelectorAll('.green')
              .forEach(circle => circle.classList.toggle('hide'));
          }
        });

      // svg and .text div inside each category.
      categories
        .append('svg')
        .attr('class', 'svg')
        .append('circle')
        .attr('cx', document.querySelector('.svg').clientWidth / 2)
        .attr('cy', document.querySelector('.svg').clientHeight / 2)
        .attr('r', document.querySelector('.svg').clientWidth / 2)
        .attr('fill', item => item.fill);
      categories
        .append('div')
        .attr('class', 'text')
        .text(item => item.text);
    })
    .catch(err => console.error(err));
}

load();
window.onresize = load;
