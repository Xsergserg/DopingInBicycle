let xhr = new XMLHttpRequest();
xhr.open(
	"GET",
	"https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json",
	false
);
xhr.send();
const dataset = JSON.parse(xhr.responseText);
dataset.forEach(function(d) {
	arrTime = d.Time.split(":");
	d.Time = new Date();
	d.Year = parseInt(d.Year);
	d.Time.setHours(0, arrTime[0], arrTime[1]);
});

const SVGwidth = 1000;
const SVGheight = 400;
const leftPadding = 60;
const rightPadding = 40;
const topPadding = 0;
const bottomPadding = 20;
const radius = 5;
const legendWidth = 250;
const legendHeight = 20;
let timeMin = new Date();
let timeMax = new Date();

timeMin.setTime(d3.min(dataset, d => d.Time).getTime() - 5000);
timeMax.setTime(d3.max(dataset, d => d.Time).getTime() + 5000);

const xScale = d3
	.scaleLinear()
	.domain([
		d3.min(dataset, d => d.Year - 1),
		d3.max(dataset, d => d.Year + 1)
	])
	.range([0, SVGwidth - (leftPadding + rightPadding)]);
const yScale = d3
	.scaleTime()
	.domain([timeMin, timeMax])
	.range([0, SVGheight - (topPadding + bottomPadding)]);
const xAxis = d3.axisBottom(xScale).tickFormat(d3.format("d"));
const yAxis = d3.axisLeft(yScale).tickFormat(d3.timeFormat("%M:%S"));

let tooltip = d3
	.select("body")
	.append("div")
	.attr("id", "tooltip")
	.style("opacity", 0);

function tooltipInfo(data) {
	let tooltip = "";
	dataArray = [...Object.entries(data)];
	dataArray[0] = [dataArray[3], (dataArray[3] = dataArray[0])][0];
	dataArray[1] = [dataArray[3], (dataArray[3] = dataArray[1])][0];
	dataArray.forEach(item => {
		if (item[1] !== "") {
			if (item[0] === "Name") {
				tooltip +=
					"<p class='tooltipText' style='text-align: center'>" +
					data.Name +
					"</p>";
			} else if (item[0] === "Time") {
				tooltip +=
					"<p class='tooltipText'>Time: " +
					data.Time.toLocaleTimeString([], {
						minute: "2-digit",
						second: "2-digit"
					}) +
					"</p>";
			} else {
				tooltip +=
					"<p class='tooltipText'>" +
					item[0] +
					": " +
					item[1] +
					"</p>";
			}
		}
	});
	console.log("Tip:", tooltip);
	return tooltip;
}

svg = d3
	.select(".container")
	.append("svg")
	.attr("width", SVGwidth)
	.attr("height", SVGheight);
svg.selectAll("circle")
	.data(dataset)
	.enter()
	.append("circle")
	.attr("cx", d => xScale(d.Year) + leftPadding)
	.attr("cy", d => yScale(d.Time) + topPadding)
	.attr("r", radius)
	.attr("class", "dot")
	.attr("data-xvalue", d => d.Year)
	.attr("data-yvalue", d => d.Time)
	.attr("fill", d => (d.Doping === "" ? "green" : "red"))
	.on("mouseover", d => {
		tooltip
			.transition()
			.duration(200)
			.style("opacity", 0.9);
		tooltip
			.html(tooltipInfo(d))
			.attr("data-year", d.Year)
			.style("left", d3.event.pageX + 10 + "px")
			.style("top", d3.event.pageY - 25 + "px");
	})
	.on("mouseout", () =>
		tooltip
			.transition()
			.duration(500)
			.style("opacity", 0)
	);
svg.append("g")
	.attr(
		"transform",
		"translate(" + leftPadding + "," + (SVGheight - bottomPadding) + ")"
	)
	.attr("id", "x-axis")
	.call(xAxis);
svg.append("g")
	.attr("transform", "translate(" + leftPadding + ", " + topPadding + ")")
	.attr("id", "y-axis")
	.call(yAxis);
svg.append("rect")
	.attr("x", SVGwidth - rightPadding - legendWidth - legendHeight - 5 + "px")
	.attr("y", 4 + "px")
	.attr("fill", "red")
	.attr("width", legendHeight - 4 + "px")
	.attr("height", legendHeight - 4 + "px");
svg.append("text")
	.attr("id", "legend")
	.attr("x", SVGwidth - rightPadding - legendWidth + "px")
	.attr("y", legendHeight + "px")
	.attr("font-size", legendHeight + "px")
	.attr("fill", "red")
	.text("Riders with doping allegations");
svg.append("rect")
	.attr("x", SVGwidth - rightPadding - legendWidth - legendHeight - 5 + "px")
	.attr("y", 4 + legendHeight + "px")
	.attr("fill", "green")
	.attr("width", legendHeight - 4 + "px")
	.attr("height", legendHeight - 4 + "px");
svg.append("text")
	.attr("id", "legend")
	.attr("x", SVGwidth - rightPadding - legendWidth + "px")
	.attr("y", legendHeight * 2 + "px")
	.attr("font-size", legendHeight + "px")
	.attr("fill", "green")
	.text("Riders without doping allegations");
