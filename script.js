var width = 900, // canvas width
    height = 600; 
var color = d3.scale.category10();

// create a new directed graph
// force layout
var force = d3.layout.force() 
    .gravity(.05)
    .distance(100)
    .charge(-100)
    .size([width, height]);

// create the SVG element inside the <body>
var svg = d3.select("body").append("svg") 
    .attr("width", width)
    .attr("height", height);

// deep clone
function clone(obj) { 
    if (null == obj || "object" != typeof obj) return obj; // handle null and undefined
    var copy = obj.constructor(); // handle Date
    for (var attr in obj) { // copy all attributes from obj
    if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
    }
    return copy;
}
// load the data
d3.json("karate_club.json", function(error, graph) { 
    // error handling
    if (error) throw error; 
    
    force // create the layout
    .nodes(graph.nodes)
    .links(graph.links)
    .start();
    
    var drag = d3.behavior.drag() // drag behavior
    .origin(function(d) { return d; }) // allow the user to drag the node
    .on("dragstart", function (d) { 
        d3.event.sourceEvent.stopPropagation(); 
        force.start(); // start the force layout
    })
    .on("drag", function (d) { // drag the node
        d3.select(this).attr("cx", d.x = d3.event.x) // move the node
        .attr("cy", d.y = d3.event.y);
    })
    .on("dragend", function(d) {}); // end the force layout
    
    var container = svg.append("g"); // create a group to hold the nodes
    
    var link = container.append("g") // create a group for the links
    .attr("class", "links") // class for the links
    .selectAll(".link") // select all the links
    .data(graph.links) // bind the links to the data
    .enter().append("line") // append a line for each link
        .attr("class", "link"); // class for the links
    
    var node = container.append("g") // create a group for the nodes
    .attr("class", "nodes")
    .selectAll(".node")
    .data(graph.nodes)
    .enter().append("g")
        .call(drag);
    
    node.append("circle") // append a circle for each node
    .attr("class", "node") 
    .attr("r", function(d) { // radius of the circle
        if(d.id == 0 || d.id == 33) return 30 // special case for the two nodes
        else return 20 // for all other nodes
    })
    .style("stroke-width", function(d) { // stroke width of the circle
        if(d.id == 0 || d.id == 33) return 3
    });
    
    node.append("text") // append text for each node
    .attr("class", "label")
    .text(function(d) {  // text for each node
        if(d.id == 0) return "Mr. Hi"
        if(d.id == 33) return "John A"
        else return d.id 
    })
    
    force.on("tick", function() { // tick event
    link.attr("x1", function(d) { return d.source.x; }) 
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });
    
    node.attr("transform", function(d) { // move the node
        return "translate(" + d.x + "," + d.y + ")" // translate the node
    });
    });
    
    var linksRemoved = [] // array to hold the links removed
    d3.select("#btnSplit").on("click", function() { // split button
    btn = d3.select(this) // get the button
    
    node.transition().selectAll(".node") // select all the nodes
        .style("fill", function(d) { // change the color of the nodes
        if(btn.text() == "Split") { // if the button is split
        linksRemoved = [] // empty the linksRemoved array
        // remove the links
        link.each(function(d, i) { 
            if(d.source.club !== d.target.club) {
            linksRemoved.push((link[0][i]))
            link[0][i].remove()
            force.start()
            }
        })
        
        return color(d.club) 
        } else { // if the button is merge
        t = container.transition() // create a transition
        linksRemoved.forEach(function(l) { 
            l = d3.select(l)
            t.select(".links").node()
                .appendChild(l.node())
        })
        force.start()
        
        return ""
        }
    })
    
    if(btn.text() == "Split") { // if the button is split
        btn.text("Reset") // change the button text
    } else {
        btn.text("Split")
    }
    })
})
