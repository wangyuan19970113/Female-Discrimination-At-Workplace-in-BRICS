    var fullwidthM = 250,
        fullheightM = 180;

    var marginM = { top: 50, right: 30, bottom: 20, left: 30 },
        widthM = fullwidthM - marginM.left - marginM.right,
        heightM = fullheightM - marginM.top - marginM.bottom;

console.log(heightM);

    var titleH = -20;

    var parseDateM = d3.timeParse("Year %Y");

    var formatDate = d3.timeFormat("%Y"),
        formatV = d3.format("0.2f")

    var xScaleM = d3.scaleTime().range([0, widthM]),
        yScaleM = d3.scaleLinear().range([heightM, 0]);

    var yAxisM = d3.axisLeft(yScaleM)
        .ticks(2)
        .tickFormat(d3.format("s"));

    var areaMale = d3.area()
            .x(d => xScaleM(d.date) )
            .y0( heightM )
            .y1(d => yScaleM(d.service) );
    
    var line = d3.line()
            .x(d => xScaleM(d.date) )
            .y(d => yScaleM(d.service) );


    d3.csv("./data/employment_in_services_male.csv", typeFix, function (error, data) { //typefix???

        if (error) { console.log(error); };
        
        var countries = d3.nest()
            .key( d => d.Country )
            .sortValues( (a, b) => a.date - b.date )
            .entries(data);

        console.log("countries", countries)

        xScaleM.domain([
            d3.min(countries, d => d.values[0].date ),
            d3.max(countries, d => d.values[d.values.length - 1].date )
        ]);

        yScaleM.domain([0, d3.max(countries, d => d3.max(d.values, d => d.service)) ]);


        // 2. 加data个svg，用d3.each让每一个都执行function multiple
        var svg = d3.select("#male #chart2").selectAll("svg")
            .data(countries)
            .enter().append("svg")
            .attr("width", fullwidthM)
            .attr("height", fullheightM)
            .append("g")
            .attr("transform", "translate(" + marginM.left + "," + marginM.top + ")")
            .each(multiple);

        // 3. function multiple()
        function multiple() {

            var localsvg = d3.select(this); 

            localsvg.append("path")
                .attr("class", "area")
                .attr("d", d => areaMale(d.values));
                

            localsvg.append("path")
                .attr("class", "line")
                .attr("d", d => line(d.values));

            // first date
            localsvg.append("text")
                .attr("class", "label")
                .attr("x", 0)
                .attr("y", heightM + marginM.bottom / 2)
                .style("text-anchor", "start")
                .text( d => formatDate(d.values[0].date) );

            // country name
            localsvg.append("text")
                .attr("class", "label")
                .attr("x", widthM / 2)
                .attr("y", titleH)
                .style("text-anchor", "middle")
                .text( d => d.key);

            // last date
            localsvg.append("text")
                .attr("class", "label")
                .attr("x", widthM)
                .attr("y", heightM + marginM.bottom / 2)
                .style("text-anchor", "end")
                .text( d => formatDate(d.values[d.values.length - 1].date) );

            // last point
            localsvg.append("circle")
                .attr("class", "endpoint")
                .attr("cx", d => xScaleM(d.values[d.values.length - 1].date) )
                .attr("cy", d => yScaleM(d.values[d.values.length - 1].service) )
                .attr("r", 2);

            // last value
            localsvg.append("text")
                .attr("class", "endpoint")
                .attr("x", widthM)
                .attr("y", d => yScaleM(d.values[d.values.length - 1].service))
                .attr("dy", -5)
                .style("text-anchor", "end")
                .text( d => d.values[d.values.length - 1].service );

        }


    })

    function typeFix(d) {
        d.service = formatV(+d.service_male);
        d.date = parseDateM(d.Year);
        return d;
}