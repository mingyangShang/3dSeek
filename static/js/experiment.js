
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
	var config = {
            type: 'line',
            data: {
                labels: ["0", "0.1", "0.2", "0.3", "0.4", "0.5", "0.6", "0.7", "0.8", "0.9", "1.0"],
                datasets: [{
                    label: "王曦阳",
                    backgroundColor: window.chartColors.red,
                    borderColor: window.chartColors.red,
                    data: [
                        1.0, 0.8987, 0.8734, 0.8458, 0.8082, 0.7830, 0.7593, 0.7347, 0.6956, 0.4399, 0.0348
                    ],
                    fill: true,
                }, {
                    label: "商明阳",
                    fill: true,
                    backgroundColor: window.chartColors.blue,
                    borderColor: window.chartColors.blue,
                    data: [
                        1.0, 0.9212, 0.916, 0.894, 0.8559, 0.8343, 0.8157, 0.8016, 0.7883, 0.7302, 0.0376
                    ],
                }, {
                	label: "陆宏磊",
                    fill: true,
                    backgroundColor: window.chartColors.green,
                    borderColor: window.chartColors.green,
                    data: [
                        1.0, 0.9294, 0.9202, 0.9021, 0.8656, 0.8456, 0.8282, 0.8126, 0.7977, 0.7655, 0.0371
                    ],
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                title:{
                    display:true,
                    text:'PR-curve'
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
        window.prChart = new Chart(prCtx, config);

        $("#fancy-checkbox-primary").change(function() {
        	togglePrChartFill(this.checked);
		});
});



function randomScalingFactor(){
	return (Math.random() > 0.5 ? 1.0 : -1.0) * Math.round(Math.random() * 100);
}

function togglePrChartFill(isFill){
	window.prChart.data.datasets.forEach((dataset) => {
		dataset.fill = isFill;
	});
	window.prChart.update();
}