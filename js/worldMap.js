let width = 1000, 
    height = 424.5,
    defaultFill = "#eee";

const ticks = [0, 10, 20, 30, 40, 50, 60];
let min = d3.min(ticks),
    max = d3.max(ticks);

const color = d3.scaleSequential(d3.interpolateSpectral).domain([min, max]);

const projection = d3.geoEqualEarth()
        .rotate([-10, 0])
        .fitExtent([[1, 1], [width - 1, height - 51]], { type: "Sphere" })
        .precision(0.1);


const format = (d, y) => `${d["CountryName"]}: ${Math.round(+d[y])}`

const chart = (world, rate) => {
    const path = d3.geoPath();

    path.projection(projection);

    let year = $("input").val()

    const x = d3.scaleLinear()
                    .domain(d3.extent(color.domain()))
                    .rangeRound([width / 2 - 120, width / 2 + 120]);
    
    const svg = d3.select("#world #chart4").append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")

    const defs = svg.append("defs");

    const g = svg.append("g").attr("transform", `translate(0, ${height - 30})`);

    const linerGradient = defs
                .append("linearGradient")
                .attr("id", "linear-gradient")

    linerGradient.selectAll("stop")
            .data(
                ticks.map((t, i, n) => ({
                    offset: `${(100 * i) / n.length}%`, 
                    color: color(t)
                }))
            )
            .enter()
            .append("stop")
            .attr("offset", d => d.offset)
            .attr("stop-color", d => d.color);

    g.append("rect")
        .attr("height", 8)
        .attr("x", x(min))
        .attr("width", x(max) - x(min))
        .style("fill", `url(${location}#linear-gradient)`)

    g.append("text")
        .attr("class", "caption")
        .attr("x", x.range()[0])
        .attr("y", -6)
        .attr("fill", "#000")
        .attr("text-anchor", "start")
        .attr("font-weight", "bold")
        .text(`Birth Rate in ${year} (years)`);

    g.call(
        d3.axisBottom(x)
            .tickSize(13)
            .tickValues(ticks)
    )
        .select(".domain").remove();

    svg
        .append("g")
        .selectAll("path")
        .data(topojson.feature(world, world.objects.units).features)
        .enter()
        .append("path")
        .attr("class", "show")
        .attr("fill", d => 
            rate.has(d.id) && rate.get(d.id)[year]
                ? color(+rate.get(d.id)[year])
                : defaultFill
        )
        .attr("d", path)
        .append("title")
        .text(d => 
            rate.has(d.id) && rate.get(d.id)[year]
                ? format(rate.get(d.id), year)
                : "unknown"
            )

    svg
        .append("path")
        .datum(topojson.mesh(world, world.objects.units, (a, b) => a !== b))
        .attr("fill", "none")
        .attr("stroke", "white")
        .attr("stroke-linejoin", "round")
        .attr("d", path);

    svg
        .append("path")
        .datum({ type: "Sphere" })
        .attr("fill", "none")
        .attr("stroke", "#ccc")
        .attr("stroke-linejoin", "round")
        .attr("d", path);

    return svg.node();
}

async function load() {
    let [world, codes] = await Promise.all([
        d3.json("../data/countries.json"),
        d3.csv("../data/IMR.csv")
    ]);
    console.log(world)
    console.log(codes)
    console.log(topojson.feature(world, world.objects.units).features)

    let dataset = codes.map(d => [d["CountryCode"], d]);
    let rate = new Map(dataset);            

    // console.log(dataset);
  
    chart(world, rate);

    d3.select("input")
        .on("change", function() {
            slideButton(world, rate);
        })
}






const slideButton = (world, rate) => {
    let year = $("input").val()
    $("span").text(year)

    d3.selectAll("path")
        .data(topojson.feature(world, world.objects.units).features)
        .attr("fill", d =>
            rate.has(d.id) && rate.get(d.id)[year]
                ? color(+rate.get(d.id)[year])
                : defaultFill
        )

    d3.selectAll("title")
        .data(topojson.feature(world, world.objects.units).features)
        .text(d =>
            rate.has(d.id) && rate.get(d.id)[year]
                ? format(rate.get(d.id), year)
                : "unknown"
        )

    d3.select("text.caption")
        .text(`Birth Rate in ${year} (years)`);

}

load();