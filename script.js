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
    return rotated[0] >= -90 && rotated[0] <= 90;
    }


const projection = d3.geoOrthographic().translate([width/2, height/2]).clipAngle(90).scale(350)
const path = d3.geoPath(projection)

const zoom = d3.zoom()
    .scaleExtent([1, 6])
    .filter((event)=>{
        return event.type === "wheel" || event.type === "dblclick"
    })
    .on("zoom", zoomed).on("end", zoomEnded);



let g;
let circle;
let water;
const point = { country: "France", coordinates: [2.3522, 48.8566], 
    children:[
        {location:"Paris",coordinates:[2.2137,46.2276]} ,
        {location:"Scotland", coordinates:[-3.1883,55.9533]},
        {location:"Berlin", coordinates:[13.4050,52.5200]}
    ]}; //longtitude/latitude
// const point = { country: "Brazil", coordinates: [-43.1728, -22.9068],  };//rio de janeiro 
// const point = { type: "Point", coordinates: [103.8198, 1.3521] }; //singapore

    

function zoomToCircle(coordinates) {
    svg.transition().duration(750).tween("rotate", function() {
        const r = d3.interpolate(projection.rotate(), [-coordinates[0],-coordinates[1]]);
        return function(t) {
            projection.rotate(r(t));
            svg.selectAll("path").attr("d", path);
            circle.selectAll("circle")
            .attr("cx", d=>projection(d.coordinates)[0])
            .attr("cy", d=>projection(d.coordinates)[1]);
            
           
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
  circle.selectAll("circle").attr('cx', x)
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
transform.y = newY;
    circle.attr("transform", transform )
    g.attr("transform", transform);
    water.attr("transform", transform)
    
}

function zoomEnded(event) {
    if (event.transform.k >= 2 && circle.selectAll("circle").size() != 3) {

    
    let circle1 = circle.select("circle").clone(true).datum(d=>d.children[1]).attr("class", "circle1").on('click', function(e,d) {
        e.stopPropagation();
        zoomToCircle(d.coordinates)
    });
    let circle2 = circle.select("circle").clone(true).datum(d=>d.children[2]).attr("class", "circle2").on('click', function(e,d) {
        e.stopPropagation();
        zoomToCircle(d.coordinates)
    });
    circle.select("circle").datum(d=>d.children[0])
    
    circle.select("circle").transition().duration(750)
    .attr("cx",d=>projection(d.coordinates)[0])
    .attr("cy",d=>projection(d.coordinates)[1])
    
    .attr("r", 7)
    .attr("fill", "yellow")
    circle1.transition().duration(750)
    .attr("cx",d=>projection(d.coordinates)[0])
    .attr("cy",d=>projection(d.coordinates)[1])
    .attr("r", 7)
    .attr("fill", "yellow")
    
    circle2.transition().duration(750)
    .attr("cx",d=>projection(d.coordinates)[0])
    .attr("cy",d=>projection(d.coordinates)[1])
    .attr("r", 7)
    .attr("fill", "yellow")
    
    circle.append(()=>circle1.node())
    circle.append(()=>circle2.node())
    }
    else if (event.transform.k < 2 && circle.selectAll("circle").size() == 3) {
        circle.selectAll("circle").transition().duration(750)
        .attr("cx",d=>projection(point.coordinates)[0])
        .attr("cy",d=>projection(point.coordinates)[1])
        .attr("r", 15)
        .attr("fill", "red").on("end", function(){
            let childNodes = this.parentNode.childNodes;
            if(this===childNodes[1] || this ===childNodes[2])
                d3.select(this).remove()
        })
        circle.select("circle").datum(point)

    }
}


// Fetch data asynchronously
// fetch("https://cdn.jsdelivr.net/npm/us-atlas@3/counties-albers-10m.json")
fetch("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json")
// fetch("https://cdn.jsdelivr.net/npm/us-atlas@3/counties-10m.json")
    .then(response => response.json())
    .then(data => {
        console.log(topojson.feature(data, data.objects.countries).features)
        water=svg.append("path")
        water.datum({type:"Sphere"}).attr("d", path).attr("fill", "#40E0D0")
        g=svg.append('g')
        g
            .attr("fill", "#444")
            .attr("cursor", "pointer")
            
            .selectAll("path")
            .data(topojson.feature(data, data.objects.countries).features)
            .join("path")
            .attr("d", path);
        

        // Convert the coordinates to the SVG coordinates
        const [x, y] = projection(point.coordinates);
        // Draw the point
        circle=svg.append('g').attr("class", "circle")        
        circle.append("circle")
            .attr("fill", "red")
            .datum(point)
            .text("Europe")
            .attr('cx', d=>projection(d.coordinates)[0])
            .attr('cy', d=>projection(d.coordinates)[1])
            .attr('r',15)
            .attr('class',function(d){return isVisible(d.coordinates)? "point": "point hidden"})
            .on('click', function(e,d) {
                e.stopPropagation();
                zoomToCircle(d.coordinates)
            }); 
        svg.call(zoom).call(drag)

        
    })



// Append the SVG element to container
document.getElementById("container").append(svg.node());

