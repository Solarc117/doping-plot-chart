'use strict'

import * as d3 from 'https://cdn.skypack.dev/d3@7'

async function load() {
  try {
    const cyclistData = await d3.json(
      'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json'
    )
    cyclistData.forEach(cyclist => {
      const parsedScore = cyclist.Time.split(':')
      cyclist.Time = new Date(1970, 0, 1, 0, parsedScore[0], parsedScore[1])
      cyclist.Year = new Date(cyclist.Year, 0)
    })

    const { clientWidth: width, clientHeight: height } =
        document.querySelector('.canvas'),
      padding = 75,
      innerWidth = width - 2 * padding,
      innerHeight = height - 2 * padding

    const scoreFormat = d3.timeFormat('%M:%S')

    const yearScale = d3
        .scaleTime()
        .domain(d3.extent(cyclistData, cyclist => cyclist.Year))
        .range([padding, padding + innerWidth]),
      scoreScale = d3
        .scaleTime()
        .domain(d3.extent(cyclistData, cyclist => cyclist.Time))
        .range([padding, padding + innerHeight])

    const yearAxis = d3.axisBottom(yearScale),
      scoreAxis = d3.axisLeft(scoreScale).tickFormat(scoreFormat)

    const svg = d3.select('.canvas')

    const nodesToRemove = ['circle', 'g', '.legend', '.score-axis-title']
    nodesToRemove.forEach(node => d3.selectAll(node).remove())

    // Axes.
    svg
      .append('g')
      .attr('transform', `translate(0, ${padding + innerHeight})`)
      .call(yearAxis)
    svg
      .append('g')
      .attr('transform', `translate(${padding}, 0)`)
      .call(scoreAxis)
    d3.select('body')
      .append('text')
      .attr('class', 'score-axis-title')
      .text('Best time (min:sec)')

    // Circles.
    const circles = svg
      .selectAll('circle')
      .data(cyclistData)
      .enter()
      .append('circle')
      .attr('cx', ({ Year }) => yearScale(Year))
      .attr('cy', ({ Time }) => scoreScale(Time))
      .attr('r', 5)
      .attr('class', ({ Doping }) => `circle ${Doping ? 'red' : 'green'}`)
      .style('fill', ({ Doping }) => (Doping ? 'red' : 'green'))

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
    ]

    // Main legend container.
    const legend = d3.select('body').append('div').attr('class', 'legend')

    // One container for each different data category.
    const categories = legend
      .selectAll('div')
      .data(categoryInfo)
      .enter()
      .append('div')
      .attr('class', item => `category ${item.class}`)
      .on('click', event => {
        const dopingCategory = document.querySelector('.doping'),
          noDopingCategory = document.querySelector('.no-doping')
        if (event.path.includes(dopingCategory)) {
          dopingCategory.classList.toggle('inactive')
          document
            .querySelectorAll('.red')
            .forEach(circle => circle.classList.toggle('hide'))
        } else {
          noDopingCategory.classList.toggle('inactive')
          document
            .querySelectorAll('.green')
            .forEach(circle => circle.classList.toggle('hide'))
        }
      })

    // svg and .text div inside each category.
    categories
      .append('svg')
      .attr('class', 'svg')
      .append('circle')
      .attr('cx', document.querySelector('.svg').clientWidth / 2)
      .attr('cy', document.querySelector('.svg').clientHeight / 2)
      .attr('r', document.querySelector('.svg').clientWidth / 2)
      .attr('fill', item => item.fill)
    categories
      .append('div')
      .attr('class', 'text')
      .text(item => item.text)

    // Tooltip.
    const tooltip = document.querySelector('.tooltip')
    let tooltipWidth, tooltipHeight, hideTooltip
    
    circles.on('mouseover', event => {
      clearTimeout(hideTooltip)
      tooltip.classList.remove('hide')
      // In order to make this less jittery, the circle's coordinates are used instead of the mouse's.
      const { left: circleLeft, top: circleTop } =
          event.target.getBoundingClientRect(),
        { Doping, Name, Nationality, Place, Year, Time } = event.target.__data__

      let dopingHTML = Doping ? `<br><br>${Doping}` : ''
      tooltip.innerHTML =
        `${Name}, ${Nationality}, #${Place}<br>${Year.getFullYear()}, ${scoreFormat(
          Time
        )}` + dopingHTML
      // The innerHTML is what determines w/h, so set these AFTER innerHTML is set.
      tooltipWidth = tooltip.clientWidth
      tooltipHeight = tooltip.clientHeight

      tooltip.style.top = `${
        Time.getMinutes() < 38 ? circleTop + 10 : circleTop - tooltipHeight
      }px`
      tooltip.style.left = `${
        Year.getFullYear() < 2005 ? circleLeft : circleLeft - tooltipWidth
      }px`

      const keyframes = [
          {
            opacity: 0,
          },
          {
            opacity: 1,
          },
        ],
        options = {
          duration: 300,
          fill: 'forwards',
        }

      tooltip.animate(keyframes, options)
    })
    circles.on('mouseout', () => {
      const keyframes = [
          {
            opacity: 1,
          },
          {
            opacity: 0,
          },
        ],
        options = {
          duration: 300,
          fill: 'forwards',
        }

      tooltip.animate(keyframes, options)
      hideTooltip = setTimeout(() => tooltip.classList.add('hide'), 300)
    })
  } catch (error) {
    console.error(error)
  }
}

load()
window.onresize = load
