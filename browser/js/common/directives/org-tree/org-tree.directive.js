app.directive('orgTree', function() {
    return {
        restrict: 'E',
        template: '<div id="org-tree"></div>',
        scope: {
            'orgJson': '='
        },
        link: function(scope, elem, attrs) {
            var margin = { top: 20, right: 35, bottom: 20, left: 35 },
                width = 660 - margin.right - margin.left,
                height = 600 - margin.top - margin.bottom;

            var i = 0,
                duration = 750,
                root;

            var tree = d3.layout.tree()
                .size([height, width]);

            var diagonal = d3.svg.diagonal()
                .projection(function(d) {
                    return [d.x, d.y];
                });

            var svg = d3.select(elem[0]).append("svg")
                .attr("width", width + margin.right + margin.left)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

            if (scope.orgJson) {
                root = scope.orgJson;
                root.x0 = height / 2;
                root.y0 = 0;

                function collapse(d) {
                    if (d.children) {
                        d._children = d.children;
                        d._children.forEach(collapse);
                        d.children = null;
                    }
                }

                root.children.forEach(collapse);
                update(root);
            }

            d3.select(self.frameElement).style("height", "800px");

            function update(source) {

                // Compute the new tree layout.
                var nodes = tree.nodes(root).reverse(),
                    links = tree.links(nodes);

                // Normalize for fixed-depth.
                nodes.forEach(function(d) { d.y = d.depth * 100; });

                // Update the nodes…
                var node = svg.selectAll("g.node")
                    .data(nodes, function(d) {
                        return d.id || (d.id = ++i);
                    });

                // Enter any new nodes at the parent's previous position.
                var nodeEnter = node.enter().append("g")
                    .attr("class", "node")
                    .attr("id", function(d) {
                        return 'node' + d.id
                    })
                    .attr("transform", function(d) {
                        return "translate(" + source.x0 + "," + source.y0 + ")";
                    })
                    .on("click", click)

                var defs = nodeEnter.append("defs")
                    .attr('id', function(d) {
                        return d.id + 'def'
                    });

                var pattern = defs.append("pattern")
                    .attr("id", function(d) {
                        return d.id
                    })
                    .attr("x", 0)
                    .attr("y", 0)
                    .attr("height", 1)
                    .attr("width", 1);

                pattern.append("image")
                    .attr("xlink:href", function(d) {
                        return d.photoUrl
                    })
                    .attr("height", 40)
                    .attr("width", 40);

                nodeEnter.append("circle")
                    .attr("r", 1e-6)
                    .style("fill", function(d) {
                        return 'url(organization#' + d.id + ')'
                    })

                // Transition nodes to their new position.
                var nodeUpdate = node.transition()
                    .duration(duration)
                    .attr("transform", function(d) {
                        return "translate(" + d.x + "," + d.y + ")";
                    });

                nodeUpdate.select("circle")
                    .attr("r", 20)
                    .style("fill", function(d) {
                        return 'url(organization#' + d.id + ')'
                    })

                nodeUpdate.select("text")
                    .style("fill-opacity", 1);

                // Transition exiting nodes to the parent's new position.
                var nodeExit = node.exit().transition()
                    .duration(duration)
                    .attr("transform", function(d) {
                        return "translate(" + source.x + "," + source.y + ")";
                    })
                    .remove();

                nodeExit.select("circle")
                    .attr("r", 1e-6);

                nodeExit.select("text")
                    .style("fill-opacity", 1e-6);

                // Update the links…
                var link = svg.selectAll("path.link")
                    .data(links, function(d) {
                        return d.target.id;
                    });

                // Enter any new links at the parent's previous position.
                link.enter().insert("path", "g")
                    .attr("class", "link")
                    .attr("d", function(d) {
                        var o = { x: source.x0 - 10, y: source.y0 - 10 };
                        return diagonal({ source: o, target: o });
                    });

                // Transition links to their new position.
                link.transition()
                    .duration(duration)
                    .attr("d", diagonal);

                // Transition exiting nodes to the parent's new position.
                link.exit().transition()
                    .duration(duration)
                    .attr("d", function(d) {
                        var o = { x: source.x, y: source.y };
                        return diagonal({ source: o, target: o });
                    })
                    .remove();

                // Stash the old positions for transition.
                nodes.forEach(function(d) {
                    d.x0 = d.x;
                    d.y0 = d.y;
                });

                svg.selectAll('circle')
                    .on('mouseover', handleMouseover)
                    .on('mouseout', handleMouseout)
            }

            // Toggle children on click.
            function click(d) {
                if (d.children) {
                    d._children = d.children;
                    d.children = null;
                } else {
                    d.children = d._children;
                    d._children = null;
                }
                update(d);
            }

            function handleMouseover(d, i) {
                d3.select('#node' + d.id)
                    .append("text")
                    .attr("id", 'text' + d.id)
                    .append("tspan")
                    .text(function(d) {
                        return d.first_name + ' ' + d.last_name
                    })
                    .attr("x", 15)
                    .attr("y", 30)
                    .append("tspan")
                    .text(function(d) {
                        return d.email
                    })
                    .attr("dy", 10)
                    .attr("y", 30)
                    .attr("x", 15);
            }

            function handleMouseout(d, i) {
                d3.select('#text' + d.id).remove();
            }

        }
    }
})
