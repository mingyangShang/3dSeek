
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
                        1.0, 0.95, 0.89, 0.85, 0.82, 0.78, 0.70, 0.68, 0.66, 0.62, 0.58
                        //randomScalingFactor(),
                        //randomScalingFactor(),
                        //randomScalingFactor(),
                        //randomScalingFactor(),
                        //randomScalingFactor(),
                        //randomScalingFactor(),
                        //randomScalingFactor(),
                        //randomScalingFactor(),
                        //randomScalingFactor(),
                        //randomScalingFactor()
                    ],
                    fill: true,
                }, {
                    label: "商明阳",
                    fill: true,
                    backgroundColor: window.chartColors.blue,
                    borderColor: window.chartColors.blue,
                    data: [
                        //randomScalingFactor(),
                        //randomScalingFactor(),
                        //randomScalingFactor(),
                        //randomScalingFactor(),
                        //randomScalingFactor(),
                        //randomScalingFactor(),
                        //randomScalingFactor(),
                        //randomScalingFactor(),
                        //randomScalingFactor(),
                        //randomScalingFactor()
                        1.0, 0.98, 0.95, 0.88, 0.81, 0.75, 0.72, 0.65, 0.62, 0.55, 0.51
                    ],
                }, {
                	label: "陆宏磊",
                    fill: true,
                    backgroundColor: window.chartColors.green,
                    borderColor: window.chartColors.green,
                    data: [
                        //randomScalingFactor(),
                        //randomScalingFactor(),
                        //randomScalingFactor(),
                        //randomScalingFactor(),
                        //randomScalingFactor(),
                        //randomScalingFactor(),
                        //randomScalingFactor(),
                        //randomScalingFactor(),
                        //randomScalingFactor(),
                        //randomScalingFactor()
                        1.0, 0.96, 0.94, 0.89, 0.84, 0.8, 0.75, 0.68, 0.60, 0.54, 0.50
                    ],
                }]
            },
            options: {
                responsive: true,
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