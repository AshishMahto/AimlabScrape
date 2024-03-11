let doFirstTime = (window) => {
  window.am4core.addLicense("CHEESECAKE");
  // am4core.useTheme(w.am4themes_animated);
  doFirstTime = () => false;
  return true;
};

/** @type {Record<string, Parameters<typeof Date.prototype.toLocaleString>[1] >} */
const dateFormat = {
  week: {
    weekday: "short",
    hour: "numeric",
    minute: "2-digit",
    hour12: false,
  },
  month: {
    month: "numeric",
    day: "2-digit",
    hour: "numeric",
    minute: "2-digit",
    hour12: false,
  },
  year: {
    year: "2-digit",
    month: "numeric",
    day: "2-digit",
    hour: "numeric",
    minute: "2-digit",
    hour12: false,
  },
};

/**
 *
 * @param {(Play & {color?: any})[]} data
 * @param {typeof benchmarks[0] & {accuracy?: any}} benchmark
 * @param {string} timeframe
 * @param {any} window Window
 */
var makeChart = function (data, benchmark, timeframe, window) {
  const am4charts = window.am4charts;
  const am4core = window.am4core;

  const add = {
    bullets(series) {
      const bullets = series.bullets.push(new am4charts.CircleBullet());
      bullets.strokeWidth = 2;
      bullets.setStateOnChildren = true;
      bullets.states.create("hover").properties.scale = 1.5;
      return bullets;
    },
    yAxis() {
      const yAxis = chart.yAxes.push(new am4charts.ValueAxis());
      yAxis.renderer.line.strokeOpacity = 1;
      yAxis.renderer.line.strokeWidth = 2;
      yAxis.cursorTooltipEnabled = false;
      return yAxis;
    },
    series(valueY, numberFormat) {
      var series = chart.series.push(new am4charts.LineSeries());
      series.name = valueY.charAt(0).toUpperCase() + valueY.slice(1);
      series.dataFields.valueY = valueY;
      series.dataFields.categoryX = "ended_at";
      series.dataFields.dateX = "ended_at";
      series.numberFormatter = new am4core.NumberFormatter();
      series.numberFormatter.numberFormat = numberFormat;
      series.tooltip.dx = -15;
      series.tooltip.pointerOrientation = "right";
      return series;
    },
  };

  doFirstTime(window);

  window.chart?.dispose();
  const chart = (window.chart = am4core.create("chartdiv", am4charts.XYChart));

  const orange = am4core.color("#FFC040");

  const parsedData = data.reverse().map((d) => ({
    ...d,
    ended_at: new Date(d.ended_at).toLocaleString("en-US", dateFormat[timeframe]),
    color: d.accuracy < (Number.parseInt(benchmark.accuracy) || 0) ? am4core.color("#FF0000") : orange,
  }));

  chart.cursor = new am4charts.Cursor();

  var xAxis = chart.xAxes.push(new am4charts.CategoryAxis());
  xAxis.dataFields.category = "ended_at";
  xAxis.dataFields.date = "ended_at";
  xAxis.title.text = "Time";
  xAxis.renderer.line.strokeOpacity = 1;
  xAxis.renderer.line.strokeWidth = 2;

  var yAxis = add.yAxis();
  yAxis.title.text = "Score";

  var scoreSeries = add.series("score", "#");
  scoreSeries.tooltipText = "{valueY}";

  var bullets = add.bullets(scoreSeries);

  if (benchmark.accuracy !== "redundant") {
    var leftAxis = add.yAxis();
    leftAxis.title.text = "Accuracy";
    leftAxis.renderer.opposite = true;
    leftAxis.syncWithAxis = yAxis;

    var accSeries = add.series("accuracy", "#.00'%'");
    accSeries.stroke = orange;
    accSeries.setYAxis(leftAxis);
    accSeries.tooltip.getFillFromObject = false;
    accSeries.tooltip.background.fill = orange;
    accSeries.tooltip.label.fill = am4core.color("#000000");
    accSeries.tooltipText = "{name}: {valueY}";
    scoreSeries.tooltipText = "{name}: {valueY}";

    var bullets = add.bullets(accSeries);
    bullets.propertyFields.fill = "color";
    bullets.propertyFields.stroke = "color";

    if (benchmark.accuracy && typeof benchmark.accuracy === "number") {
      const range = leftAxis.axisRanges.create();
      range.endValue = benchmark.accuracy;
      range.value = 0;
      range.axisFill.fill = am4core.color("#FF0000");
      range.axisFill.fillOpacity = 0.1;
    }
  }
  chart.data = parsedData;
};
