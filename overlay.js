function fixcoords(points) {

    //set minX and minY
    let coordsString = "";
    let minx = Math.min(...points.filter((x, i) => i % 2));
    let miny = Math.min(...points.filter((x, i) => i % 2 == 0));

    //set fixed coords into string
    Object.keys(points).forEach(key => {
        let ertek = points[key] -= key % 2 == 0 ? miny : minx;
        coordsString += ertek + ",";
    });

    //return string without the last char, which will always be a ','
    return coordsString.substring(0, coordsString.length - 1);
}
function getPolygonFromAreaCoords(){
    
}
function lighten(area){
    console.log("mouse enter");
    Overlay.MAP.parentElement.querySelectorAll("svg").forEach(e => {
        if (e.querySelector("polygon").getAttribute("points") == fixcoords(area.getAttribute("coords").split(','))) {
            console.log("SUCCEDD");
            e.style["filter"] = Overlay.LIGHTRED;
        }
    });
}
function darken(area){
    console.log("mouse leave");
    Overlay.MAP.parentElement.querySelectorAll("svg").forEach(e => {
        if (e.querySelector("polygon").getAttribute("points") == fixcoords(area.getAttribute("coords").split(','))) {
            e.style["filter"] = Overlay.BACKTORED;
        }
    });
}
// TODO átmenet (glowing border)
// border radius
function addlabel(coords, minx, miny, maxx, maxy) {
    let text = "Hosszabbacska szöveg";
    Overlay.MAP.querySelectorAll("svg").forEach(e => {
        if (e.querySelector("polygon").getAttribute("points") == coords) {
            let outerdiv = document.createElement("div");
            let innerdiv = document.createElement("div");
            let label = document.createElement("label");
            let person = "<img src='person.svg'>"
            let printer = "<img src='printer.svg'>"
            outerdiv.setAttribute("coordinates", coords);
            outerdiv.style["position"] = "absolute";
            outerdiv.style["top"] = (minx + "px");
            outerdiv.style["left"] = (miny + "px");
            outerdiv.style["z-index"] = "3";
            outerdiv.style["height"] = ((maxx - minx) + "px");
            outerdiv.style["width"] = ((maxy - miny) + "px");

            innerdiv.innerHTML += person + printer + "<br>" + text;
            innerdiv.style["max-width"] = (Math.max((maxy - miny)/2, 100) + "px");
            innerdiv.style["max-height"] = ((maxx - minx)/2 + "px");
            innerdiv.style["backgroundColor"] = "white";
            innerdiv.style["position"] = "relative";
            innerdiv.style["margin"] = "auto";
            innerdiv.style["text-align"] = "center";
            innerdiv.style["border-radius"] = "5px";
            //innerdiv.style["border-color"] = "#9ecaed";
            innerdiv.style["box-shadow"] = "0 0 7px 2px #ffffff";
            innerdiv.style["font-size"] = "9pt";

            let nouterdiv = outerdiv;
            outerdiv.appendChild(innerdiv);
            Overlay.MAP.parentElement.appendChild(outerdiv);
            let innerheight = innerdiv.getBoundingClientRect()["height"];
            innerdiv.style["margin-top"] = ((maxx - minx)/2 - innerheight/2 + "px");
            nouterdiv.appendChild(innerdiv);
            Overlay.MAP.parentElement.replaceChild(outerdiv, nouterdiv);
            
        }
    });
}

function display(area) {

    //set color
    let color = Overlay.RED;

    //Getting coordinates/points
    let points = area.getAttribute("coords").split(',');

    //min / max calculations to 'pull' coordinates to 0,0
    let coordsString = "";
    let minx = Math.min(...points.filter((x, i) => i % 2));
    let miny = Math.min(...points.filter((x, i) => i % 2 == 0));
    let maxx = Math.max(...points.filter((x, i) => i % 2));
    let maxy = Math.max(...points.filter((x, i) => i % 2 == 0));
    Object.keys(points).forEach(key => {
        let ertek = points[key] -= (key % 2 == 0 ? miny : minx);
        coordsString += ertek + ",";
    });

    //use string because in a previous version, the style wouldn't load (from CSS file) if it was made with createElement().
    let styleString = "style='position: absolute; z-index: 2; height: " + (maxx - minx) +
        "; width: " + (maxy - miny) +
        "; top: " + minx +
        "; left: " + miny + ";'";
    let ssvg = "<svg " +
        styleString +
        "><polygon style='opacity: 0.5; " + color + "' onclick='toggleOverlay(this)' points='" +
        coordsString.substring(0, coordsString.length - 1) +
        "'></polygon></svg>";

    //add element
    Overlay.MAP.innerHTML += ssvg;

    addlabel(coordsString.substring(0, coordsString.length - 1), minx, miny, maxx, maxy);
}
class Overlay {

    //COLORS
    static RED = "filter: invert(16%) sepia(100%) saturate(5430%) hue-rotate(359deg) brightness(97%) contrast(122%);";
    static LIGHTRED = "invert(31%) sepia(46%) saturate(1184%) hue-rotate(319deg) brightness(134%) contrast(101%)";
    static BACKTORED = "invert(16%) sepia(100%) saturate(5430%) hue-rotate(359deg) brightness(97%) contrast(122%)";
    static MAP;

    constructor(kepid) {

        //KEPID
        this.kepid = kepid;

        //KEP
        this.kep = document.getElementById(kepid)
        //this.kep.style["position"] = "absolute";
        //this.kep.style["top"] = "0px";
        //this.kep.style["left"] = "0px";
        this.kep.style["z-index"] = "1";

        //MAP
        this.map = document.querySelector(this.kep.getAttribute("usemap"));

        //NEWIMG
        this.newimg = this.kep.cloneNode(false);
        this.newimg.setAttribute("id", kepid + "-clone");
        this.newimg.style["z-index"] = "4";
        this.newimg.style["opacity"] = "0";

        kep.parentElement.appendChild(this.newimg);

        Overlay.MAP = this.map;
        //map areas
        this.map.querySelectorAll("area").forEach(e => {
            //scaling map area to fit image
            let coords = e.getAttribute("coords").split(',');
            let coordsstring = "";
            let xscale = kep.getAttribute("width") / 1000;
            let yscale = kep.getAttribute("height") / 1000;
            Object.keys(coords).forEach(key => {
                key % 2 == 0 ? coords[key] *= xscale : coords[key] *= yscale;
                coordsstring += coords[key] + ",";
            })
            coordsstring = coordsstring.substring(0, coordsstring.length - 1)
            //set scaled coords
            e.setAttribute("coords", coordsstring);
            //set onclick event
            e.setAttribute("onmouseenter", "lighten(this)");
            e.setAttribute("onmouseleave", "darken(this)");
        });

        //map areas
        this.map.querySelectorAll("area").forEach(e => {
            display(e);
        });
    }
}
