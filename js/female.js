        var fullwidthF = 800,
            fullheightF = 300;

        var marginF = {top: 20, right: 100, bottom: 30, left: 60},
            widthF = fullwidthF - marginF.left - marginF.right,
            heightF = fullheightF - marginF.top - marginF.bottom;

        var svg1 = d3.select("#female #chart1").append("svg")
                .attr("width", fullwidthF )
                .attr("height", fullheightF)
                .append("g")
                .attr("transform", "translate(" + marginF.left + "," + marginF.top + ")");

        var xScaleF = d3.scaleTime().range([0, widthF]),
            yScaleF = d3.scaleLinear().range([heightF, 0]);
            // xScaleF = d3.scaleLinear().range([height, 0]);

        var colorScale = d3.scaleOrdinal(d3.schemeCategory20b); 

        var xAxisF = d3.axisBottom(xScaleF),
            yAxisF = d3.axisLeft(yScaleF).ticks(6);

        var formatDate = d3.timeFormat("Year %Y"),
            parseDate = d3.timeParse("Year %Y");

        var areaFemale = d3.area()
                .curve(d3.curveCardinal)
                .x( d => xScaleF(parseDate(d.data.Year)) )
                .y0( d => yScaleF(d[0]) )
                .y1( d => yScaleF(d[1]) );

        d3.csv("./data/unemployment_youth_famale.csv", function(error, data) {

            if (error) { console.log(error); };

            console.log(data)

            var dataset =  d3.nest()
                .key(d => d.Year ).sortKeys(d3.ascending)
                .rollup(function(d) { 
                    return d.reduce(function(prev, curr) {
                      prev["Year"] = curr["Year"];
                      prev[curr["Country"]] = curr["unemployment_rate"];
                      return prev;
                    }, {});
                })
                .entries(data)
                .map( d => d.value );

            console.log(dataset)


            var country = ["China","Russian Federation","India","Brazil","South_Africa"]

            var stack = d3.stack()
                .keys(country)
                .order(d3.stackOrderNone)
                .offset(d3.stackOffsetNone)

            var stackStream = d3.stack()
                .keys(country)
                .order(d3.stackOrderInsideOut)
                .offset(d3.stackOffsetSilhouette);

            var layers = stack(dataset),
                layersStream = stackStream(dataset);

            let maxY = d3.max(dataset, (d, i) => {
                let vals = d3.keys(d).map((key) => key !== 'Year' ? d[key] : 0 );  
                return d3.sum(vals);
            });

            let maxY2 = maxY / 2;

            xScaleF.domain(d3.extent(data, d => parseDate(d.Year) ));
            yScaleF.domain([0, maxY]); 

            console.log(layers);
            console.log(layersStream);

            svg1.selectAll(".layer")
                .data(layers) 
                .enter()
                .append("path")
                .attr("class", "layer")
                .attr('d', areaFemale) 
                .style("fill", d => colorScale(d.key) ) 
                .append("title")
                .text( d => d.key);

            svg1.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0," + heightF + ")")
                .call(xAxisF);

            svg1.append("g")
                .attr("class", "y axis")
                .call(yAxisF);

            const renderChart = (data) => {
                svg1.selectAll(".layer")
                    .data(data) 
                    .transition()
                    .duration(1000)
                    .attr("d", areaFemale)

                svg1.select(".y axis").call(yAxisF)
            }

            d3.selectAll(".btn")
                .on("click", function() {
                    v = d3.select(this).attr("id");
                    chartData = v === "btn1" ? layers : layersStream;
                    v === "btn1" ? yScaleF.domain([0, maxY]) : yScaleF.domain([-maxY2, maxY2]); 
                    renderChart(chartData);
                })

        });