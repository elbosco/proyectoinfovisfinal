// Definimos las típicas constantes
// Use el geojson de la ayudantia 9 para mi mapa (ya que lo queriamos usar para ir probando nuestro codigo, pero luego no nos alcanzo el tiempo de reemplazarlo)
// Use el codigo de la ayudantia 9 y clase 21, como plantilla, para hacer mi mapa funcional:
const WIDTH = 1000;
const HEIGHT = 700;
const margin = {
  top: 20,
  right: 50,
  bottom: 20,
  left: 50
}

const width = WIDTH - margin.left - margin.right;
const height = HEIGHT - margin.top - margin.bottom;

// VISUALIZACION 1

function crearMapa(datosMapas, datosDeportistas, seleccionado = "Total Deportistas", selectedYear = 1896) {
    //Plantilla de la ayudantia 9 y clase 21 
    // para evitar duplicación: 
    d3.select("svg").remove()
    const svg = d3
    .select("#vis-1")
    .append("svg")
    .attr("width", WIDTH)
    .attr("height", HEIGHT)
    
    //El manejador del zoom es gracias a la clase 17 de zoom y panning:

    const manejadorZoom = (evento) => {
    const transformacion = evento.transform
    contenedorMapa.attr("transform", transformacion)
    };

    const zoom = d3.zoom()
        .scaleExtent([1, 8])
        .extent([[0, 0], [WIDTH, HEIGHT]])
        .translateExtent([[0, 0], [WIDTH, HEIGHT]])
        .on("zoom", manejadorZoom);

    svg.call(zoom);

    const contenedorMapa = svg
        .append("g")
        .attr("id", "contenedorMapa")
        .attr("transform", `translate(${margin.left}, ${margin.top})`)
    
    const datosDeportistasYear = (selectedYear === "all") ? datosDeportistas : datosDeportistas.filter(d => +d.Year === +selectedYear);
    // Las condiciones las fui trabajando poco a poco con ayuda de ChatGPT
    if (seleccionado === "Total Deportistas") {
        const datosAgrupados = d3.group(datosDeportistasYear, d => d.Team)
        datosDeporte = Array.from(datosAgrupados, ([Team, datos]) => ({
            Team,
            cantidad: datos.length,
            longevo: d3.max(datos, d => +d.Age),
            joven: d3.min(datos, d => +d.Age),
        }))}
    else {
        const datosAgrupados = d3.group(datosDeportistasYear.filter(d => d.Sport === seleccionado), d => d.Team)
        datosDeporte = Array.from(datosAgrupados, ([Team, datos]) => ({
            Team,
            Sport: seleccionado,
            cantidad: datos.length,
            longevo: d3.max(datos, d => +d.Age),
            joven: d3.min(datos, d => +d.Age),
        }))
    }

    const datosamostrar = (seleccionado === "Total Deportistas") ? datosDeporte : datosDeporte.filter(d => d.Sport === seleccionado)

    const maxCantidad = d3.max(datosamostrar, d => +d.cantidad);

    const escalaColor = d3.scaleSequential()
        .domain([0, maxCantidad])
        .interpolator(d3.interpolateBlues)
    svg.selectAll("g.legendEntry").remove()
    // Use la respuesta de AmeliaBR, para crear la leyenda ya que como yo lo estaba haciendo no funcionaba correctamente (https://stackoverflow.com/questions/21838013/d3-choropleth-map-with-legend)
    var legend = svg.selectAll("g.legendEntry")
        // para el data use ChatGPT porque no me funcionaba correctamente
        .data(escalaColor.ticks(10).slice(1).reverse())
        .enter()
        .append("g").attr("class", "legendEntry");
    legend
        .append("rect")
        .attr("x", width - 20)
        .attr("y", function(d, i) {
            return i * 20;
        })
        .attr("width", 15)
        .attr("height", 20)
        .style("stroke", "black")
        .style("stroke-width", 1)
        .style("fill", escalaColor);
    legend
        .append("text")
        .attr("x", width - 25)
        .attr("y", function(d, i) {
            return i * 20;
        })
        .attr("dy", "0.8em")
        .text(function(d, i) {
            // el interior de esta funcion contenia un error para mi codigo y me lo corrigio ChatGPT
            return d3.format(".2s")(d);
        })
        .style("font-size", "10px")
        .style("text-anchor", "end")
        .style("alignment-baseline", "middle")
        .style("font-size", "10px")
        .style("text-anchor", "end")
        .style("alignment-baseline", "middle")

    // Codigo gracias a la ayuda de la ayudantia 9
    // creamos la proyeccion
    const proyeccion = d3.geoWinkel3()
        .fitSize([width, height], datosMapas)
    // creamos el path
    const caminosGeo = d3.geoPath().projection(proyeccion)
    // creamos el mapa
    contenedorMapa
        .selectAll("path")
        .data(datosMapas.features)
        .join("path")
        .attr("d", caminosGeo)
        .attr("fill", "lightgrey")
        // añadimos las coropletas dependiendo de la cantidad de deportistas total en cada pais
        // usamos ChatGPT para el siguiente attr.
        .attr("fill", d => {
            const pais = d.properties.ADMIN
            const deportistas = datosamostrar.find(dato => dato.Team === pais)
            if (deportistas) {
                return escalaColor(deportistas.cantidad)
            } else {
                return "lightgrey"
            }
        })
    // hacemos un tooltip para mostrar datos del pais, a la hora de pasar el mouse por encima.
    var tooltip = d3.select("#vis-1").append("div")
    // Use el codigo de mi tarea 2 (Mateo Andrade) para hacer el tooltip
        .attr("class", "tooltip")
        .style("opacity", 0)
        .attr("class", "tooltip")
        .style("position", "absolute")
        .style("background-color", "white")
        .style("border", "solid")
        .style("border-width", "2px")
        .style("border-radius", "5px")
        .style("padding", "5px")
        .style("width", "200px")
        .style("height", "120px")
        .style("border-color", "blue")
    

    var mouseover = function(event, d) {
    // Aca comence usando logica de mi tarea 2 (Mateo Andrade) ocupada para mouseover
    // Luego me di cuenta que no funcionaba, y me fui ayudando de chatgpt para que funcionara correctamente para este caso:
        contenedorMapa
            .selectAll("path")
            .style("opacity", .1)

        d3.select(this)
            .style("opacity", 1)
            .style("stroke-width", .5)
            .style("stroke", "blue")
       
        tooltip
            .style("opacity", 1)
            .style("stroke-width", 0)
        const pais = d.properties ? d.properties.ADMIN : "No disponible";
        const cantidadDeportistas =
            datosamostrar.find((dato) => dato.Team === pais)?.cantidad || "No disponible";
        const [mouseX, mouseY] = d3.pointer(event);
        tooltip
            .style("left", mouseX + 20 + "px")
            .style("top", mouseY + "px")
            .html(pais + "<br>" + "Deportistas: " + cantidadDeportistas + "<br>" + "Edad deportista mas longevo: " + datosamostrar.find((dato) => dato.Team === pais)?.longevo + "<br>" + "Edad deportista mas joven: " + datosamostrar.find((dato) => dato.Team === pais)?.joven)
    }

    var mouseleave = function(d) {
        
        contenedorMapa
            .selectAll("path")
            .style("opacity", 1)
            .style("stroke", "black")
            .style("stroke-width", .3)

        tooltip
            .style("opacity", 0)
    }

    // Este es mi codigo original (tambien ocupe un poco de ayuda de ChatGPT para ocupar el datajoin (.data().enter().exit().remove()), pero como creí que no cumplia con el pedido del data join, lo cambie por el que esta mas abajo con ayuda de ChatGPT 
    // contenedorMapa                                                                  
    //   .selectAll("path")                                                            
    //    .data(datosMapas.features, d => d.properties.ADMIN)                          
    //    .join("path")                                                                
    //    .enter()                                                                     
    //    .append("path")                                                              
    //    .merge(contenedorMapa.selectAll("path"))
    //    .on("mouseover", mouseover)
    //    .on("mouseleave", mouseleave)
    //    .on("mousemove", (event, d) => mousemove(event, d))
    //    // ACA AGREGAR FUNCION QUE SE CONECTA CON LA SEGUNDA VIS.
    //    .on("click", function (event, d) { console.log(d.properties.ADMIN) })
    //    .style("stroke", "black")
    //    .style("stroke-width", .3)
    //   .exit()
    //    .remove()
    // Con ayuda de ChatGPT definimos la funcion updateMapa().  
    // Lo que sucedio es que me motive a hacer el data join con el enter, update y exit (Asi como en mi tarea 2 Mateo Andrade) cuando finalizara de escribir la funcion crearMapa, y no logre hacerla funcionar.(Por lo menos ocupando la misma lógica que en mi tarea 2)
    // Y gracias a ChatGPT pude definirla de esta forma y que cumpliera con la pauta.
    function updateMapa() {
        contenedorMapa
            .selectAll("path")
            .data(datosMapas.features, d => d.properties.ADMIN)
            .join(
                enter => enter.append("path"),
                update => update,
                exit => exit.remove()
            )
            .attr("d", caminosGeo)
            .attr("fill", "lightgrey")
            .attr("fill", d => {
                const pais = d.properties.ADMIN;
                const deportistas = datosamostrar.find(dato => dato.Team === pais);
                if (deportistas) {
                    return escalaColor(deportistas.cantidad);
                } else {
                    return "lightgrey";
                }
            })
            .style("stroke", "black")
            .style("stroke-width", 0.3)
            .on("mouseover", mouseover)
            .on("mouseleave", mouseleave)
            .on("click", function (event, d) { crearNodo(datosDeportistas, d.properties.ADMIN) });
    }

    updateMapa();

    d3.select(window).on("resize", updateMapa);
}

