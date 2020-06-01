// @TODO: YOUR CODE HERE!
var svgWidth = 960;
var svgHeight = 500;

var margin = {
    top: 20,
    right: 40,
    bottom: 80,
    left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold the scatter plot,
// and shift the latter by left and top margins.
var svg = d3.select("#scatter")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

// Append an SVG group
var chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Params
var chosenXAxis = "poverty";
var chosenYAxis = "obesity";

// function used for updating x-scale var upon click on axis label
function xScale(censusdata, chosenXAxis) {
    var xLinearScale = d3.scaleLinear()
        .domain([d3.min(censusdata, d => d[chosenXAxis]) * 0.8,
            d3.max(censusdata, d => d[chosenXAxis]) * 1.2])
        .range([0, width]);
    
    return xLinearScale;
}

// function used for updating y-scale var upon click on axis label
function yScale(censusdata, chosenYAxis) {
    var yLinearScale = d3.scaleLinear()
        .domain([d3.min(censusdata, d => d[chosenYAxis]) * 0.8,
            d3.max(censusdata, d => d[chosenYAxis]) * 1.2])
        .range([height, 0]);
    
    return yLinearScale;
}

// function used for updating axes vars upon click on axis label
function renderAxes(newXScale, xAxis, newYScale, yAxis) {
    var bottomAxis = d3.axisBottom(newXScale);
    var leftAxis = d3.axisLeft(newYScale);

    xAxis.transition()
        .duration(1000)
        .call(bottomAxis);
    
    yAxis.transition()
        .duration(1000)
        .call(leftAxis);
    
    return xAxis, yAxis;
}

// functions used for updating circles group with a transition to
// new circles
function renderCircles(circlesGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {
    circlesGroup.transition()
        .duration(1000)
        .attr("cx", d => newXScale(d[chosenXAxis]))
        .attr("cy", d => newYScale(d[chosenYAxis]));
    
    return circlesGroup;
}

// function used for updating cirle labels with a transition to
// new circles
function renderCircleLabels(circleLabelsGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {
    circleLabelsGroup.transition()
        .duration(1000)
        .attr("x", d => newXScale(d[chosenXAxis]))
        .attr("y", d => newYScale(d[chosenYAxis])+3);

    return circleLabelsGroup;
}

// function used for updating cirlces group with new tooltip
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {
    var xlabel;
    var ylabel;
    var xUnit;
    var yUnit = "%";

    if (chosenXAxis === "poverty") {
        xlabel = "Poverty:";
        xUnit = "%"
    }
    else if(chosenXAxis === "age") {
        xlabel = "Age:";
        xUnit = " years";
    }
    else {
        xlabel = "Income:";
        xUnit = " USD";
    }

    if (chosenYAxis === "obesity") {
        ylabel = "Obesity:";
    }
    else if(chosenYAxis === "smokes") {
        ylabel = "Smokes:";
    }
    else {
        ylabel = "Lacks Healthcare:";
    }

    var tooltip = d3.tip()
        .attr("class", "tooltip d3-tip")
        .offset([80, -60])
        .html(function(d) {
            return (`${d.state}<br>${xlabel} ${d[chosenXAxis]}${xUnit}
                <br>${ylabel} ${d[chosenYAxis]}${yUnit}`);
        });
    
    circlesGroup.call(tooltip);

    circlesGroup.on("mouseover", function(data) {
        tooltip.show(data);
    })
        .on("mouseout", function(data, index) {
            tooltip.hide(data);
        });
    
    return circlesGroup;
}

// function used to update actived axis label
function activateLabel(activeLabel) {
    return activeLabel
        .classed("active", true)
        .classed("inactive", false);
}

// function used to update deactivated axis
function deactivateLabel(deactiveLabel) {
    return deactiveLabel
        .classed("inactive", true)
        .classed("active", false);
}

// Retrieve data from the CSV file and execute everything below
(async function(){
    var censusdata = await d3.csv("assets/data/data.csv").catch(function(error) {
        console.log(error);
    })

    //parse data
    censusdata.forEach(function(data) {
        data.poverty = +data.poverty;
        data.age = +data.age;
        data.income = +data.income;
        data.healthcare = +data.healthcare; 
        data.obesity = +data.obesity;
        data.smokes = +data.smokes;
    });

    // xLinearScale and yLinearScale functions above csv import
    var xLinearScale = xScale(censusdata, chosenXAxis);
    var yLinearScale = yScale(censusdata, chosenYAxis);

    //Create initial axis functions
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // append x axis
    var xAxis = chartGroup.append("g")
        .classed("x-axis", true)
        .attr("transform", `translate(0, ${height})`)
        .call(bottomAxis);
    
    // append y axis
    var yAxis = chartGroup.append("g")
        .call(leftAxis);
    
    // append initial circles
    var circlesGroup = chartGroup.selectAll(".stateCircle")
        .data(censusdata)
        .enter()
        .append("circle")
        .classed("stateCircle", true)
        .attr("cx", d => xLinearScale(d[chosenXAxis]))
        .attr("cy", d => yLinearScale(d[chosenYAxis]))
        .attr("r", 10)
        //.attr("text", d => d.abbr)
        ;
    
    // append init
    var circleLabelsGroup = chartGroup.selectAll(".stateText")
        .data(censusdata)
        .enter()
        .append("text")
        .classed("stateText", true)
        .attr("x", d => xLinearScale(d[chosenXAxis]))
        .attr("y", d => yLinearScale(d[chosenYAxis])+3)
        .text((d,i) => d.abbr);

    // Create group for three x-axis labels
    var xlabelsGroup = chartGroup.append("g")
        .attr("transform", `translate(${width / 2}, ${height + 20})`);
    
    var povertyLabel = xlabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 20)
        .attr("value", "poverty") // value to grab for event listener
        .classed("active", true)
        .text("In Poverty (%)");
    
    var ageLabel = xlabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 40)
        .attr("value", "age") // value to grab for event listener
        .classed("inactive", true)
        .text("Age (Median)");
    
    var incomeLabel = xlabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 60)
        .attr("value", "income") // value to grab for event listener
        .classed("inactive", true)
        .text("Household Income (Median)");
    
    // Create group for three y-axis labels
    var ylabelsGroup = chartGroup.append("g")
        .attr("transform", "rotate(-90)");
    
    var obesityLabel = ylabelsGroup.append("text")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .attr("value", "obesity")
        .classed("active", true)
        .text("Obese (%)");
    
    var smokesLabel = ylabelsGroup.append("text")
        .attr("y", 20 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .attr("value", "smokes")
        .classed("inactive", true)
        .text("Smokes (%)");
    
    var healthcareLabel = ylabelsGroup.append("text")
        .attr("y", 40 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .attr("value", "healthcare")
        .classed("inactive", true)
        .text("Lacks Healthcare (%)");
    
    // udateToolTip function above csv import
    var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

    // x axis labels event listener
    xlabelsGroup.selectAll("text")
        .on("click", function() {

            // get value of selection
            var value = d3.select(this).attr("value");
            if (value !== chosenXAxis) {
                // replaces chosenXAxis with value
                chosenXAxis = value;
                
                // functions here found above csv import
                // updates x scale for new data
                xLinearScale = xScale(censusdata, chosenXAxis);

                // updates axis with transition
                xAxis, yAxis = renderAxes(xLinearScale, xAxis, yLinearScale, yAxis);

                // updates circles with new x values
                circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

                // updates circle labels with new x values
                circleLabelsGroup = renderCircleLabels(circleLabelsGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

                // updates tooltips with new info
                circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

                // changes classes to change bold text
                if (chosenXAxis === "poverty") {
                    activateLabel(povertyLabel);
                    deactivateLabel(ageLabel);
                    deactivateLabel(incomeLabel);
                }
                else if (chosenXAxis === "age") {
                    activateLabel(ageLabel);
                    deactivateLabel(povertyLabel);
                    deactivateLabel(incomeLabel);
                }
                else {
                    activateLabel(incomeLabel);
                    deactivateLabel(povertyLabel);
                    deactivateLabel(ageLabel);
                }
            }
        })
    
    ylabelsGroup.selectAll("text")
        .on("click", function() {

            // get value of selection
            var value = d3.select(this).attr("value");
            if (value !== chosenYAxis) {
                // replaces chosenXAxis with value
                chosenYAxis = value;
                
                // functions here found above csv import
                // updates y scale for new data
                yLinearScale = yScale(censusdata, chosenYAxis);

                // updates axis with transition
                xAxis, yAxis = renderAxes(xLinearScale, xAxis, yLinearScale, yAxis);

                // updates circles with new x values
                circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

                // updates circle labels with new y values
                circleLabelsGroup = renderCircleLabels(circleLabelsGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

                // updates tooltips with new info
                circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

                // changes classes to change bold text
                if (chosenYAxis === "obesity") {
                    activateLabel(obesityLabel);
                    deactivateLabel(smokesLabel);
                    deactivateLabel(healthcareLabel);
                }
                else if (chosenYAxis === "smokes") {
                    activateLabel(smokesLabel);
                    deactivateLabel(obesityLabel);
                    deactivateLabel(healthcareLabel);
                }
                else {
                    activateLabel(healthcareLabel);
                    deactivateLabel(obesityLabel);
                    deactivateLabel(smokesLabel);
                }
            }
        })
})()