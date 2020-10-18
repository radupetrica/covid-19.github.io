
const counties = "AB AG AR B BC BH BN BR BT BV BZ CJ CL CS CT CV DB DJ GJ GL GR HD HR IF IL IS MH MM MS NT OT PH SB SJ SM SV TL TM TR VL VN VS".split(" ");
const currentDay = 31;

let root = document.documentElement;


const loadData = function() {
    fetch("https://radupetrica.github.io/covid-19.github.io/data.json")
        .then(res => res.json())
        .then(data => autoFill(data))
}

const autoFill = function(data) {

    

    let countiesWithData = data.countyData.map((o)=> {
        let total = 0;
        if (o.cases != undefined) {
            o.cases.forEach((data) => 
            {
                total = total + parseInt(data.number)
            });
        }

        o.totalCases = total;
        return o;
    } )

    countiesWithData.sort((a,b) => a.totalCases - b.totalCases);

    let elements = data.countyData.flatMap( o => o.cases).flatMap( o => o.number);
    
    let min = elements.reduce(function (a, b) {
        return Math.min(a,b);
    })

    let max = elements.reduce(function (a, b) {
        return Math.max(a,b);
    })


    let x = percentile(elements,0.5);
    let x1 = percentile(elements.filter(o => o > x), 0.9975);

    root.style.setProperty("--rows", (currentDay+2));
    root.style.setProperty("--columns", (countiesWithData.length+1));
    let container = document.querySelector("#container");


    container.appendChild(createGridItem("","item"));
    for(let i = 1 ; i <= currentDay; i++) {
        container.appendChild(createGridItem((new Date("2020", "9", i).toLocaleDateString('en-US', {day: 'numeric', month: 'short'})),"item"));
    }
    container.appendChild(createGridItem("Total", "item"));
    
    for(let i = 0; i < countiesWithData.length; i++) {

        container.appendChild(createGridItem(countiesWithData[i].countyId, "item "));
        const casesData = []
        countiesWithData[i].cases.forEach(e => {
            casesData[new Date(e['date']).getDate()] = e.number;    
        });
        
        for(let j = 1; j <= currentDay; j++ ) {
            let item = createGridItem(casesData[j]);
            if (casesData[j] < x) {
                item.style = "background-color:" + calculateGreenToYellow(casesData[j], min, x, x);
            } else {
                item.style = "background-color:" + calculateYellowToRed(casesData[j], x, max ,x1);
            }
            container.appendChild(item);
        }
        
        container.appendChild(createGridItem(countiesWithData[i].totalCases, "item"));
    }
} 


const createGridItem = function(text, itemClass = "item border fade-in") {
    let gridItem = document.createElement("div");
    gridItem.className = itemClass;
    if (text != undefined)
        gridItem.innerHTML = text;
    return gridItem;
}

const calculateGreenToYellow = function(value, min, max, middle = (max-min)/2){
    let red = 0;
    let green = 0;
    if (value <= middle) {
        let ratio = value/middle;
        red = 255*ratio;
        green = 175+(255-175)*ratio;      
    }
    return "rgba(" + Math.round(red) + ","  + Math.round(green) + ", 107)";
}

const calculateYellowToRed = function(value, min, max, middle = (max-min)/2){
    let red = 0;
    let green = 0;
    
 
    let ratio = value/(max-middle);
    red = 248;
    green = 150-(150*(ratio-1));   

    return "rgba(" + Math.round(red) + ","  + Math.round(green) + ", 50)";
}



const percentile = function(arr, p) {
    if (arr.length === 0) return 0;
    if (typeof p !== 'number') throw new TypeError('p must be a number');
    if (p <= 0) return arr[0];
    if (p >= 1) return arr[arr.length - 1];

    var index = (arr.length - 1) * p,
        lower = Math.floor(index),
        upper = lower + 1,
        weight = index % 1;

    if (upper >= arr.length) return arr[lower];
    return arr[lower] * (1 - weight) + arr[upper] * weight;
}
