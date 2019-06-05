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
                    backgroundColor: "#F95959",
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


function refreshClassProbChart(id, probs){
    var data = new Array();
    data["labels"] = Object.keys(probs[0]["probs"]).sort();
    data["datasets"] =  new Array();
    var colors = ["#428bca", "#F95959"];
    for(var i in probs){
        var method_prob = probs[i];
        var scores = new Array();
        for(var j in data["labels"]){
            scores.push(method_prob["probs"][data["labels"][j]]);
        }
        data["datasets"].push({
            label: method_prob["method"],
            data: scores,
            borderWidth: 1,
            backgroundColor: colors[i],
            borderColor: colors[i]
        });
    }
    var classProbCtx = document.getElementById(id).getContext('2d');
    var config = {
        type: "bar",
        data: data, 
        options: {
            responsive: true,
            legend: {
                position: "top",
            },
            title: {
                display: true,
                text: "分类概率"
            }
        }
    };
    return new Chart(classProbCtx, config);
}



function refreshAttnChart_wxy(id, attns){
    var labels = new Array();
    for(var i in attns){
        labels[i] = "视图"+i;
    }
    var attnCtx = document.getElementById(id).getContext("2d");
    return new Chart(attnCtx, {
        type: "bar",
        data: {
            "labels": labels,
            "datasets": [
                {
                    label: "ViewAttention",
                    data: attns,
                    borderWidth: 1,
                    backgroundColor: "#428bca",
                    borderColor: "#428bca"
                }  
            ]
        }, 
        options: {
            responsive: true,
            legend: {
                position: "top",
            },
            title: {
                display: true,
                text: "注意力权重"
            },
            scales: {
                xAxes: [{
                    stacked: true,
                }],
                yAxes: [{
                    stacked: true
                }]
            }
        }
    });
}


function refreshAttnChart_smy(id, class_names, attns, legendClickCallback){
    var labels = new Array();
    for(var i in attns[0]["attn_weights"]){
        labels[i] = "视图"+i;
    }
    var attnCtx = document.getElementById(id).getContext("2d");
    var datasets = new Array();
    var colors = ["#428bca", "#F95959", 'rgb(255, 99, 132)', 'rgb(255, 159, 64)', 'rgb(255, 205, 86)', 'rgb(75, 192, 192)', 'rgb(54, 162, 235)', 'rgb(153, 102, 255)', 'rgb(201, 203, 207)', "#8549ba"];
    for(var i in attns){
        datasets.push({
            label: class_names[i],
            data: attns[i]["attn_weights"],
            borderWidth: 1,
            backgroundColor: colors[i],
            borderColor: colors[i],
        });
    }
    var defaultLegendClickHandler = Chart.defaults.global.legend.onClick;
    return new Chart(attnCtx, {
        type: "bar",
        data: {
            "labels": labels,
            "datasets": datasets,
        }, 
        options: {
            responsive: true,
            legend: {
                position: "top",
                onClick: function(e, legendItem){
                    var ci = this.chart;
                    var index = legendItem.datasetIndex;
                    var meta = ci.getDatasetMeta(index);
                    console.log("meta.hidden", meta.hidden);
                    // var datasets_chart = this.config.data.datasets;
                    for(var i in attns){
                        ci.getDatasetMeta(i).hidden = true;
                    }
                    // datasets.forEach(function (dataset, i) { });
                    meta.hidden = null;
                    // defaultLegendClickHandler(e, legendItem);
                    ci.update();
                    legendClickCallback(index);
                }
            },
            title: {
                display: true,
                text: "注意力权重"
            },
            scales: {
                xAxes: [{
                    stacked: true,
                }],
                yAxes: [{
                    stacked: true
                }]
            }
        }
    });
}


function refreshCompareNeighFeatureChart(id, labels, features_gt, features_pred){
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
                    label: "前视图真实特征",
                    fill: false,
                    backgroundColor: "#428bca",
                    borderColor: "#428bca",
                    data: features_gt[0],
                    pointRadius: radius,
                }, {
                    label: "前视图预测特征",
                    fill: false,
                    backgroundColor: "#F95959",
                    borderColor: "#F95959",
                    data: features_pred[0],
                    pointRadius: radius,
                }, {
                    label: "后视图真实特征",
                    fill: false,
                    backgroundColor: "#FF7C98",
                    borderColor: "#FF7C98",
                    data: features_gt[1],
                    pointRadius: radius,
                }, {
                    label: "后视图预测特征",
                    fill: false,
                    backgroundColor: "#a4dfdf",
                    borderColor: "#a4dfdf",
                    data: features_pred[1],
                    pointRadius: radius,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                title:{
                    display:false,
                    text:'上下文视图特征重建'
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