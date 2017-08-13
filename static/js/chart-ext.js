function refreshFeatureChart(id, labels, data){
    var radius = [];
    for(var i=0;i<labels.length;++i){
        radius.push(0);
    }
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
                    pointRadius: radius,
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
                            labelString: '维度'
                        }
                    }],
                    yAxes: [{
                        display: true,
                        scaleLabel: {
                            display: true,
                            labelString: '值'
                        }
                    }]
                }
            }
        };
        return new Chart(featureCtx, config);
}

function refreshCompareFeatureChart(id, labels , data1, data2){
    var radius = [];
    for(var i=0;i<labels.length;++i){
        radius.push(0);
    }
  var featureCtx = document.getElementById(id).getContext('2d');
  var config = {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: "上传模型",
                    fill: false,
                    backgroundColor: "#428bca",
                    borderColor: "#428bca",
                    data: data1,
                    pointRadius: radius,
                }, {
                    label: "结果模型",
                    fill: false,
                    backgroundColor: "##F95959",
                    borderColor: "#F95959",
                    data: data2,
                    pointRadius: radius,
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
                    display: true,
                },
                scales: {
                    xAxes: [{
                        display: true,
                        scaleLabel: {
                            display: true,
                            labelString: '维度'
                        }
                    }],
                    yAxes: [{
                        display: true,
                        scaleLabel: {
                            display: true,
                            labelString: '值'
                        }
                    }]
                }
            }
        };
        return new Chart(featureCtx, config);
}