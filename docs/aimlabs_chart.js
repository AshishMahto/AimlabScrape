let doFirstTime = (am4core, w) => {
  am4core.addLicense("CHEESECAKE");
  // am4core.useTheme(w.am4themes_animated);
  doFirstTime = () => {};
};

/**
 *
 * @param {any} am4charts
 * @param {any} am4core
 * @param {any[]} data
 * @param {{id: string, accuracy?: string | number}} benchmark
 * @param {any} w Window
 */
var makeWeekChart = function (am4charts, am4core, data, benchmark, w) {
  doFirstTime(am4core, w);
  var chart = (w.chart = am4core.create("chartdiv", am4charts.XYChart));

  const parsedData = data[benchmark.id]
    .map((d) => ({
      ...d,
      ended_at: new Date(d.ended_at).toLocaleString("en-US", {
        weekday: "short",
        hour: "numeric",
        minute: "2-digit",
        hour12: false,
      }),
    }))
    .reverse();
  chart.data = parsedData;

  chart.cursor = new am4charts.Cursor();

  var xAxis = chart.xAxes.push(new am4charts.CategoryAxis());
  xAxis.dataFields.category = "ended_at";
  xAxis.title.text = "Time";
  xAxis.renderer.line.strokeOpacity = 1;
  xAxis.renderer.line.strokeWidth = 2;

  var yAxis = chart.yAxes.push(new am4charts.ValueAxis());
  yAxis.title.text = "Score";
  yAxis.renderer.line.strokeOpacity = 1;
  yAxis.renderer.line.strokeWidth = 2;
  yAxis.cursorTooltipEnabled = false;

  var scoreSeries = chart.series.push(new am4charts.LineSeries());
  scoreSeries.name = "Score";
  scoreSeries.dataFields.valueY = "score";
  scoreSeries.dataFields.categoryX = "ended_at";
  scoreSeries.tooltip.dx = -15;
  scoreSeries.tooltip.pointerOrientation = "right";
  scoreSeries.tooltip.ignoreBounds = true;
  scoreSeries.tooltip.tooltipText = "{valueY}";
  scoreSeries.numberFormatter = new am4core.NumberFormatter();
  scoreSeries.numberFormatter.numberFormat = "#";
  var bullets = scoreSeries.bullets.push(new am4charts.CircleBullet());
  bullets.strokeWidth = 2;
  bullets.setStateOnChildren = true;
  var hoverState = bullets.states.create("hover");
  hoverState.properties.scale = 1.5;

  if (benchmark.accuracy !== "redundant") {
    var leftAxis = chart.yAxes.push(new am4charts.ValueAxis());
    leftAxis.renderer.opposite = true;
    leftAxis.title.text = "Accuracy";
    leftAxis.renderer.line.strokeOpacity = 1;
    leftAxis.renderer.line.strokeWidth = 2;
    leftAxis.cursorTooltipEnabled = false;
    // leftAxis.renderer.grid.template.disabled = true;
    leftAxis.syncWithAxis = yAxis;

    var accSeries = chart.series.push(new am4charts.LineSeries());
    accSeries.name = "Accuracy";
    accSeries.setYAxis(leftAxis);
    accSeries.dataFields.valueY = "accuracy";
    accSeries.dataFields.categoryX = "ended_at";
    accSeries.numberFormatter = new am4core.NumberFormatter();
    accSeries.numberFormatter.numberFormat = "#.";

    scoreSeries.dataFields.accY = "accuracy";
    scoreSeries.tooltipText = "{name}: {valueY}\nAccuracy: {accY.formatNumber('#.')}%";

    if (benchmark.accuracy) {
    }
  }

  // w.scoreSeries.template.tooltipText = "Series: {name}\nCategory: {categoryX}\nValue: {valueY}";
};
