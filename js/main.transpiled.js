/* Welcome to our FooBar Dashboard 2.0
    Have to say, this has been by far the best project we have done on this school
    Although it really did FUUBAR (I see what you did there);
    The whole concept of the code was to avoid async script (not really sure if I understand it correctly),
    meaning, that all the code is wrapped in functions, which are called based on events.

    Division of the code:
    Tadeas: getting and setting up all the data + loops and passing of dynamic data + CSS
    Vitek: HTML/CSS, UX and functionality plus application of the data to the DOM;

    Note:
    We would like to proudly declare, that all of the code below is purely our creation. Even though we used Stack Overflow
    to help with minor problems, we never really copied or used specific piece of code from the forum (except one instance with regular expression - has Link), but rather just looked for ideas,
    and then ended up writting it in completely different way.

    We also decided to use simple css and js for the sake of time smaller consumption (plus it was real pain in the ass);
*/

"use strict"

window.addEventListener("DOMContentLoaded", getStarted); //we wait for the DOM to get Loaded

//Declaration of some global variables we are going to reuse in several functions

let cts;
let ctm;
let ctt;
let myChartOne;
let myChartTwo;
let myChartTap = [];
let tapNames = [];

let kegs;
let kegNames = [];
let kegAmounts = [];
let queue = [];
let serving = [];

function getStarted() {
    console.log('DOM loaded'); //Init by DOMLoad - triggers first wave of functions
    createGraphs(); //this creates all the graphs using Chart.js
    waitForData(); //this awaits JSON data from FooBar
    sectionControl(); //this sets up event listeners on DOM elements
}

function waitForData() { //Fancy use of promise to make sure we get the data before we start creating graphs and appending clones
    return new Promise(function(resolve) { 
        resolve(JSON.parse(FooBar.getData()));
    }).then(function(data) {
        console.log('JSON Loaded');
        startTimer(10000);
        assignDataToVarKegs(data);
        updateGraphSer(myChartOne, data.queue.length, 0);
        updateGraphSer(myChartOne, data.serving.length, 1);
        showBartenders(data.bartenders);
        showTaps(data.taps);
        showOrders(data.serving.concat(data.queue), data.serving.length, data.bartenders, data);
        getTapItems(data.taps);
        makeBeerList(data.beertypes);
    });
}

function startTimer(int) { //this starts timer to regulary update data
    setInterval(() => {
        getTrueData();
    }, int)
}

function getTrueData() { //Gets only data that are regulary updated (does not fetch the entire json), and calls all the neccesary functions needed to update the displayed data while passing in the JSON data
    let trueData = JSON.parse(FooBar.getData(true));
    console.log('Data updated');
    assignDataToVarKegs(trueData);
    updateGraphSer(myChartOne, trueData.queue.length, 0);
    updateGraphSer(myChartOne, trueData.serving.length, 1);
    showOrders(trueData.serving.concat(trueData.queue), trueData.serving.length, trueData.bartenders, trueData);
    showBartenders(trueData.bartenders);
    showTaps(trueData.taps);
    loopUpdateTaps(trueData.taps);
}

function createGraphs() { //This function uses Chart.js to create neat, nice looking 'static' graphs
    console.log('Creating Graphs');
    cts = document.getElementById("myChartTwo");
    ctm = document.getElementById("myChartOne");

    myChartTwo = new Chart(cts, {
        type: 'bar',
        responsive: true,
        data: {
            labels: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
            datasets: [{
                label: 'Amount of kegs',
                data: [10, 10, 10, 10, 10, 10, 10, 10, 10, 10],
                backgroundColor: [
                    'rgb(177,20,39)',
                    'rgb(177,20,39)',
                    'rgb(177,20,39)',
                    'rgb(177,20,39)',
                    'rgb(177,20,39)',
                    'rgb(177,20,39)',
                    'rgb(177,20,39)',
                    'rgb(177,20,39)',
                    'rgb(177,20,39)',
                    'rgb(177,20,39)'
                ],
                borderColor: [
                    'rgb(177,20,39)',
                    'rgb(177,20,39)',
                    'rgb(177,20,39)',
                    'rgb(177,20,39)',
                    'rgb(177,20,39)',
                    'rgb(177,20,39)',
                    'rgb(177,20,39)',
                    'rgb(177,20,39)',
                    'rgb(177,20,39)',
                    'rgb(177,20,39)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            maintainAspectRatio: false,
            responsive: true,
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true,
                        max: 10
                    }
                }]
            }
        }
    });

    myChartOne = new Chart(ctm, {
        type: 'line',
        data: {
            labels: ["50s ago", "40s ago", "30s ago", "20s ago", "10s ago", "now"],
            datasets: [{
                label: 'Queue',
                data: [0, 0, 0, 0, 0, 0],
                backgroundColor: [
                    'rgba(255, 255, 255, 0)'
                ],
                borderColor: [
                    'rgb(245,166,35)'
                ],
                borderWidth: 3
            }, {
                label: 'Serving',
                data: [0, 0, 0, 0, 0, 0],
                backgroundColor: [
                    'rgba(255, 255, 255, 0)'
                ],
                borderColor: [
                    'rgb(97,210,173)'
                ],
                borderWidth: 3
            }]
        },
        options: {
            maintainAspectRatio: true,
            responsive: true,
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true,
                        max: 14
                    }
                }]
            }
        }
    });
}

