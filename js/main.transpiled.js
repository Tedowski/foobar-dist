"use strict"

window.addEventListener("DOMContentLoaded", getStarted);

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
    console.log('DOM loaded');
    createGraphs();
    waitForData();
    sectionControl();
}

function waitForData() {
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

function startTimer(int) {
    setInterval(() => {
        getTrueData();
    }, int)
}

function getTrueData() {
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

function createGraphs() {
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

function getTapItems(data) {
    let items = Array.from(document.querySelectorAll('.tap-detail'));
    //console.log(items);
    items.forEach(it=>{
        let canvas = it.childNodes[1];
        //console.log(canvas);
        let id = it.getAttribute('data-id');
        createTapGraph(data, canvas, id);
    })
}

function createTapGraph(data, canvas, index) {

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

function loopUpdateTaps(data) {
    data.forEach(tap => {
        let id = tap.id;
        let level = tap.level;
        let capacity = tap.capacity;
        let name = tap.beer;
        updateTapGraph(myChartTap, id, level, capacity, name);
    })
}

function updateTapGraph(chart, id, level, cap, name) {
    chart[id].data.labels = [" ", name];

    chart[id].data.datasets.forEach((dataset) => {
        dataset.data = [cap-level, level];
    });
    chart[id].update();
}

function updateGraphKeg(chart, newData, newAmounts) {
    chart.data.labels = newData;

    chart.data.datasets.forEach((dataset) => {
        dataset.data = newAmounts;
    });
    chart.update();
}

function updateGraphSer(chart, data, index) {
    chart.data.datasets[index].data.shift();
    chart.data.datasets[index].data.push(data);
    chart.update();
}

function assignDataToVarKegs(data) {
    kegNames = [];
    kegAmounts = [];
    kegs = data.storage.forEach((e) => {
        //console.log(e.amount);
        kegNames.push(e.name);
        kegAmounts.push(e.amount);
    });

    updateGraphKeg(myChartTwo, kegNames, kegAmounts);
}

function showOrders(data, lengthOne, BTData, secDataSet) {
    //console.log(data);
    let orderTemplate = document.getElementById('orderTemplate').content;
    let parent = document.getElementById('queueList');
    parent.innerHTML = '';

    let BTNames = [];
    let BTServ = [];

    BTData.forEach(bt => {
        //console.log(bt);
        BTNames.push(bt.name);
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

        let i = 0;
        for (; i < 3; i++) {
            if (order.id === BTServ[i]) {
                servingBT.textContent = BTNames[i];
            }
        }

        orderId.textContent = order.id;
        let orderTime = order.startTime;
        let timeNow = secDataSet.timestamp;
        let timeAgo = Math.round((timeNow - orderTime) / 1000);
        orderDate.textContent = timeAgo + 's ago';
        order.order.forEach(beer => {
            //console.log("I need" + beer)
            let newLi = document.createElement('li');
            newLi.textContent = '"'+beer+'"';
            orderItem.appendChild(newLi);
        });
        if (data.indexOf(order) < lengthOne) {
            status.style.backgroundColor = '#61D2AD';
        } else {
            status.style.backgroundColor = '#F5A623';
        }

        parent.appendChild(clone);
    });
}

function showTaps(data) {
    //console.log(data);
    let templateTaps = document.getElementById('templateTaps').content;
    let parent = document.getElementById('taps');
    parent.innerHTML = '';

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

        beerLogo.src = 'images/'+ beerString + '.png';
        beerIn.textContent = tap.beer;
        inUse.textContent = tap.inUse;
        beerStatus.textContent = Math.floor((tap.level / tap.capacity) * 100) + '%';
        if (tap.inUse) {
            useIndicator.style.backgroundColor = '#61D2AD';
        } else {
            useIndicator.style.backgroundColor = '#B11427';
        }
        parent.appendChild(clone);
    })
}

function showBartenders(data) {
    //console.log(data);
    let bartenderTemplate = document.getElementById('bartenderTemplate').content;
    let parent = document.getElementById('bartenders');
    parent.innerHTML = '';

    data.forEach(btd => {
        let clone = bartenderTemplate.cloneNode(true);
        let tenderName = clone.querySelector('#tenderName');
        let tenderStatus = clone.querySelector('#tenderStatus');
        let tenderServis = clone.querySelector('#tenderServis');
        let tenderBanner = clone.querySelector('.tender-banner');

        tenderName.textContent = btd.name;
        tenderStatus.textContent = btd.status;
        tenderServis.textContent = 'Serving: ' + btd.servingCustomer;

        if (btd.status === 'WORKING') {
            tenderBanner.style.backgroundColor = '#61D2AD'
        } else {
            tenderBanner.style.backgroundColor = '#F5A623'
        }

        if (btd.servingCustomer === null) {
            tenderServis.style.visibility = 'hidden';
        } else {
            tenderServis.style.visibility = 'visible';
        }

        parent.appendChild(clone);
    });
}

function sectionControl() {
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

function makeBeerList(data) {
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
        if (beer.label === "hollaback.png") {
            let oldName = Array.from(beer.label);
            let dot = oldName.indexOf('.');
            let newName = oldName.join(oldName.splice(dot, 0, 'l','a','g','e','r'));
            console.log(newName);
            img.src = 'images/'+ newName;
        } else {
            img.src = 'images/'+ beer.label;
        }
        app.textContent = beer.description.appearence;
        aroma.textContent = beer.description.aroma;
        flavor.textContent = beer.description.flavor;
        mouth.textContent = beer.description.mouthfeel;
        overall.textContent = beer.description.overallImpression;
        alc.textContent = 'Alcohol: '+beer.alc+'%';

        button.addEventListener('click', ()=>{
            //button.parentElement.classList.toggle('spanned');
            desc.classList.remove('hidden');
        });

        closeBtn.addEventListener('click', ()=> {
            desc.classList.add('hidden');
        });

        parent.appendChild(clone);
    });
}