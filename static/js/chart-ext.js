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
        for(var class_name in method_prob["probs"]){
            scores.push(method_prob["probs"][class_name]);
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


function refreshCompareFeatureChart(id, labels, feature1, feature2){
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
                    data: feature1["gt_feature"],
                    pointRadius: radius,
                }, {
                    label: "前视图预测特征",
                    fill: false,
                    backgroundColor: "#F95959",
                    borderColor: "#F95959",
                    data: feature1["pred_feature"],
                    pointRadius: radius,
                }, {
                    label: "后视图真实特征",
                    fill: false,
                    backgroundColor: "#FF7C98",
                    borderColor: "#FF7C98",
                    data: feature2["gt_feature"],
                    pointRadius: radius,
                }, {
                    label: "后视图预测特征",
                    fill: false,
                    backgroundColor: "#a4dfdf",
                    borderColor: "#a4dfdf",
                    data: feature2["pred_feature"],
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