// VISUALIZACION 2

function crearNodo(datosDeportistas, seleccionado) {
    
    //para evitar duplicacion
    d3.select("#vis-2 svg").remove() //PRUEBAAA 

    //CREAMOS SVG2
    const svg2 = d3
        .select("#vis-2")
        .append("svg")
        .attr("width", WIDTH)
        .attr("height", HEIGHT)
        .style("background-color", "#D3D3D3")

    const deportes = Array.from(new Set(datosDeportistas.map(d => d.Sport)))
    const paises = Array.from(new Set(datosDeportistas.map(d => d.Team)))
    const selecciones = ['peso_promedio', 'altura_promedio', 'peso_total']
    console.log(seleccionado)
    console.log(deportes)
    console.log(paises)
    console.log(selecciones)
    // HACEMOS console log true si esta adentro de deportes
    console.log(deportes.includes(seleccionado))
    console.log(seleccionado)
    // condicionales ayudandome poco a poco con ChatGPT
    if (deportes.includes(seleccionado)) {
        const datosAgrupados = d3.group(datosDeportistas, d => d.Team, d => d.Sport);
        datosDeporte = Array.from(datosAgrupados, ([Team, deportesMap]) => {
            return Array.from(deportesMap, ([Sport, datos]) => ({
                Team,
                Sport,
                cantidad: datos.length,
                longevo: d3.max(datos, d => +d.Age),
                joven: d3.min(datos, d => +d.Age),
                dato_crack_cantidad_deportistas : datos.length,
                dato_crack_altura_promedio : d3.mean(datos, d => +d.Height),
                dato_crack_peso_promedio : d3.mean(datos, d => +d.Weight),
                dato_crack_peso_total : d3.sum(datos, d => +d.Weight),

            }))
        }).flat();
        var datosDeportistasPaises = datosDeporte.filter(d => d.Sport === seleccionado)
        
    }
    else if (seleccionado === "Total Deportistas") { 
        const datosAgrupados = d3.group(datosDeportistas, d => d.Team);
        datosDeporte = Array.from(datosAgrupados, ([Team, datos]) => ({
            Team,
            cantidad: datos.length,
            longevo: d3.max(datos, d => +d.Age),
            joven: d3.min(datos, d => +d.Age),
            dato_crack_cantidad_deportistas : datos.length,
            dato_crack_altura_promedio : d3.mean(datos, d => +d.Height),
            dato_crack_peso_promedio : d3.mean(datos, d => +d.Weight),
            dato_crack_peso_total : d3.sum(datos, d => +d.Weight),

        }))
        var datosDeportistasPaises = datosDeporte
    }
    else if (paises.includes(seleccionado)) {
        //mostraremos solo los deportes de ese pais
        const datosAgrupados = d3.group(datosDeportistas, d => d.Team, d => d.Sport);
        datosDeporte = Array.from(datosAgrupados, ([Team, deportesMap]) => {
            return Array.from(deportesMap, ([Sport, datos]) => ({
                Team,
                Sport,
                cantidad: datos.length,
                longevo: d3.max(datos, d => +d.Age),
                joven: d3.min(datos, d => +d.Age),
                dato_crack_cantidad_deportistas : datos.length,
                dato_crack_altura_promedio : d3.mean(datos, d => +d.Height),
                dato_crack_peso_promedio : d3.mean(datos, d => +d.Weight),
                dato_crack_peso_total : d3.sum(datos, d => +d.Weight),


            }))
        }).flat();
        var datosDeportistasPaises = datosDeporte.filter(d => d.Team === seleccionado)
    }
    else if (selecciones.includes(seleccionado)) {
        if (seleccionado = 'peso_promedio') {
            const datosAgrupados = d3.group(datosDeportistas, d => d.Team);
            datosDeporte = Array.from(datosAgrupados, ([Team, datos]) => ({
                Team,
                longevo: d3.max(datos, d => +d.Age),
                joven: d3.min(datos, d => +d.Age),
                cantidad: d3.mean(datos, d => +d.Weight),
                dato_crack_cantidad_deportistas : datos.length,
                dato_crack_altura_promedio : d3.mean(datos, d => +d.Height),
                dato_crack_peso_promedio : d3.mean(datos, d => +d.Weight),
                dato_crack_peso_total : d3.sum(datos, d => +d.Weight),

            }))
            var datosDeportistasPaises = datosDeporte
        }
        else if (seleccionado = 'altura_promedio') {
            const datosAgrupados = d3.group(datosDeportistas, d => d.Team);
            datosDeporte = Array.from(datosAgrupados, ([Team, datos]) => ({
                Team,
                longevo: d3.max(datos, d => +d.Age),
                joven: d3.min(datos, d => +d.Age),
                cantidad: d3.mean(datos, d => +d.Height),
                dato_crack_cantidad_deportistas : datos.length,
                dato_crack_altura_promedio : d3.mean(datos, d => +d.Height),
                dato_crack_peso_promedio : d3.mean(datos, d => +d.Weight),
                dato_crack_peso_total : d3.sum(datos, d => +d.Weight),

            }))
            var datosDeportistasPaises = datosDeporte
        }
        else if (seleccionado = 'peso_total') {
            const datosAgrupados = d3.group(datosDeportistas, d => d.Team);
            datosDeporte = Array.from(datosAgrupados, ([Team, datos]) => ({
                Team,
                longevo: d3.max(datos, d => +d.Age),
                joven: d3.min(datos, d => +d.Age),
                cantidad: d3.sum(datos, d => +d.Weight),
                dato_crack_cantidad_deportistas : datos.length,
                dato_crack_altura_promedio : d3.mean(datos, d => +d.Height),
                dato_crack_peso_promedio : d3.mean(datos, d => +d.Weight),
                dato_crack_peso_total : d3.sum(datos, d => +d.Weight),

            }))
            var datosDeportistasPaises = datosDeporte
        }}
    console.log("hola")
    console.log(datosDeportistasPaises)
    function onchange() {
        var selectValue = d3.select('select').property('value')
        var maxVal = d3.max(datosEstadisticas, function(d) { return d[selectValue]; });
    
    // Actualizar la escala del radio
        escala_radio.domain([0, maxVal]);

    // Actualizar el radio de los círculos
        node.selectAll("circle")
            .attr("r", function(d) { return escala_radio(d[selectValue]); });
        
        updateRadio();
    };

    // funcion para actualizar el radio de los circulos
    function updateRadio() {
        node.selectAll("circle")
        .attr("r", function(d) { return escala_radio(d[selectValue]); });
    }
    
    // FIN DE PRUEBA DE GITHUB


    // escala radio deporte (para los circulos pequeños dentro de los nodos grandes)
    var escala_radio_deporte = d3.scaleLinear()
    .domain([0, d3.max(datosDeporte, function(d) { return d.cantidad; })]) //escala segun cantidad de deportistas
    .range([5, 10])

    // escala
    var escala_radio = d3.scaleLinear()
    .domain([0, d3.max(datosDeportistasPaises, function(d) { return d.cantidad; })]) //escala segun cantidad de deportistas
    .range([7, 55])

    // var datosAgrupados = d3.group(datosDeporte, d => d.Team); //variable utilizada nodos pequeños

    var node = svg2.append("g")
    .selectAll("g")
    .data(datosDeportistasPaises)
    .enter()
    .append("g")
        .call(d3.drag() // llama la funcion cuando es arrastrado
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended));

    //crear tooltip (para nodos grandes)

    var tooltip_big = d3.select("#tooltip_big")
        .style("background", "white")
        .style("border", "solid")
        .style("border-width", "1px")
        .style("border-radius", "5px")
        .style("padding", "10px");
    
    node.append("circle")
        .attr("r", function(d) {return escala_radio(d.cantidad);}) //radio de los circulos segun la escala
        .attr("cx", 0)
        .attr("cy", 0)
        .style("fill", "#69b3a2")
        .style("fill-opacity", 0.3)
        .attr("stroke", "#69a2b2")
        .style("stroke-width", 4)
        .on("mouseover", function(event, d) {
            tooltip_big.style("opacity", 1)
            .style("left", (event.pageX + 10) + "px")
            .style("top", (event.pageY - 10) + "px")
            .html(d.Team + "<br>" + d.cantidad + " deportistas");
        })
        .on("mouseout", function(d) {
            tooltip_big.style("opacity", 0);
        });

    // crear tooltip (para circulos pequeños dentro de los nodos grandes)
    // var tooltip_lil = d3.select("#tooltip")
    //     .style("background", "white")
    //     .style("border", "solid")
    //     .style("border-width", "1px")
    //     .style("border-radius", "5px")
    //     .style("padding", "10px");

    // node.each(function(d) { //nodos pequeños (deportes)
        
    //     var deportes = datosAgrupados.get(d.Team);
    //     if (seleccionado !== "Total Deportistas") {
    //         deportes = deportes.filter(d => d.Sport === seleccionado);
    //     }

    //     var nodeDeporte = d3.select(this).selectAll("circle.deporte")
    //             .data(deportes, d => d.Sport);

    //     //exit
    //     nodeDeporte.exit().remove();

    //     //update
    //     nodeDeporte.attr("r", d => escala_radio_deporte(d.cantidad)).style("fill", "red");

    //     //enter
    //     nodeDeporte = nodeDeporte.enter()
    //         .append("circle")
    //         .attr("class", "deporte")
    //         .attr("r", d => escala_radio_deporte(d.cantidad))
    //         .attr("cx", 0)
    //         .attr("cy", 0)
    //         .style("fill", "red");
    //         // .merge(nodeDeporte);

        
    //     nodeDeporte
    //         .on("mouseover", function(event, d) {
    //             tooltip
    //                 .style("opacity", 1)
    //                 .style("left", (event.pageX + 10) + "px")
    //                 .style("top", (event.pageY - 10) + "px")
    //                 .html(d.Sport + "<br>" + d.cantidad + " deportistas");
    //             })
    //         .on("mouseout", function(d) {
    //             tooltip.style("opacity", 0);
    //             });

    //     var simulationDeporte = d3.forceSimulation()
    //         .force("center", d3.forceCenter().x(0).y(0)) // atrae hacia el centro del nodo padre
    //         .force("charge", d3.forceManyBody().strength(1)) // los círculos se atraen
    //         .force("collide", d3.forceCollide().strength(.4).radius(d => escala_radio_deporte(d.cantidad) + 1).iterations(1)) // para que los círculos no se superpongan
        
    //     simulationDeporte
    //         .nodes(deportes)
    //         .on("tick", function() {
    //             nodeDeporte
    //                 .attr("cx", function(d) { return d.x; })
    //                 .attr("cy", function(d) { return d.y; });
    //         });
    // })
        // añadimos la simulacion de fuerza
    
    var simulation = d3.forceSimulation()
        .force("center", d3.forceCenter().x(width / 2).y(height / 2)) // atrae desde el centro del svg
        .force("charge", d3.forceManyBody().strength(.1)) // nodos se atraen
        .force("collide", d3.forceCollide().strength(.2).radius(function(d) {return escala_radio(d.cantidad)}).iterations(1)) // para que los nodos no se superposicionen

        // aplicamos la simulacion de fuerza
    simulation
        .nodes(datosDeportistasPaises)
        .on("tick", function(d){
        node
            .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
        });

    // codigo sacado gracias a chatpgt. (funciones para el drag)
    function dragstarted(event, d) {
        if (!event.active) simulation.alphaTarget(.03).restart();
        d.fx = d.x;
        d.fy = d.y;
    }
    function dragged(event, d) {
        d.fx = event.x;
        d.fy = event.y;
    }
    function dragended(event, d) {
        if (!event.active) simulation.alphaTarget(.03);
        d.fx = null;
        d.fy = null;
    }
};

