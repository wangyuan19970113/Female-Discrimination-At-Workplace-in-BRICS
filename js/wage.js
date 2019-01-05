        var fullWidthW = 900;
		var fullHeightW = 500;
		var marginW = {top:30, right:10, bottom:120, left:30};  

		var widthW = fullWidthW - marginW.left - marginW.right;
		var heightW = fullHeightW - marginW.top - marginW.bottom;
		
        var svg = d3.select("#chart3")
                    .append("svg")
                    .attr("width", fullWidthW)
                    .attr("height", fullHeightW);

        var g = svg.append("g")
                    .attr("transform", "translate(" + marginW.left + "," + marginW.top + ")");

        var xScaleW = d3.scaleBand()
                       .range([0, widthW])
                       .padding(0.5); 

        var yScaleW = d3.scaleLinear()
                       .range([heightW, 0]);

        
        var xAxisW = d3.axisBottom(xScaleW).tickSize(0); 
        var yAxisW = d3.axisLeft(yScaleW)
        			.tickFormat(function(d) {
        							return d + "%";
        						});
           
        d3.csv("./data/wage_and_salaried_workers_female(of_all_female_employment).csv", function(error,data) {

            if (error) throw error; 

            console.log("original", data)

           
            data.forEach(function(d){
                d.female = + d.female;

            })

            data.sort(function(a,b){ return a.female - b.female; })
            
            function noZero(d){ return d.female != 0; }
            data = data.filter(noZero)

            xScaleW.domain(data.map(function(d) {return d.Country;}));
            yScaleW.domain([0, d3.max(data, function(d) {return d.female;})]);

            var rects = g.append("g")
                .attr("class", "bars")
                .selectAll("rect.bar")
                .data(data)
                .enter()
                .append("rect")
                .attr("class", "bar");

            rects
                .attr("x", function(d) { return xScaleW(d.Country);})
                .attr("y", function(d) { return yScaleW(d.female);})
                .attr("width", xScaleW.bandwidth())
                .attr("height", function(d) {
                    return heightW - yScaleW(d.female);
                })
                .append("title")
                .text(function(d) {
                    return d.Country + "'s 2017 rate is " + d.female + " % ";
                });

            g.append("g")
                .attr("class", "x-axis")
                .attr("transform", "translate(0," + heightW + ")")
                .call(xAxisW)
                .selectAll("text")
                .attr("dy", ".85em")  
                .attr("transform", "rotate(-45)")
                .style("text-anchor", "end")
                .style("font-size","20px")                    

            g.append("g")
                .attr("class", "y-axis")
                .call(yAxisW)
                
            svg.append("text")
                .attr("class", "yTitle")
                .attr("transform", "translate(" + marginW.left + " ," + marginW.top + ")")
                .style("text-anchor", "middle")
                .attr("dy", "-10")
                .text("Percent")
         });

		