function getTapItems(data) { //This function selects all the div elements which will get dynamically created doughnut chart to display info about taps
    let items = Array.from(document.querySelectorAll('.tap-detail'));
    //console.log(items);
    items.forEach(it=>{
        let canvas = it.childNodes[1];
        //console.log(canvas);
        let id = it.getAttribute('data-id'); //We could have created the divs dynamically (based on the length of the array, but there was no more time). We passed in data-id attribute to match ids
        createTapGraph(data, canvas, id); //Then calls function that creates the graph dynamically for each
    })
}

function createTapGraph(data, canvas, index) { //Dynamically creates number of same graphs while using data passed from JSON based on index of the data in the array

    myChartTap.push(new Chart(canvas, {
        type: 'doughnut',
        data: {
            labels: [" ", data[index].beer],
            datasets: [{
                label: 'Queue',
                data: [data[index].capacity - data[index].level, data[index].level],
                backgroundColor: [
                    'rgba(255, 255, 255, 0)',
                    'rgb(245,166,35)'
                ],
                borderColor: [
                    'rgba(255, 255, 255, 0)',
                    'rgb(245,166,35)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            maintainAspectRatio: false,
            responsive: true,
            animation: {
                animateRotate: true
            }
        }
    }));
}

function loopUpdateTaps(data) { //loops through the data needed to update the doughnut charts (and gets the ID) and calls the update function
    data.forEach(tap => {
        let id = tap.id;
        let level = tap.level;
        let capacity = tap.capacity;
        let name = tap.beer;
        updateTapGraph(myChartTap, id, level, capacity, name);
    })
}

function updateTapGraph(chart, id, level, cap, name) {//updates all doughnut charts by matching the indexes from the array with IDs of the DIVs
    chart[id].data.labels = [" ", name];

    chart[id].data.datasets.forEach((dataset) => {
        dataset.data = [cap-level, level];
    });
    chart[id].update();
}

function assignDataToVarKegs(data) {//Assigns data to the Array that is then passed by the update function to the data array in the graph declaration (standard way of updating Chart.js charts)
    kegNames = [];
    kegAmounts = [];
    kegs = data.storage.forEach((e) => {
        //console.log(e.amount);
        kegNames.push(e.name);
        kegAmounts.push(e.amount);
    });

    updateGraphKeg(myChartTwo, kegNames, kegAmounts);
}

function updateGraphKeg(chart, newData, newAmounts) {//Applies the data Array to the selected Keg chart
    chart.data.labels = newData;

    chart.data.datasets.forEach((dataset) => {
        dataset.data = newAmounts;
    });
    chart.update();
}

function updateGraphSer(chart, data, index) {//function that gets updates Chart with 2 continuous values - Queue and Servis. Thus we pass in the index of the object from the chart declaration to dynamically update each by shift() and push()
    chart.data.datasets[index].data.shift();
    chart.data.datasets[index].data.push(data);
    chart.update();
}

function showOrders(data, lengthOne, BTData, secDataSet) { //function that shows orders but also matches the IDs of the orders with IDs in .bartenders so we can show which bartender is taking care of the selected order
    //console.log(data);
    let orderTemplate = document.getElementById('orderTemplate').content; //we create a template
    let parent = document.getElementById('queueList');
    parent.innerHTML = '';

    let BTNames = []; //we create two arrays that get renewed each update
    let BTServ = [];

    BTData.forEach(bt => {
        //console.log(bt);
        BTNames.push(bt.name); //We pass in the data from .bartenders
        BTServ.push(bt.servingCustomer);
    })
    //console.log(BTNames);


    //append to template
    data.forEach(order => { 
        //console.log(data.indexOf(order));
        let clone = orderTemplate.cloneNode(true);
        let orderId = clone.querySelector('#orderId');
        let orderDate = clone.querySelector('#orderDate');
        let orderItem = clone.querySelector('#orderItem');
        let servingBT = clone.querySelector('#servingBartender');
        let status = clone.querySelector('.show-status');

        let i = 0; //we loop through the array with data from .bartenders and look for equal id value
        for (; i < 3; i++) {
            if (order.id === BTServ[i]) { //if it finds the same value on specific index
                servingBT.textContent = BTNames[i]; //we pass the name of the bartender from that index
            }
        }

        orderId.textContent = order.id;
        let orderTime = order.startTime;
        let timeNow = secDataSet.timestamp;
        let timeAgo = Math.round((timeNow - orderTime) / 1000);
        orderDate.textContent = timeAgo + 's ago';
        order.order.forEach(beer => { //foEach that creates list of all the beers in the order
            //console.log("I need" + beer)
            let newLi = document.createElement('li');
            newLi.textContent = '"'+beer+'"';
            orderItem.appendChild(newLi);
        });
        if (data.indexOf(order) < lengthOne) { //color differentiation based on the index of the concatenated array (we look for the orders that are part of the array 'serving')
            status.style.backgroundColor = '#61D2AD';
        } else {
            status.style.backgroundColor = '#F5A623';
        }

        parent.appendChild(clone);
    });
}

function showTaps(data) {//function that shows Taps on first page
    //console.log(data);
    let templateTaps = document.getElementById('templateTaps').content;
    let parent = document.getElementById('taps');
    parent.innerHTML = '';

    //append clone
    data.forEach(tap => { 
        let clone = templateTaps.cloneNode(true);
        let beerIn = clone.querySelector('#beerIn');
        let inUse = clone.querySelector('#inUse');
        let useIndicator = clone.querySelector('.show-status');
        let beerStatus = clone.querySelector('#beerStatus');
        let beerLogo = clone.querySelector('#beer-img');
        let beerName = tap.beer.toLowerCase();
        let beerString = beerName.replace(/\s/g,''); //Stack overflow for RegEx; https://stackoverflow.com/questions/6623231/remove-all-white-spaces-from-text
        //console.log(beerString);

        beerLogo.src = 'images/'+ beerString + '.png'; //get image based on the value of the string
        beerIn.textContent = tap.beer;
        inUse.textContent = tap.inUse;
        beerStatus.textContent = Math.floor((tap.level / tap.capacity) * 100) + '%';
        if (tap.inUse) { //show status of the tap use by checking for boolean value of inUse by colors
            useIndicator.style.backgroundColor = '#61D2AD';
        } else {
            useIndicator.style.backgroundColor = '#B11427';
        }
        parent.appendChild(clone);
    })
}

function showBartenders(data) {//another use of templates
    //console.log(data);
    let bartenderTemplate = document.getElementById('bartenderTemplate').content;
    let parent = document.getElementById('bartenders');
    parent.innerHTML = '';

    //append to parent
    data.forEach(btd => { 
        let clone = bartenderTemplate.cloneNode(true);
        let tenderName = clone.querySelector('#tenderName');
        let tenderStatus = clone.querySelector('#tenderStatus');
        let tenderServis = clone.querySelector('#tenderServis');
        let tenderBanner = clone.querySelector('.tender-banner');

        tenderName.textContent = btd.name;
        tenderStatus.textContent = btd.status;
        tenderServis.textContent = 'Serving: ' + btd.servingCustomer;

        if (btd.status === 'WORKING') { //same old color dif.based on value of the string
            tenderBanner.style.backgroundColor = '#61D2AD'
        } else {
            tenderBanner.style.backgroundColor = '#F5A623'
        }

        if (btd.servingCustomer === null) { //we want to keep it nice looking
            tenderServis.style.visibility = 'hidden';
        } else {
            tenderServis.style.visibility = 'visible';
        }

        parent.appendChild(clone);
    });
}

function sectionControl() { //simple use of eventlisteners and classLists to control the behaviour of the html
    let buttonOne = document.getElementById('secOne');
    let sectionOne = document.querySelector('.sec-one');
    let buttonTwo = document.getElementById('secTwo');
    let sectionTwo = document.querySelector('.sec-two');
    let buttonThree = document.getElementById('secThree');
    let sectionThree = document.querySelector('.sec-three');

    buttonOne.addEventListener('click', ()=>{
        buttonOne.classList.add('active');
        buttonTwo.classList.remove('active');
        buttonThree.classList.remove('active');
        sectionOne.classList.remove('hidden');
        sectionTwo.classList.add('hidden');
        sectionThree.classList.add('hidden');
    });

    buttonTwo.addEventListener('click', ()=>{
        buttonTwo.classList.add('active');
        buttonOne.classList.remove('active');
        buttonThree.classList.remove('active');
        sectionTwo.classList.remove('hidden');
        sectionOne.classList.add('hidden');
        sectionThree.classList.add('hidden');
    });

    buttonThree.addEventListener('click', ()=>{
        buttonThree.classList.add('active');
        buttonOne.classList.remove('active');
        buttonTwo.classList.remove('active');
        sectionThree.classList.remove('hidden');
        sectionOne.classList.add('hidden');
        sectionTwo.classList.add('hidden');
    })

    let showMoreOne = document.querySelector('#showMoreOne');
    let showMoreTwo = document.querySelector('#showMoreTwo');
    let arrayOne = document.querySelector('#taps');
    let arrayTwo = document.querySelector('#queueList');

    showMoreOne.addEventListener('click', ()=>{
        arrayOne.classList.toggle('limited');
    })

    showMoreTwo.addEventListener('click', ()=>{
        //console.log('No.2 clicked');
        arrayTwo.classList.toggle('limited');
    });
}

function makeBeerList(data) {//creates a static list of beers with all the detailed info
    //console.log(data);
    let beerTemplate = document.getElementById('beerTemplate').content;
    let parent = document.getElementById('beers');

    data.forEach(beer => {
        //console.log(beer);
        let clone = beerTemplate.cloneNode(true);
        let name = clone.querySelector('#bName');
        let img = clone.querySelector('#bImg');
        let app = clone.querySelector('#bApp');
        let aroma = clone.querySelector('#bAro');
        let flavor = clone.querySelector('#bFla');
        let mouth = clone.querySelector('#bMouth');
        let overall = clone.querySelector('#bOver');
        let alc = clone.querySelector('#bAlc');
        let button = clone.querySelector('#bButton');
        let closeBtn = clone.querySelector('.close-btn');
        let desc = clone.querySelector('#bDesc');

        name.textContent = beer.name;
        if (beer.label === "hollaback.png") { //we had one instance when we changed the name of the beer image, thus we had to check for the value of the missing beer
            let oldName = Array.from(beer.label); //we then used transformation to array and from array to pass in the word that was added to the image file name
            let dot = oldName.indexOf('.');
            let newName = oldName.join(oldName.splice(dot, 0, 'l','a','g','e','r')); //we renamed the img to 'hollabacklager.png'
            console.log(newName);
            img.src = 'images/'+ newName;
        } else {
            img.src = 'images/'+ beer.label; //for other beers, just use the regular .label
        }
        app.textContent = beer.description.appearence;
        aroma.textContent = beer.description.aroma;
        flavor.textContent = beer.description.flavor;
        mouth.textContent = beer.description.mouthfeel;
        overall.textContent = beer.description.overallImpression;
        alc.textContent = 'Alcohol: '+beer.alc+'%';

        button.addEventListener('click', ()=>{ //event listeners on dynamically created elements to show/hide modal with extra info
            //button.parentElement.classList.toggle('spanned');
            desc.classList.remove('hidden');
        });

        closeBtn.addEventListener('click', ()=> {
            desc.classList.add('hidden');
        });

        parent.appendChild(clone);
    });
}