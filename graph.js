
function generate_graph(json_file) {
  $.ajaxSetup({
    async: false
  });
  
  var graphJson = null;
  var maxWeight = 0;
  var color = d3.interpolateReds;
  var G = new jsnx.DiGraph();

  $.getJSON(json_file, function(json) {
    graphJson = json;
  });

  var i = 0;
  graphJson.nodes.forEach(function(element)
  {
    element.color = '#0099ff';

    if(element.weight > maxWeight) {
      maxWeight = element.weight;
    }

    G.addNode([i], element);
    i = i + 1;
  });

  graphJson.links.forEach(function(link) {

    let sourceId = link.source;
    let targetId = link.target;
    let sourceNode = null;
    let targetNode = null;

    G.nodes().forEach(function(node) {

      let currentNode = G.node.get([node]);

      if( currentNode.id === sourceId ) {
        sourceNode = node;
      }
      else if( currentNode.id === targetId ) {
        targetNode = node;
      }
    });

    G.addEdge(sourceNode, targetNode);
    sourceNode = null;
    targetNode = null;

  });

  jsnx.draw(G, {
      element: '#canvas',
      layoutAttr: {
          charge: -120,
          linkDistance: 100
      },
      nodeAttr: {
          r: 8,
          title: function(d) {return d.data.id;},
          id: function(d) {
              return 'node-' + d.node; // assign unique ID
          }
      },
      nodeStyle: {
          fill: function(d) {
            if(d.data.type === 'trope') {
              return color(d.data.weight / maxWeight)
            }
            else {
              return '#e65c00';
            }
          },
          stroke: 'none'
      },
      edgeStyle: {
          fill: '#999'
      }
  }, true);

  // helper method to find and style SVG node elements
  function highlight_nodes(nodes) {
      nodes.forEach(function(n) {
          d3.select('#node-' + n).style('fill', function(d) {
              let nodeColor = d.data.color;

              if(nodeColor !== '#4db8ff')
              {
                nodeColor = '#4db8ff';
              }
              else {
                if(d.data.type === 'trope') {
                  nodeColor = color(d.data.weight / maxWeight)
                }
                else {
                  nodeColor = '#e65c00';
                }
              }
              d.data.color = nodeColor;
              return nodeColor;
          });
      });
  }

  // bind event handlers
  d3.selectAll('.node').on('click', function(d) {
      let htmlString = "";
      htmlString += d.data.id;

      if(d.G.node.get(d.node).type === 'trope') {
        console.log(d.G.degree(d.node));
        htmlString += " <a href=\"" + (d.G.node.get(d.node).site) + "\" target=\"_blank\">" + "TvTropes Link" + "</a>";
      }
      else {
        htmlString += "<br />";
        htmlString += "<ul>";
        d.G.neighbors(d.node).forEach(function(node) {
          htmlString += "<li>"
          htmlString += "<a href=\"" + (d.G.node.get(node).site) + "\" target=\"_blank\">" + (d.G.node.get(node).id) + "</a>"
          htmlString += "</li>";
        });
        htmlString += "</ul>";
      }

      $('#current_node').html( htmlString );
  });

  d3.selectAll('.node').on('mouseover', function(d) {
      highlight_nodes(d.G.neighbors(d.node).concat(d.node));
  });

  d3.selectAll('.node').on('mouseout', function(d) {
      highlight_nodes(d.G.neighbors(d.node).concat(d.node));
  });
}
