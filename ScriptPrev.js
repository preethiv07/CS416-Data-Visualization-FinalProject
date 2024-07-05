document.addEventListener("DOMContentLoaded", async function() {
    const page1 = document.getElementById("page1");
    const page2 = document.getElementById("page2");
    const page3 = document.getElementById("page3");
    const page4 = document.getElementById("page4");
    const page5 = document.getElementById("page5");
    const nextArrowPage1 = document.getElementById("nextArrowPage1");
    const nextArrowPage2 = document.getElementById("nextArrowPage2");
    const nextArrowPage3 = document.getElementById("nextArrowPage3");
    const prevArrowPage4 = document.getElementById("prevArrowPage4");
    const nextArrowPage4 = document.getElementById("nextArrowPage4");
    const prevArrowPage5 = document.getElementById("prevArrowPage5");
  
  
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
  
    nextArrowPage4.addEventListener("click", () => {
        page4.classList.remove("active");
        page5.classList.add("active");
        renderDualLineChart("#chart5");
    });
  
    prevArrowPage5.addEventListener("click", () => {
        page5.classList.remove("active");
        page1.classList.add("active");
        // renderChart("Domestic", "#chart4", "line-domestic");
    });
  
    const data = await d3.csv("data/TrendsbyDomestic.csv");
  
  
  
   // Parse the data
   const parseDate = d3.timeParse("%Y%m");
   data.forEach(d => {
       d.Occured = parseDate(d.Occured);
       d["Non-Domestic"] = +d["Non-Domestic"];
       d["Domestic"] = +d["Domestic"];
       d["Non-DomesticArrest"] = +d["Non-DomesticArrest"];
       d["DomesticArrest"] = +d["DomesticArrest"];
       d["Non-DomesticArrestPerc"] = parseFloat(d["Non-DomesticArrestPerc"]) ;
       d["DomesticArrestPerc"] = parseFloat(d["DomesticArrestPerc"]) ;
   });
  
   console.log("Data loaded:", data);
  
    // Set the dimensions and margins of the graph
    const margin = { top: 20, right: 20, bottom: 60, left: 50 },
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
  
  const lineNonDomesticArrestPerc = d3.line()
  .x(d => x(d.Occured))
  .y(d => y(d["Non-DomesticArrestPerc"]))
  .curve(d3.curveMonotoneX);
  
  const lineDomesticArrestPerc = d3.line()
  .x(d => x(d.Occured))
  .y(d => y(d["DomesticArrestPerc"]))
  .curve(d3.curveMonotoneX);
  
    function renderChart(dataType, chartId, lineClass, isPercentage = false) {
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
      const line = dataType.includes("ArrestPerc") ? (dataType === "Non-DomesticArrestPerc" ? lineNonDomesticArrestPerc : lineDomesticArrestPerc) : (dataType === "Non-Domestic" ? lineNonDomestic : lineDomestic);
  
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
            addAnnotation(svg, parseDate("202401"), "Increased non-domestic crimes in 2024", x, y, "Non-Domestic");
          } else if (dataType === "Domestic") {
            addRectangle(svg, parseDate("20230111"), parseDate("20240131"), height, x, "Domestic");
            addAnnotation(svg, parseDate("202311"), "upward trend after the low point", x, y, "Domestic");
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
        //   .attr("fill", dataType === "Non-Domestic" ? "#003366" : "rgb(10, 126, 124)");
          .attr("fill", dataType.includes("ArrestPerc") ? (dataType === "Non-DomesticArrestPerc" ? "#FF5733" : "#C70039") : (dataType === "Non-Domestic" ? "#003366" : "rgb(10, 126, 124)"));
  
      legendGroup.append("text")
          .attr("x", -90)
          .attr("y", 2)
          .attr("class", "legend")
          .style("text-anchor", "start")
        //   .text(dataType === "Non-Domestic" ? "Non-Domestic Crimes" : "Domestic Crimes");
          .text(dataType.includes("ArrestPerc") ? (dataType === "Non-DomesticArrestPerc" ? "Non-Domestic Arrest %" : "Domestic Arrest %") : (dataType === "Non-Domestic" ? "Non-Domestic Crimes" : "Domestic Crimes"));
    }
  
  
    function addAnnotation(svg, annotationDate, annotationText, x, y, dataType) {
      const bisectDate = d3.bisector(d => d.Occured).left;
      const annotationData = data[bisectDate(data, annotationDate)];
      const xValue = x(annotationData.Occured);
      const yValue = y(annotationData[dataType]);
  
      svg.append("text")
          .attr("x", xValue + (dataType === "Non-Domestic" ? 200 : 400))
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
          .attr("x", dataType === "Non-Domestic" ? 600 : 600)
          .attr("y", dataType === "Non-Domestic" ? 30 : 10)
          .attr("width", dataType === "Non-Domestic" ? 300 : 300)
          .attr("height", dataType === "Non-Domestic" ? 60 : 90)
          .attr("fill", "none")
          .attr("stroke", "red")
          .attr("stroke-width", 2)
          .attr("stroke-dasharray", "4,4"); // This makes the line dotted
    }
  
    function renderDualLineChart(chartId) {
        d3.select(chartId).select("svg").remove();
    
        const svg = d3.select(chartId).append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    
        x.domain(d3.extent(data, d => d.Occured));
        y.domain([8, 18]); // Set y domain from 0 to 20 for percentages
    
        const lineNonDomesticArrestPerc = d3.line()
            .x(d => x(d.Occured))
            .y(d => y(d["Non-DomesticArrestPerc"]))
            .curve(d3.curveMonotoneX);
    
        const lineDomesticArrestPerc = d3.line()
            .x(d => x(d.Occured))
            .y(d => y(d["DomesticArrestPerc"]))
            .curve(d3.curveMonotoneX);
    
            const pathNonDomestic = svg.append("path")
            .data([data])
            .attr("class", "line line-non-domestic-arrest-perc")
            .attr("d", lineNonDomesticArrestPerc)
            .attr("stroke", "#003366")
            .attr("fill", "none");

        const pathDomestic = svg.append("path")
            .data([data])
            .attr("class", "line line-domestic-arrest-perc")
            .attr("d", lineDomesticArrestPerc)
            .attr("stroke", "rgb(10, 126, 124)")
            .attr("fill", "none");
    
        // Animation Dual
        const totalLengthNonDomestic = pathNonDomestic.node().getTotalLength();
        const totalLengthDomestic = pathDomestic.node().getTotalLength();
        
        console.log("Paths set:", totalLengthNonDomestic, totalLengthDomestic);
    
        pathNonDomestic
            .attr("stroke-dasharray", `${totalLengthNonDomestic} ${totalLengthNonDomestic}`)
            .attr("stroke-dashoffset", totalLengthNonDomestic)
            .transition()
            .duration(1000)
            .ease(d3.easeLinear)
            .attr("stroke-dashoffset", 0);
    
        pathDomestic
            .attr("stroke-dasharray", `${totalLengthDomestic} ${totalLengthDomestic}`)
            .attr("stroke-dashoffset", totalLengthDomestic)
            .transition()
            .duration(1000)
            .ease(d3.easeLinear)
            .attr("stroke-dashoffset", 0);
    
        svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x));
    
        svg.append("g")
            .call(d3.axisLeft(y)
                .ticks(10)
                .tickFormat(d => d.toFixed(1) + "%"));
     // Add legend
            const legendGroup = svg.append("g")
                .attr("transform", "translate(" + (width - 80) + "," + (height - 20) + ")");
            

            addLegend(legendGroup, "Both");
        
            // New function to add legend
    function addLegend(legendGroup, selectedType) {
        legendGroup.selectAll("*").remove();

        if (selectedType === "Non-Domestic" || selectedType === "Both") {
            legendGroup.append("rect")
                .attr("x", -130)
                .attr("y", -60)
                .attr("width", 20)
                .attr("height", 20)
                .attr("fill", "#003366");

            legendGroup.append("text")
                .attr("x", -90)
                .attr("y", -45)
                .attr("class", "legend")
                .style("text-anchor", "start")
                .text("Non-Domestic Arrest %");
        }

        if (selectedType === "Domestic" || selectedType === "Both") {
            legendGroup.append("rect")
                .attr("x", -130)
                .attr("y", selectedType === "Both" ? -30 : -15)
                .attr("width", 20)
                .attr("height", 20)
                .attr("fill", "rgb(10, 126, 124)");

            legendGroup.append("text")
                .attr("x", -90)
                .attr("y", selectedType === "Both" ? -15 : -10)
                .attr("class", "legend")
                .style("text-anchor", "start")
                .text("Domestic Arrest %");
        }
    }
    
        // Add tooltips
        const tooltip = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("opacity", 0)
            .style("position", "absolute")
            .style("background-color", "white")
            .style("border", "1px solid #ddd")
            .style("padding", "10px")
            .style("border-radius", "5px");
    
        const bisectDate = d3.bisector(d => d.Occured).left;
    
        const focus = svg.append("g")
            .style("display", "none");
    
        focus.append("circle")
            .attr("r", 5)
            .attr("class", "focus-circle");
    
        svg.append("rect")
            .attr("class", "overlay")
            .attr("width", width)
            .attr("height", height)
            .style("fill", "none")
            .style("pointer-events", "all")
            .on("mouseover", () => focus.style("display", null))
            .on("mouseout", () => {
                focus.style("display", "none");
                tooltip.style("opacity", 0);
            })
            .on("mousemove", mousemove);
    
            function mousemove(event) {
                const x0 = x.invert(d3.pointer(event)[0]);
                const i = bisectDate(data, x0, 1);
                const d0 = data[i - 1];
                const d1 = data[i];
                const d = x0 - d0.Occured > d1.Occured - x0 ? d1 : d0;
        
                focus.attr("transform", `translate(${x(d.Occured)},${y(d["Non-DomesticArrestPerc"])})`);
        
                const formatDate = d3.timeFormat("%B %Y");
                const formattedDate = formatDate(d.Occured);
        
                tooltip.transition()
                    .duration(200)
                    .style("opacity", .9);
                tooltip.html(`
                    <strong>${formattedDate}</strong><br/>
                    <strong>Non-Domestic:</strong>
                    Crimes: ${d["Non-Domestic"]}<br/>
                    Arrest %: ${d["Non-DomesticArrestPerc"].toFixed(1)}%<br/>
                    <strong>Domestic:</strong>
                    Crimes: ${d["Domestic"]}<br/>
                    Arrest %: ${d["DomesticArrestPerc"].toFixed(1)}%
                `)
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 28) + "px");
            }
    }
  
    // Radio button event listener
    d3.selectAll('input[name="crimeType"]').on("change", function() {
        const selectedType = this.value;
        updateChart(selectedType);
    });

    function updateChart(selectedType) {
        const svg = d3.select("#chart5").select("svg");
        const pathNonDomestic = svg.select(".line-non-domestic-arrest-perc");
        const pathDomestic = svg.select(".line-domestic-arrest-perc");

        pathNonDomestic.style("display", selectedType === "Non-Domestic" || selectedType === "Both" ? null : "none");
        pathDomestic.style("display", selectedType === "Domestic" || selectedType === "Both" ? null : "none");

        const legendGroup = svg.select("g").select("g");
        addLegend(legendGroup, selectedType);
    }
    }
  );
  