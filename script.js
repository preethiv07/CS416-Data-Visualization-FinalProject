document.addEventListener("DOMContentLoaded", async function() {
  const page1 = document.getElementById("page1");
  const page2 = document.getElementById("page2");
  const page3 = document.getElementById("page3");

  const nextArrowPage1 = document.getElementById("nextArrowPage1");
  const nextArrowPage2 = document.getElementById("nextArrowPage2");
  const prevArrowPage3 = document.getElementById("prevArrowPage3");

  nextArrowPage1.addEventListener("click", function() {
      page1.classList.remove("active");
      page2.classList.add("active");
  });

  nextArrowPage2.addEventListener("click", function() {
      page2.classList.remove("active");
      page3.classList.add("active");
      loadData(); // Ensure the data is loaded when navigating to Page 3
  });

  prevArrowPage3.addEventListener("click", function() {
      page3.classList.remove("active");
      page2.classList.add("active");
  });

  async function loadData() {
      try {
          console.log("Loading data...");
          const data = await d3.csv("data/TrendsbyDomestic.csv");
          console.log("Data loaded:", data);

          // Process the data
          const parseDate = d3.timeParse("%Y%m");
          data.forEach(d => {
              d.Occured = parseDate(d.Occured);
              d["Non-Domestic"] = +d["Non-Domestic"];
              d.Domestic = +d.Domestic;
          });
          console.log("Processed data:", data);

          // Set dimensions and margins
          const margin = { top: 50, right: 50, bottom: 50, left: 50 };
          const width = document.getElementById("chart").offsetWidth - margin.left - margin.right;
          const height = 400 - margin.top - margin.bottom;

          // Clear existing SVG
          d3.select("#chart").select("svg").remove();

          // Create the SVG container
          const svg = d3.select("#chart")
              .append("svg")
              .attr("width", width + margin.left + margin.right)
              .attr("height", height + margin.top + margin.bottom)
              .append("g")
              .attr("transform", `translate(${margin.left},${margin.top})`);

          // Set x and y scales
          const x = d3.scaleTime()
              .domain(d3.extent(data, d => d.Occured))
              .range([0, width]);

          const y = d3.scaleLinear()
              .domain([0, d3.max(data, d => Math.max(d["Non-Domestic"], d.Domestic))])
              .nice()
              .range([height, 0]);

          // Define the line functions
          const lineNonDomestic = d3.line()
              .x(d => x(d.Occured))
              .y(d => y(d["Non-Domestic"]));

          const lineDomestic = d3.line()
              .x(d => x(d.Occured))
              .y(d => y(d.Domestic));

          // Add the Non-Domestic line path
          svg.append("path")
              .datum(data)
              .attr("class", "line line-non-domestic")
              .attr("d", lineNonDomestic)
              .call(animatePath);

          // Add the Domestic line path
          svg.append("path")
              .datum(data)
              .attr("class", "line line-domestic")
              .attr("d", lineDomestic)
              .call(animatePath);

          // Function to animate path drawing
          function animatePath(path) {
              const totalLength = path.node().getTotalLength();
              path.attr("stroke-dasharray", totalLength + " " + totalLength)
                  .attr("stroke-dashoffset", totalLength)
                  .transition()
                  .duration(3000)
                  .attr("stroke-dashoffset", 0)
                  .on("end", function() {
                      if (path.attr("class") === "line line-domestic") {
                          addAnnotation();
                      }
                      addRectangle();
                  }); // Call addRectangle after animation ends
          }

<<<<<<< HEAD
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
=======
          // Add x-axis
          svg.append("g")
              .attr("transform", `translate(0,${height})`)
              .call(d3.axisBottom(x));
>>>>>>> parent of 94d8b2d (0701 5pm)

          // Add y-axis
          svg.append("g")
              .call(d3.axisLeft(y));

          // Add legends
          const legend = svg.append("g")
              .attr("class", "legend")
              .attr("transform", `translate(${width - 150},${margin.top-60})`); // Adjusted position here

          legend.append("rect")
              .attr("x", 0)
              .attr("y", 0)
              .attr("width", 10)
              .attr("height", 10)
              .attr("fill", "#003366"); // Color for Non-Domestic

<<<<<<< HEAD
    legendGroup.append("rect")
        .attr("x", -160)
        .attr("y", -15)
        .attr("width", 20)
        .attr("height", 20)
        .attr("fill", dataType === "Non-Domestic" ? "#003366" : "rgb(48, 183, 183)");

    legendGroup.append("text")
        .attr("x", -130)
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
=======
          legend.append("text")
              .attr("x", 15)
              .attr("y", 8)
              .text("Non-Domestic");

          legend.append("rect")
              .attr("x", 0)
              .attr("y", 20)
              .attr("width", 10)
              .attr("height", 10)
              .attr("fill", "rgb(48, 183, 183)"); // Color for Domestic

          legend.append("text")
              .attr("x", 15)
              .attr("y", 28)
              .text("Domestic");

          // Function to add annotation for Dec 2023, non-domestic point
          function addAnnotation() {
              const annotation = svg.append("g")
                  .attr("class", "annotation");

              const dec2023Data = data.find(d => d.Occured.getMonth() === 11 && d.Occured.getFullYear() === 2023);
              const dec2023X = x(dec2023Data.Occured);
              const dec2023Y = y(dec2023Data["Non-Domestic"]);

              // Define the SVG path for the exclamation mark
              const exclamationPath = "M7,16H9V7H7V16ZM7,18H9V20H7V18Z";

              annotation.append("text")
                  .attr("x", dec2023X)
                  .attr("y", dec2023Y + 30)
                  .attr("dx", 50)
                  .attr("dy", 10)
                  .attr("text-anchor", "start")
                  .text("2024 Q1 shows increased non-domestic crimes")
                  .attr("class", "annotation-text");

              // Append the exclamation mark path
              annotation.append("path")
                  .attr("d", exclamationPath)
                  .attr("fill", "red")
                  .attr("transform", `translate(${dec2023X + 30},${dec2023Y + 20})`); // Adjust position as needed

              // Add line from rectangle to annotation text
              annotation.append("line")
                  .attr("x1", dec2023X + 80)
                  .attr("y1", dec2023Y - 5)
                  .attr("x2", dec2023X + 80)
                  .attr("y2", dec2023Y + 20)
                  .attr("stroke", "red")
                  .attr("stroke-width", 2);
          }

          // Function to add rectangle around Jan 2024, Feb 2024, and Mar 2024
          function addRectangle() {
              const jan2024 = new Date(2024, 0, 1);
              const mar2024 = new Date(2024, 2, 31);
              const x1 = x(jan2024);
              const x2 = x(mar2024);

              svg.append("rect")
                  .attr("x", x1 - 50)
                  .attr("y", 0)
                  .attr("width", x2 - x1)
                  .attr("height", height - 250)
                  .attr("fill", "none")
                  .attr("stroke", "red")
                  .attr("stroke-width", 2);
          }

          console.log("Chart rendered successfully!");
      } catch (error) {
          console.error("Error loading data or rendering chart:", error);
      }
  }

  // Initially load data when DOM content is loaded
  loadData();
>>>>>>> parent of 94d8b2d (0701 5pm)
});
