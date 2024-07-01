const width = document.getElementById("container").clientWidth;
const height = document.getElementById("container").clientHeight;

const svg = d3.create("svg")
    .attr("width", "100%")
    .attr("height", "100%")
    .attr("viewBox", `0 0 ${document.getElementById("container").clientWidth} ${document.getElementById("container").clientHeight}`)
    .attr("xmlns", "http://www.w3.org/2000/svg");

const projection = d3.geoOrthographic().translate([width/2, height/2])
const path = d3.geoPath(projection)

const zoom = d3.zoom()
    .scaleExtent([1, 6])
    .filter((event)=>{
        console.log(event.type)
        return event.type === "wheel" || event.type === "dblclick"
    })
    .on("zoom", zoomed);


let g;
let circle;

// const drag = d3.drag().on("drag", dragged);

  const drag = d3.drag().subject(function() {
    const r = projection.rotate();
    console.log("rotation0", r)
    return { x: r[0], y: -r[1],z:r[2]};
  }).on("drag", dragged);


function dragged(event) {
    console.log(event)
    var rotation=projection.rotate();
    console.log("rotation1", rotation)
    const lambda = event.x;
    const phi = -event.y;
    projection.rotate([lambda, phi, rotation[2]]); 
    console.log("rotation2",projection.rotate())
//   console.log("THERE",projection.rotate())
  svg.selectAll("path").attr("d", path);
}

function zoomed(event) {
    // const {transform} = event;
    const {transform} = event;
    console.log(event)
   
        circle.attr("transform", transform)
        g.attr("transform", transform);
//         
    }


// Fetch data asynchronously
// fetch("https://cdn.jsdelivr.net/npm/us-atlas@3/counties-albers-10m.json")
fetch("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json")
// fetch("https://cdn.jsdelivr.net/npm/us-atlas@3/counties-10m.json")
    .then(response => response.json())
    .then(data => {

        g=svg.append('g')
        g
            .attr("fill", "#444")
            .attr("cursor", "pointer")
            .selectAll("path")
            // .data(data.features)
            .data(topojson.feature(data, data.objects.countries).features)
            .join("path")
            .attr("d", path);
        const point = { type: "Point", coordinates: [2.3522, 48.8566] }; // Example: Paris

        // Convert the coordinates to the SVG coordinates
        const [x, y] = projection(point.coordinates);
    
        // Draw the point
        circle=svg.append('circle')
        circle
            .attr('cx', x)
            .attr('cy', y)
            .attr('r', 5)
            .attr('class', 'point')
            .on('click', () => {
            alert('Point clicked!');
            });
        svg.call(zoom).call(drag)
    })



// Append the SVG element to container
document.getElementById("container").append(svg.node());

