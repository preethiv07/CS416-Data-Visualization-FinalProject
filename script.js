document.addEventListener("DOMContentLoaded", async function() {
    const page1 = document.getElementById("page1");
    const page2 = document.getElementById("page2");
    const page3 = document.getElementById("page3");
    const page4 = document.getElementById("page4");
    const nextArrowPage1 = document.getElementById("nextArrowPage1");
    const nextArrowPage2 = document.getElementById("nextArrowPage2");
    const nextArrowPage3 = document.getElementById("nextArrowPage3");
    const prevArrowPage4 = document.getElementById("prevArrowPage4");
  
    nextArrowPage1.addEventListener("click", () => {
      page1.classList.remove("active");
      page2.classList.add("active");
    });
  
    nextArrowPage2.addEventListener("click", () => {
      page2.classList.remove("active");
      page3.classList.add("active");
      renderChart("Non-Domestic", "#chart3", "line-non-domestic");
    });
  
    nextArrowPage3.addEventListener("click", () => {
      page3.classList.remove("active");
      page4.classList.add("active");
      renderChart("Domestic", "#chart4", "line-domestic");
    });
  
    prevArrowPage4.addEventListener("click", () => {
      page4.classList.remove("active");
      page3.classList.add("active");
      renderChart("Non-Domestic", "#chart3", "line-non-domestic"); // Re-render Page 3 chart
    });
  
    const data = await d3.csv("data/TrendsbyDomestic.csv");
  
    // Parse the data
    const parseDate = d3.timeParse("%Y%m");
    data.forEach(d => {
      d.Occured = parseDate(d.Occured);
      d["Non-Domestic"] = +d["Non-Domestic"];
      d["Domestic"] = +d["Domestic"];
    });
  
    // Set the dimensions and margins of the graph
    const margin = {top: 20, right: 20, bottom: 60, left: 50},
          width = 960 - margin.left - margin.right,
          height = 500 - margin.top - margin.bottom;
  
    // Set the ranges
    const x = d3.scaleTime().range([0, width]);
    const y = d3.scaleLinear().range([height, 0]);
  
    // Define the line functions
    const lineNonDomestic = d3.line()
        .x(d => x(d.Occured))
        .y(d => y(d["Non-Domestic"]))
        .curve(d3.curveMonotoneX);
  
    const lineDomestic = d3.line()
        .x(d => x(d.Occured))
        .y(d => y(d["Domestic"]))
        .curve(d3.curveMonotoneX);
  
    function renderChart(dataType, chartId, lineClass) {
      // Remove any existing SVG
      d3.select(chartId).select("svg").remove();
  
      // Append the svg object to the specified div
      const svg = d3.select(chartId).append("svg")
          .attr("width", width + margin.left + margin.right)
          .attr("height", height + margin.top + margin.bottom)
        .append("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
  
      // Scale the range of the data
      x.domain(d3.extent(data, d => d.Occured));
      y.domain([0, d3.max(data, d => d[dataType])]);
  
      // Define the line based on the data type
      const line = dataType === "Non-Domestic" ? lineNonDomestic : lineDomestic;
  
      // Add the valueline path.
      const path = svg.append("path")
          .data([data])
          .attr("class", `line ${lineClass}`)
          .attr("d", line);
  
      // Animate the line drawing
      const totalLength = path.node().getTotalLength();
      path
        .attr("stroke-dasharray", `${totalLength} ${totalLength}`)
        .attr("stroke-dashoffset", totalLength)
        .transition()
        .duration(1000)
        .ease(d3.easeLinear)
        .attr("stroke-dashoffset", 0)
        .on("end", function() {
          // Add rectangle and annotation after animation completes
          if (dataType === "Non-Domestic") {
            addRectangle(svg, parseDate("20240101"), parseDate("20240331"), height, x, "Non-Domestic");
            addAnnotation(svg, parseDate("202401"), "Increased non-domestic crimes in Q1 2024", x, y, "Non-Domestic");
          } else if (dataType === "Domestic") {
            addRectangle(svg, parseDate("20230111"), parseDate("20240131"), height, x, "Domestic");
            addAnnotation(svg, parseDate("202311"), "Domestic crimes low in Nov 2023", x, y, "Domestic");
          }
        });
  
      // Add the X Axis
      svg.append("g")
          .attr("transform", "translate(0," + height + ")")
          .call(d3.axisBottom(x));
  
      // Add the Y Axis
      svg.append("g")
          .call(d3.axisLeft(y));
  
      // Add legend with color indicator
      const legendGroup = svg.append("g")
          .attr("transform", "translate(" + (width - 80) + "," + (height - 20) + ")");
  
      legendGroup.append("rect")
          .attr("x", -130)
          .attr("y", -15)
          .attr("width", 20)
          .attr("height", 20)
          .attr("fill", dataType === "Non-Domestic" ? "#003366" : "rgb(48, 183, 183)");
  
      legendGroup.append("text")
          .attr("x", -90)
          .attr("y", 2)
          .attr("class", "legend")
          .style("text-anchor", "start")
          .text(dataType === "Non-Domestic" ? "Non-Domestic Crimes" : "Domestic Crimes");
    }
  
    function addAnnotation(svg, annotationDate, annotationText, x, y, dataType) {
      const bisectDate = d3.bisector(d => d.Occured).left;
      const annotationData = data[bisectDate(data, annotationDate)];
      const xValue = x(annotationData.Occured);
      const yValue = y(annotationData[dataType]);
  
      svg.append("text")
          .attr("x", xValue + (dataType === "Non-Domestic" ? 80 : 50))
          .attr("y", yValue + (dataType === "Non-Domestic" ? 70 : 60))
          .attr("dy", -10) // Adjust as needed
          .attr("text-anchor", "middle")
          .attr("class", "annotation-text")
          .text(annotationText);
    }
  
    function addRectangle(svg, startDate, endDate, chartHeight, x, dataType) {
      const xStart = x(startDate);
      const xEnd = x(endDate);
  
      svg.append("rect")
          .attr("x", dataType === "Non-Domestic" ? 450 : 290)
          .attr("y", dataType === "Non-Domestic" ? -10 : 60)
          .attr("width", dataType === "Non-Domestic" ? 220 : 60)
          .attr("height", 40)
          .attr("fill", "none")
          .attr("stroke", "red")
          .attr("stroke-width", 2)
          .attr("stroke-dasharray", "4,4"); // This makes the line dotted
    }
  });
  