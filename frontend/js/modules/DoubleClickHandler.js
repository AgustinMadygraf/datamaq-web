/*
Path: frontend/js/modules/DoubleClickHandler.js
*/

let doubleClicker = {
    clickedOnce: false,
    timer: null,
    timeBetweenClicks: 400
};

function resetDoubleClick() {
    clearTimeout(doubleClicker.timer);
    doubleClicker.timer = null;
    doubleClicker.clickedOnce = false;
}

function zoomIn(event) {
    try {
        console.log("Executing zoomIn with event:", event);
        const periodo = window.chartData.periodo;
        const ls_periodos = window.chartData.ls_periodos;
        const menos_periodo = window.chartData.menos_periodo;
        const tiempo = Highcharts.numberFormat(event.xAxis[0].value + (ls_periodos[menos_periodo[periodo]] / 2));
        window.open(window.location.pathname + '?periodo=' + menos_periodo[periodo] + '&conta=' + tiempo, "_self");
    } catch (err) {
        console.log("Error in zoomIn:", err);
    }
}

export function onDbClick(event) {
    if (doubleClicker.clickedOnce && doubleClicker.timer) {
        resetDoubleClick();
        zoomIn(event);
    } else {
        doubleClicker.clickedOnce = true;
        doubleClicker.timer = setTimeout(resetDoubleClick, doubleClicker.timeBetweenClicks);
    }
}