d3.json("data/countries.geojson").then(datosMapas => {
    // Use ChatGPT para ayudarme a actualizar el mapa segun el deporte seleccionado y año seleccionado (TODO ESTE CODIGO LO TRABAJE USANDO CHATGPT Y MODIFICANDOLO POCO A POCO PARA LA FUNCIONALIDAD DEL MAPA)
    // Es decir es un Frankestein.
    d3.csv("data/atletas_todos.csv").then(datosDeportistas => {
        const deportes = Array.from(new Set(datosDeportistas.map(d => d.Sport)))
        deportes.unshift("Total Deportistas");

        d3.select("#mostrar-by")
            .selectAll("option")
            .data(deportes)
            .join("option")
            .attr("value", d => d)
            .text(d => d);

        const yearSlider = d3.select("#year-slider");
        const selectedYearText = d3.select("#selected-year");

        const uniqueYears = Array.from(new Set(datosDeportistas.map(d => +d.Year)));

        const yearDropdown = d3.select("#mostrar-year");
        yearDropdown.append("option").attr("value", "all").text("Todos los años");
        yearDropdown.selectAll("option:not(:first-child)")
            .data(uniqueYears)
            .join("option")
            .attr("value", d => d)
            .text(d => d);

        const seleccionDeporteInicial = d3.select("#mostrar-by").property("value");
        const seleccionYearInicial = +yearSlider.property("value");

        crearMapa(datosMapas, datosDeportistas, seleccionDeporteInicial, seleccionYearInicial);
        crearNodo(datosDeportistas, "Total Deportistas");

        d3.select("#mostrar-by")
            .on("change", (evento) => {
                const seleccionado = evento.target.value;
                const selectedYear = +yearSlider.property("value");
                crearMapa(datosMapas, datosDeportistas, seleccionado, selectedYear);
                crearNodo(datosDeportistas, seleccionado);
            });
        
        d3.select("#mostrar-by2")
            .on("change", (evento) => {
                const seleccionado = evento.target.value;
                crearNodo(datosDeportistas, seleccionado);
            });


        let temporizador;
        let esperaDeslizamiento = 100;

        yearSlider.on("input", function () {
            clearTimeout(temporizador);
            temporizador = setTimeout(handleSliderChange, esperaDeslizamiento);
        
            // Actualizar el valor del año en el menú desplegable
            yearDropdown.property("value", yearSlider.property("value"));
        });
        yearDropdown.on("change", (evento) => {
            const seleccionado = d3.select("#mostrar-by").property("value");
            const selectedYear = evento.target.value === "all" ? "all" : +evento.target.value;
        
            // Actualizar el valor del año en el deslizador
            yearSlider.property("value", selectedYear);
        
            selectedYearText.text(selectedYear);
        
            crearMapa(datosMapas, datosDeportistas, seleccionado, selectedYear);
        });


        function handleSliderChange() {
            const selectedYear = +yearSlider.property("value");
            selectedYearText.text(selectedYear);
            const seleccionado = d3.select("#mostrar-by").property("value");
            crearMapa(datosMapas, datosDeportistas, seleccionado, selectedYear);
        }

        // Obtener el botón por su ID
        const allyears = document.getElementById("all-years");

        // Agregar un listener para cuando se hace click en el botón de todos los años
        
        allyears.addEventListener("click", () => {
            const seleccionado = d3.select("#mostrar-by").property("value");
            yearDropdown.property("value", "all");
            yearSlider.property("value", "all");
            selectedYearText.text("Todos los años");
            crearMapa(datosMapas, datosDeportistas, seleccionado, "all");
        });
    });
});


