function refreshFeatureChart(id, labels, data){
  var featureCtx = document.getElementById(id).getContext('2d');
  var config = {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: "检索模型",
                    fill: false,
                    backgroundColor: "#428bca",
                    borderColor: "#428bca",
                    data: data,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                title:{
                    display:false,
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
                legend: {
                    display: false,
                },
                scales: {
                    xAxes: [{
                        display: true,
                        scaleLabel: {
                            display: true,
                            labelString: 'Dimension'
                        }
                    }],
                    yAxes: [{
                        display: true,
                        scaleLabel: {
                            display: true,
                            labelString: 'Value'
                        }
                    }]
                }
            }
        };
        return new Chart(featureCtx, config);
}