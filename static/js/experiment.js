
window.chartColors = {
	red: 'rgb(255, 99, 132)',
	orange: 'rgb(255, 159, 64)',
	yellow: 'rgb(255, 205, 86)',
	green: 'rgb(75, 192, 192)',
	blue: 'rgb(54, 162, 235)',
	purple: 'rgb(153, 102, 255)',
	grey: 'rgb(201, 203, 207)'
};
$(document).ready(function () {
	var prCtx = document.getElementById("prChart").getContext('2d');
	var config40 = getPRConfig([1.0, 0.8987, 0.8734, 0.8458, 0.8082, 0.7830, 0.7593, 0.7347, 0.6956, 0.4399, 0.0348],
                                [1.0, 0.9212, 0.916, 0.894, 0.8559, 0.8343, 0.8157, 0.8016, 0.7883, 0.7302, 0.0376],
                                [1.0, 0.9294, 0.9202, 0.9021, 0.8656, 0.8456, 0.8282, 0.8126, 0.7977, 0.7655, 0.0371],
                                'PR-Curve-ModelNet40');
    window.prChart = new Chart(prCtx, config40);

    var prCtx10 =  document.getElementById("prCanvas10").getContext('2d');
    var config10 = getPRConfig([1.0, 0.9210, 0.9100, 0.9010, 0.8943, 0.8851, 0.8690, 0.8529, 0.8356, 0.7396, 0.1031],
                                [1.0, 0.9222, 0.9122, 0.9070, 0.9028, 0.8988, 0.8789, 0.8663, 0.8516, 0.7951, 0.1093],
                                [1.0, 0.9377, 0.9302, 0.9259, 0.9220, 0.9164, 0.8960, 0.8808, 0.8668, 0.8329, 0.1284],
                                'PR-Curve-ModelNet10');
    window.prChart10 = new Chart(prCtx10, config10);

    $("#fancy-checkbox-primary").change(function() {
        togglePrChartFill(this.checked);
    });
});

function getPRConfig(P1, P2, P3, title){
    var config = {
            type: 'line',
            data: {
                labels: ["0", "0.1", "0.2", "0.3", "0.4", "0.5", "0.6", "0.7", "0.8", "0.9", "1.0"],
                datasets: [{
                    label: "王曦阳",
                    backgroundColor: window.chartColors.red,
                    borderColor: window.chartColors.red,
                    data: P1,
                    fill: true,
                }, {
                    label: "商明阳",
                    fill: true,
                    backgroundColor: window.chartColors.blue,
                    borderColor: window.chartColors.blue,
                    data: P2,
                }, {
                	label: "陆宏磊",
                    fill: true,
                    backgroundColor: window.chartColors.green,
                    borderColor: window.chartColors.green,
                    data: P3,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                title:{
                    display:true,
                    text:title,
                },
                tooltips: {
                    mode: 'index',
                    intersect: false,
                },
                hover: {
                    mode: 'nearest',
                    intersect: true
                },
                scales: {
                    xAxes: [{
                        display: true,
                        scaleLabel: {
                            display: true,
                            labelString: 'Recall'
                        }
                    }],
                    yAxes: [{
                        display: true,
                        scaleLabel: {
                            display: true,
                            labelString: 'Precision'
                        }
                    }]
                }
            }
        };
    return config;
}

function togglePrChartFill(isFill){
	window.prChart.data.datasets.forEach((dataset) => {
		dataset.fill = isFill;
	});
	window.prChart.update();
	window.prChart10.data.datasets.forEach((dataset) => {
		dataset.fill = isFill;
	});
	window.prChart10.update();
}