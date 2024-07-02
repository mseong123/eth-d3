const width = document.getElementById("container").clientWidth;
const height = document.getElementById("container").clientHeight;

const svg = d3.create("svg")
    .attr("width", "100%")
    .attr("height", "100%")
    .attr("viewBox", `0 0 ${document.getElementById("container").clientWidth} ${document.getElementById("container").clientHeight}`)
    .attr("xmlns", "http://www.w3.org/2000/svg");


function isVisible(coords) {
    const [lambda, phi] = projection.rotate();
    const rotated = d3.geoRotation([lambda, phi])(coords);
    console.log("coordinates",coords)
    console.log('lambda, phi',lambda, phi)
    console.log("rotated",rotated)
    return rotated[0] >= -90 && rotated[0] <= 90;
    }


const projection = d3.geoOrthographic().translate([width/2, height/2]).clipAngle(90)
const path = d3.geoPath(projection)

const zoom = d3.zoom()
    .scaleExtent([1, 6])
    .filter((event)=>{
        return event.type === "wheel" || event.type === "dblclick"
    })
    .on("zoom", zoomed);



let g;
let circle;
// const point = { type: "Point", coordinates: [2.3522, 48.8566] }; // Example: Paris longtitude/latitude
const point = { type: "Point", coordinates: [-43.1728, -22.9068] }; 

// const point = { type: "Point", coordinates: [103.8198, 1.3521] }; 

    

function zoomToCircle(coordinates) {
    const [x, y] = projection(coordinates);
    const scale = 4; // Example: Zoom in by a factor of 4
    const translate = [width / 2 - x * scale, height / 2 - y * scale];
    svg.transition().duration(750).tween("rotate", function() {
        const r = d3.interpolate(projection.rotate(), [-coordinates[0],-coordinates[1]]);
        return function(t) {
            projection.rotate(r(t));
            svg.selectAll("path").attr("d", path);
            
            circle
            .attr("cx", projection(coordinates)[0])
            .attr("cy", projection(coordinates)[1]);
        }
    })
  }

  const drag = d3.drag().subject(function() {
    const r = projection.rotate();
    return { x: r[0], y: -r[1],z:r[2]};
  }).on("drag", dragged);

  

function dragged(event) {
    var rotation=projection.rotate();
    const lambda = event.x;
    const phi = -event.y;
    projection.rotate([lambda, phi, rotation[2]]); 
  svg.selectAll("path").attr("d", path);
  
  const [x, y] = projection(point.coordinates);
  circle.attr('cx', x)
            .attr('cy', y)
            .attr("class", isVisible(point.coordinates)? "point":"point hidden" )
}

function zoomed(event) {
    // const {transform} = event;
    const {transform} = event;
  const zoomCenterX = width / 2;
  const zoomCenterY = height / 2;
  const zoomScale = event.transform.k; // Example: Zoom to scale 2 
  const newX = width / 2 - zoomCenterX * zoomScale;
  const newY = height / 2 - zoomCenterY * zoomScale; 
transform.x = newX;
transform.y = newY
circle.attr("transform", transform )
    g.attr("transform", transform);
    
}


// Fetch data asynchronously
// fetch("https://cdn.jsdelivr.net/npm/us-atlas@3/counties-albers-10m.json")
fetch("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json")
// fetch("https://cdn.jsdelivr.net/npm/us-atlas@3/counties-10m.json")
    .then(response => response.json())
    .then(data => {
        console.log(topojson.feature(data, data.objects.countries).features)
        g=svg.append('g')
        g.append("path").data({type:"Sphere"})
        g
            .attr("fill", "#444")
            .attr("cursor", "pointer")
            
            .selectAll("path")
            // .data(data.features)
            .data(topojson.feature(data, data.objects.countries).features)
            .join("path")
            .attr("d", path);
        

        // Convert the coordinates to the SVG coordinates
        const [x, y] = projection(point.coordinates);
        // Draw the point
        circle=svg.append('circle')
        circle
            .attr("fill", "red")
            .attr('cx', x)
            .attr('cy', y)
            .attr('r', 5)
            .attr('class', isVisible(point.coordinates)? "point":"point hidden")
            .on('click', (e) => {
                e.stopPropagation();
                zoomToCircle(point.coordinates)
            });
        svg.call(zoom).call(drag)

        
    })



// Append the SVG element to container
document.getElementById("container").append(svg.node());

