examples = ["football game", "man riding bike", "red shirt", "dog catching balls", "two men", "busy street", "sand", "water"];
current_page = 1;
server = "http://166.111.80.36:8889/";
current_method = "cmst";

lastUID = "";

textQueryData = null;
hasTextQueryResult = false;
vis_data = null;

lastQueryText = "";

vis_fid = [];


var setsData, classesData;
var isHomePage = true;
var homePageSize = 48, searchPageSize = 48;
var modelImgsTimer;
var modelImgsTimerCount = 0;
window.author = "smy";
var currModelInfo;
var currMethod;

function hideAll(){
    $("#search-result").hide();
}
function showAll(){
    $("#search-result").show();
}

(function ($) {
    $(document).ready(function () {
        $("#model-file-input").change(searchByModel);

        $("#submit_button").click(function () {
            var queryText = $("#query_text").val();
            if(queryText){
                search("url", queryText, null);
            }
        });

        $("#bigImgModal .close").click(function(event){
            $("#bigImgModal").css("display", "none");
        });

        $("#switch_from_view").click(function(event){
            if(window.searchingMethod == "SeqViews2SeqLabels" || window.searchingMethod == "3DViewGraph"){
                $("#feature_wrapper").show();
                feature_vis("featureChart", window.search_result.features);
            }else{
               $("#midview_wrapper").show();
               if(window.author == "smy"){
                    predictCenterView(window.search_result.center_view_recon);
               }else{
                    predictView_wxy(window.searchingMethod.view_recon);
               }
            }
        });
        $("#switch_to_attention").click(function(event){
            $("#attention_wrapper").show();
            refreshAttn(window.search_result.attns);
        });
        $("#switch_to_feature_recon").click(function(event){
            $("#feature_recon_wrapper").show();
            predictNeighFeature("midFeatureChart", window.search_result.neighbour_feature_recon);
            
        });
        $("#switch_to_classification").click(function(event){
            $("#classification_wrapper").show();
            refreshClassProbChart("classificationChart", window.search_result.probs);
        });
        $("#switch_to_classification2").click(function(event){
            $("#classification_wrapper").show();
            refreshClassProbChart("classificationChart", window.search_result.probs);
        });
        $("#switch_to_retrieval").click(function(event){
            $("#retrieval_wrapper").show();
            refreshModelsList(window.search_result["retrieval"]["models"]);
            refreshPageNav(window.search_result);
        });

        $("#closeCompareChart").click(function(){
          $("#compareModal").css("display", "none");
        });
        $("#close-viewer").click(closeModelViewer);

        hideAll();

        $("#vis_button").click(function(){
            var currModel = {"dataset": "modelnet10", "class_name": "unknown", "name": window.model_name.slice(0, -4)}
            openModelViewer(currModel);
        });

        $("#viewerSourceButton").click(function(){
          //在新窗口中打开
            window.location.href = "/viewer?"+"dataset="+currModelInfo.dataset+"&class_name="+currModelInfo.class_name+"&model_name="+currModelInfo.name+"&method="+currMethod+"&author="+window.author;
        });

        $("#recon-li").hide();
        $("#queryModelCanvas").mouseenter(function(){
          if(window.controls){
            window.controls.enabled = true;
          }
        }).mouseout(function(){
          if(window.controls){
            window.controls.enabled = false;
          }
        });
    });
}(jQuery));


function drawScatter(points, labels) {
    var tooltip_image = "";
    var ctx = document.getElementById("vis_chart").getContext('2d');
    Chart.defaults.global.defaultFontSize = 20;
    Chart.defaults.global.elements.point.radius = 5;
    Chart.defaults.global.elements.point.hoverRadius = 7;
    var query_data = {
        label: labels[0],
        data: [],
        backgroundColor: [],
        pointRadius: 8,
        pointHoverRadius: 10
    };
    query_data.data.push({x: points[0][0], y: points[0][1]});
    query_data.backgroundColor.push('rgba(255,99,132,1)');


    var retrieval_data = {
        label: labels[1],
        data: [],
        backgroundColor: [],
    };
    for (var i = 1; i < points.length; i++)
    {
        retrieval_data.data.push({x: points[i][0], y: points[i][1]});
        retrieval_data.backgroundColor.push('rgba(54,162,251,1)');
    }

    var scatterChart = new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: [query_data, retrieval_data]
        },
        options: {
            scales: {
                xAxes: [{
                    type: 'linear',
                    position: 'bottom'
                }]
            },
            title: {
                display: true,
                text: "查询：" + lastQueryText,
                fontSize: 24
            },
            tooltips: {
                // Disable the on-canvas tooltip
                enabled: false,

                callbacks: {
                    label: function(tooltipItem, data) {
                        console.log(tooltipItem.datasetIndex + " : " + tooltipItem.index);
                        tooltip_image = textQueryData[tooltipItem.index]['filename'];
                        return "";
                    }
                },

                custom: function(tooltipModel) {
                    // Tooltip Element
                    var tooltipEl = document.getElementById('chartjs-tooltip');

                    // Create element on first render
                    if (!tooltipEl) {
                        tooltipEl = document.createElement('div');
                        tooltipEl.id = 'chartjs-tooltip';
                        tooltipEl.innerHTML = "<img id='tooltip_img' style='max-width: 200px; max-height: 200px;'></img>";
                        document.body.appendChild(tooltipEl);
                    }

                    // Hide if no tooltip
                    if (tooltipModel.opacity === 0) {
                        tooltipEl.style.opacity = 0;
                        return;
                    }

                    // Set caret Position
                    tooltipEl.classList.remove('above', 'below', 'no-transform');
                    if (tooltipModel.yAlign) {
                        tooltipEl.classList.add(tooltipModel.yAlign);
                    } else {
                        tooltipEl.classList.add('no-transform');
                    }

                    function getBody(bodyItem) {
                        return bodyItem.lines;
                    }

                    // Set Image
                    if (tooltipModel.body) {
                        $("#tooltip_img").attr("src", server + tooltip_image);
                    }

                    console.log(tooltipModel.title);

                    // `this` will be the overall tooltip
                    var position = this._chart.canvas.getBoundingClientRect();
                    // Display, position, and set styles for font
                    tooltipEl.style.opacity = 1;
                    tooltipEl.style.position = 'absolute';
                    tooltipEl.style.left = 5 + window.scrollX + position.left + tooltipModel.caretX + 'px';
                    tooltipEl.style.top = window.scrollY + position.top + tooltipModel.caretY + 'px';
                    tooltipEl.style.fontFamily = tooltipModel._bodyFontFamily;
                    tooltipEl.style.fontSize = tooltipModel.bodyFontSize + 'px';
                    tooltipEl.style.fontStyle = tooltipModel._bodyFontStyle;
                    tooltipEl.style.padding = "0px 0px";
                }
            }
        }
    });
}

function drawBarChart(points, labs)
{
    var ctx = document.getElementById("vis_chart").getContext('2d');
    Chart.defaults.global.defaultFontSize = 20;

    var dataset = [];
    var colors = ['rgba(255,99,132,1)', 'rgba(54,162,251,1)', 'rgba(0,20,255,1)'];
    var x_labels = [];
    for (var k = 0; k < points[0].length; k++)
    {
        x_labels.push(k);
    }

    for(var i = 0; i < 3; i++)
    {
        var dt = {label: labs[i], data: [], backgroundColor: colors[i]};
        for(var j = 0; j < points[i].length; j++)
        {
            dt.data.push(points[i][j]);
        }
        dataset.push(dt);
    }

    var lineChart = new Chart(ctx, {
        type: 'bar',
        data: {
            datasets: dataset,
            labels: x_labels
        },
        options: {
            scales: {
                xAxes: [{
                    stacked: true
                }],
                yAxes: [{
                    stacked: true
                }]
            },
            title: {
                display: true,
                text: "联合语义空间特征(" + labs.length + "个样本)",
                fontSize: 24
            },
        }
    });
}

function drawLineChart(points, labels)
{
    var ctx = document.getElementById("vis_chart").getContext('2d');
    Chart.defaults.global.defaultFontSize = 20;

    var dataset = [];
    var colors = ['rgba(255,99,132,1)', 'rgba(54,162,251,1)', 'rgba(255,127,39,1)', 'rgba(255,174,201,1)', 'rgba(163,73,164,1)'];

    var i = labels.length - 1;
    var dt = {label: labels[i], data: [], borderColor: 'rgba(0,0,0,1)', fill: false};
    for(var j = 0; j < points[i].length; j++)
    {
        dt.data.push({x: j, y: points[i][j]});
    }
    dataset.push(dt);

    for(var i = 0; i < labels.length - 1; i++)
    {
        var dt = {label: labels[i], data: [], borderColor: colors[i], fill: false};
        for(var j = 0; j < points[i].length; j++)
        {
            dt.data.push({x: j, y: points[i][j]});
        }
        dataset.push(dt);
    }

    var lineChart = new Chart(ctx, {
        type: 'line',
        data: {
            datasets: dataset
        },
        options: {
            scales: {
                xAxes: [{
                    type: 'linear',
                    position: 'bottom'
                }]
            },
            title: {
                display: true,
                text: "联合语义空间特征(" + labels.length + "个样本)",
                fontSize: 24
            },
        }
    });
}

function doVis()
{
    console.log("DOVIS");
    var imageQueryBackend = "http://166.111.80.36:8889/get_sem_feat"; // 接收上传文件的后台地址
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function()
    {
        if (xhr.readyState==4 && xhr.status==200)
        {
            vis_data = JSON.parse(xhr.responseText);
            var lis = $("#selected_samples li");
            var lbls = [];
            for (var k = 0 ; k < lis.length; k++)
            {
                lbls.push(lis[k].innerText);
            }
            lbls.push("查询");
            console.log("LIST: " + lbls);
            drawLineChart(vis_data, lbls);
        }
        else if (xhr.status > 200) {
            alert("服务器错误");
        }
    }
    xhr.open("post", imageQueryBackend, true);

    if(lastUID == "")
    {
        uuid();
    }

    final_fid = new Set(vis_fid);
    final_fid = Array.from(final_fid);

    xhr.send("type="+lastQueryType+"&method="+current_method+"&uuid="+lastUID+"&ids="+final_fid.join(','));

    console.log("VIS: " + "type="+lastQueryType+"&method="+current_method+"&uuid="+lastUID+"&ids="+final_fid.join(','));

    hide_blocks([".text_query_result", ".big_image_display", "#server_message", ".image_query_result"]);
    show_blocks([".vis_display"]);
}

function pageSwitch(pg)
{
    var imageQueryBackend = "http://166.111.80.36:8889/page"; // 接收上传文件的后台地址
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function()
    {
        if (xhr.readyState==4 && xhr.status==200)
        {
            if(lastQueryType == 'text')
            {
                onTextQueryResult(lastUID, xhr.responseText);
            }
            else if(lastQueryType == 'image')
            {
                onImageQueryResult(lastUID, xhr.responseText);
            }
        }
    }
    xhr.open("post", imageQueryBackend, true);

    xhr.send("type="+lastQueryType+"&uuid="+lastUID+"&page="+pg);
}

function doTSNE()
{
    var imageQueryBackend = "http://166.111.80.36:8889/tsne"; // 接收上传文件的后台地址
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function()
    {
        if (xhr.readyState==4 && xhr.status==200)
        {
            vis_data = JSON.parse(xhr.responseText);
            drawScatter(vis_data, ["文本查询", "图像结果"]);
        }
    }
    xhr.open("post", imageQueryBackend, true);
    fid = [];
    for (var i = 0; i < 36; i++)
    {
        fid.push(i);
    }

    if(lastUID == "")
    {
        uuid();
    }
    xhr.send("type="+lastQueryType+"&method="+current_method+"&uuid="+lastUID+"&page="+current_page);

    console.log("TSNE");

    hide_blocks([".text_query_result", ".big_image_display", "#server_message", ".image_query_result"]);
    show_blocks([".vis_display"]);
}

function select_samples()
{
    selecting = true;
    $(".vis_selector").show();
}


$("#vis_pop_button").click(function () {
        if($(".vis_display").css("display") == 'none')
        {
            doVis();
            vis_fid = [];
            $("#vis_pop_button").text("返回");
        }
        else {
            vis_fid = [];
            hide_blocks([".vis_display", ".text_query_result", ".big_image_display", "#server_message", ".image_query_result"]);
            if(lastQueryType == 'text')
            {
                show_blocks([".text_query_result"]);
            }
            else
            {
                show_blocks([".image_query_result"]);
            }
            $("#vis_pop_button").text("绘制");
        }
    }
);

$("#upload_button").hover(function () {
    $(this).attr("src", "../static/img/upload_hover.png");
}, function () {
    $(this).attr("src", "../static/img/upload.png");
});

$("#upload_button").click(function (){
    $("#model-file-input").click();
});



$("#vis_button").click(function () {
    //doVis();
    if(!selecting)
    {
        selecting = true;
        vis_fid = [];
        $(".vis_selector").show();
    }
    else
    {
        selecting = false;
        vis_fid = [];
        $(".vis_selector").hide();
    }
});

$("#tsne_button").click(function () {
    doTSNE();
});

$("#query_text").keydown(function (k) {
    var code = k.keyCode || k.which || k.charCode;
    if (code == 13) {
        $("#submit_button").click();
        return false;
    }
});

$("#use_cbowalign").click(function () {
    current_method = "cbow";
});

$("#use_cmst").click(function () {
    current_method = "cmst";
});

$("#use_acmr").click(function () {
    current_method = "acmr";
});

function nextPage(){
    if(current_page < 10)
    {
        current_page += 1;
        $("#prev").attr("style", "");
        pageSwitch(current_page);
    }
    if(current_page == 10)
    {
        $("#next").css("color", "gray");
    }
    else
    {
        $("#next").attr("style", "");
    }
    $("#cpage").html(current_page);
}

function prevPage(){
    if(current_page > 1)
    {
        current_page -= 1;
        $("#next").attr("style", "");
        pageSwitch(current_page);
    }
    if(current_page == 1)
    {
        $("prev").css("color", "gray");
    }
    else
    {
        $("prev").attr("style", "");
    }

    $("#cpage").html(current_page);
}


// 创建模型或者视图div
function newModelDiv(data, is_model=false){
  var modelDiv = document.createElement("div");
  
  // if(row_md == 3){
  //     $(modelDiv).addClass("col-md-3");
  // }else if(row_md == 2){
  //     $(modelDiv).addClass("col-md-2");
  // }
  $(modelDiv).addClass("col-md-3");
    var modelImg = document.createElement("img");
    $(modelImg).addClass("img-thumbnail model-img");
    if(!is_model){
        $(modelDiv).addClass("view-col");
        $(modelImg).attr("src", data.view_url);
        $(modelImg).attr("height", "100");
        $(modelImg).attr("alt", "view" + (data.view_index+1));
    }else{
        $(modelDiv).addClass("model-col");
        $(modelImg).attr("src", data.view_urls[0]);
        $(modelImg).attr("height", "236");
        $(modelImg).attr("alt", "Model view");
    }
    
    
  $(modelDiv).append(modelImg);
  $(modelDiv).append("<br />");
  if(is_model){
      model = data;
      var infoDiv = document.createElement("div");
      $(infoDiv).addClass("center");
          var tagSpan = document.createElement("span");
          $(tagSpan).addClass("model-tag label label-default");
          $(tagSpan).text(model.class_name);
          var downloadA = document.createElement("a");
          var downloadBtn = document.createElement("button");
          $(downloadBtn).addClass("btn btn-primary btn-md btn-download");
          $(downloadBtn).text("下载");
          $(downloadA).attr("href", model.download_url);
          $(downloadA).append(downloadBtn);

          var compareBtn = document.createElement("button");
          $(compareBtn).text("对比");
          $(compareBtn).addClass("btn btn-info btn-md btn-compare");
          $(compareBtn).click(function(event){
              openCompareModal($(event.target).parent().parent().data("info"));
          });
      $(infoDiv).append(tagSpan);
      $(infoDiv).append(downloadA);
      $(infoDiv).append(compareBtn);
  $(modelDiv).append(infoDiv);
}
  //绑定数据
    $(modelDiv).data("info", data);
    console.log(data);
  return modelDiv;
}

// 通过模型检索
function searchByModel(){
    console.log("search by model");
    //存下来本地要能显示，然后将模型上传到服务器上
    var filepath = $("#model-file-input").val();
    if(filepath == ""){
        // $("#uploadingFile").css("display", "none");
        // $("#searchFileName").text("未选择文件");
        return;
    }
    var file = $("#model-file-input")[0].files[0];
    // 更新上传模型的名字
    var modelNameObj = $("#query_model_name");
    modelNameObj.text(file.name);
    if((/\.(off|obj|jpg|jpeg|png)$/i).test(file.name)){
        /*$("#searchFileName").text(file.name);*/
        // $("#uploadingFile").css("display", "inline-block");
        search("file", "", file);
    }
}

// 三维模型检索
function search(type, url, file){
    console.log("search by "+type+",url="+url+",filename="+(file!=null?file.name:"NULL"));
    var method = $("#fileSearchDiv input[type=radio]:checked").val();
    console.log("searching method:", method);
    window.searchingMethod = method;
    var formData = new FormData();
    if(method == "SeqViews2SeqLabels" || method == "VIP-GAN"){
        window.author = "smy";
    }else{
        window.author = "wxy";
    }
    formData.append("author", window.author);
    formData.append("type", type);
    formData.append("method", method);
    currMethod = method;
    if(type == "url"){
        formData.append("url", url);
    }else if(type == "file"){
        formData.append("file", file);
        formData.append("name", file.name);
        window.model_name = file.name;
    }
    // hideAll();
    $.ajax({
        // Your server script to process the upload
        url: '/search',
        type: 'POST',

        // Form data
        data: formData,

        // Tell jQuery not to process data or worry about content-type
        // You *must* include these options!
        cache: false,
        contentType: false,
        processData: false,
        dataType: 'json',

        success: function(data, status, xhr){
            console.log("search result:", data);
            window.search_result = data;
            // $("#result-nav .active").removeClass("active");
            if(window.searchingMethod == "SeqViews2SeqLabels" || window.searchingMethod == "3DViewGraph"){
                $("#recon-li").hide();
                $("#recon-li").removeClass("active");
                $("#attn-li").show();
                $("#attn-li a").tab("show");
                // $("#attn-li").addClass("active");
            }else{
                $("#recon-li").show();
                $("#recon-li a").tab("show");
                $("#attn-li").hide();
                $("#attn-li").removeClass("active");
            }
            refreshQueryModelInfo(data);
            // refreshViews(data["views"]);
        },
        error: function(data, status, xhr){
          console.log("error");
          var fakeData = {
            "views": {
                "n_views": 12, 
                "imgs": [
                            {"view_url": "https://ss1.baidu.com/6ONXsjip0QIZ8tyhnq/it/u=1472516260,3403254135&fm=173&app=49&f=JPEG?w=218&h=146&s=CE3605C35A3A3896EE24C89F03001001", "view_index": 0},
                            {"view_url": "https://ss1.baidu.com/6ONXsjip0QIZ8tyhnq/it/u=1472516260,3403254135&fm=173&app=49&f=JPEG?w=218&h=146&s=CE3605C35A3A3896EE24C89F03001001", "view_index": 1},
                            {"view_url": "https://ss1.baidu.com/6ONXsjip0QIZ8tyhnq/it/u=1472516260,3403254135&fm=173&app=49&f=JPEG?w=218&h=146&s=CE3605C35A3A3896EE24C89F03001001", "view_index": 2},
                            {"view_url": "https://ss1.baidu.com/6ONXsjip0QIZ8tyhnq/it/u=1472516260,3403254135&fm=173&app=49&f=JPEG?w=218&h=146&s=CE3605C35A3A3896EE24C89F03001001", "view_index": 3},
                            {"view_url": "https://ss1.baidu.com/6ONXsjip0QIZ8tyhnq/it/u=1472516260,3403254135&fm=173&app=49&f=JPEG?w=218&h=146&s=CE3605C35A3A3896EE24C89F03001001", "view_index": 4},
                            {"view_url": "https://ss1.baidu.com/6ONXsjip0QIZ8tyhnq/it/u=1472516260,3403254135&fm=173&app=49&f=JPEG?w=218&h=146&s=CE3605C35A3A3896EE24C89F03001001", "view_index": 5},
                            {"view_url": "https://ss1.baidu.com/6ONXsjip0QIZ8tyhnq/it/u=1472516260,3403254135&fm=173&app=49&f=JPEG?w=218&h=146&s=CE3605C35A3A3896EE24C89F03001001", "view_index": 6},
                            {"view_url": "https://ss1.baidu.com/6ONXsjip0QIZ8tyhnq/it/u=1472516260,3403254135&fm=173&app=49&f=JPEG?w=218&h=146&s=CE3605C35A3A3896EE24C89F03001001", "view_index": 7},
                            {"view_url": "https://ss1.baidu.com/6ONXsjip0QIZ8tyhnq/it/u=1472516260,3403254135&fm=173&app=49&f=JPEG?w=218&h=146&s=CE3605C35A3A3896EE24C89F03001001", "view_index": 8},
                            {"view_url": "https://ss1.baidu.com/6ONXsjip0QIZ8tyhnq/it/u=1472516260,3403254135&fm=173&app=49&f=JPEG?w=218&h=146&s=CE3605C35A3A3896EE24C89F03001001", "view_index": 9},
                            {"view_url": "https://ss1.baidu.com/6ONXsjip0QIZ8tyhnq/it/u=1472516260,3403254135&fm=173&app=49&f=JPEG?w=218&h=146&s=CE3605C35A3A3896EE24C89F03001001", "view_index": 10},
                            {"view_url": "https://ss1.baidu.com/6ONXsjip0QIZ8tyhnq/it/u=1472516260,3403254135&fm=173&app=49&f=JPEG?w=218&h=146&s=CE3605C35A3A3896EE24C89F03001001", "view_index": 11},
                        ]
                }, 
            "features": {
                "feature_dim": 10,
                "feature": [1,2,3,4,5,6,7,8,9,10] 
            },
            "probs": [
                {
                    "method": "SeqViews2SeqLabels",
                    "class_num": 2,
                    "probs": {"car": 0.9, "desk": 0.1},
                },
                {
                    "method": "VIP-GAN",
                    "class_num": 2,
                    "probs": {"car": 0.6, "desk": 0.4}
                }
            ], 
            "retrieval": {
                "total_count": 1,
                "curr_count": 1,
                "curr_page": 1,
                "models": [
                    {
                        "dataset": "modelnet",
                        "size": "12M",
                        "name": "name",
                        "class_name": "car",
                        "model_url": "F:\\实验室\\毕业\\工程实践答辩\\实例\\airplane_test.off",
                        "view_urls": ["https://ss1.baidu.com/6ONXsjip0QIZ8tyhnq/it/u=1472516260,3403254135&fm=173&app=49&f=JPEG?w=218&h=146&s=CE3605C35A3A3896EE24C89F03001001"],
                        "edge_num": 100,
                        "download_url": "download url",
                        "dist": 0.2,
                        "feature": [10, 3, 1, 1,1,1,1,1,1,1,],
                        "feature_dim": 10
                    }
                ]
            },
            "center_view_recon": 
                [
                    {
                        "neighbours": ["https://ss1.baidu.com/6ONXsjip0QIZ8tyhnq/it/u=1472516260,3403254135&fm=173&app=49&f=JPEG?w=218&h=146&s=CE3605C35A3A3896EE24C89F03001001", "https://ss1.baidu.com/6ONXsjip0QIZ8tyhnq/it/u=1472516260,3403254135&fm=173&app=49&f=JPEG?w=218&h=146&s=CE3605C35A3A3896EE24C89F03001001"],
                        "gt_center": "https://ss1.baidu.com/6ONXsjip0QIZ8tyhnq/it/u=1472516260,3403254135&fm=173&app=49&f=JPEG?w=218&h=146&s=CE3605C35A3A3896EE24C89F03001001",
                        "pred_center": "https://ss1.baidu.com/6ONXsjip0QIZ8tyhnq/it/u=1472516260,3403254135&fm=173&app=49&f=JPEG?w=218&h=146&s=CE3605C35A3A3896EE24C89F03001001"
                    }
                ],
            "neighbour_feature_recon": 
            [
                {
                    "name": "https://ss1.baidu.com/6ONXsjip0QIZ8tyhnq/it/u=1472516260,3403254135&fm=173&app=49&f=JPEG?w=218&h=146&s=CE3605C35A3A3896EE24C89F03001001",
                    "pred_feature": [10, 3, 1, 1,1,1,1,1,1,1,],
                    "gt_feature": [10, 3, 1, 1,1,11,13,1,2,1,],
                    "feature_dim": 10,
                },
                {
                    "name": "https://ss1.baidu.com/6ONXsjip0QIZ8tyhnq/it/u=1472516260,3403254135&fm=173&app=49&f=JPEG?w=218&h=146&s=CE3605C35A3A3896EE24C89F03001001",
                    "pred_feature": [10, 3, 1, 1,1,1,2,3,5,1,],
                    "gt_feature": [10, 3, 1, 1,1,11,1,1,12,12],
                    "feature_dim": 10,
                }
            ]
            

          }; 
          window.search_result = fakeData;
          refreshViews(fakeData["views"]);
    }
    });
}


function refreshQueryModelInfo(info){
    showAll();
    // clear model canvas
    // var c = $("#queryModelCanvas canvas");
    // if(c.length > 0){
    //     var cxt = c[0].getContext("2d");
    //     cxt.clearRect(0, 0, c[0].width, c[0].height); 
    // }
    // var cxt=document.getElementById("queryModelCanvas").getContext("2d");
    // cxt.clearRect(0,0,$("#queryModelCanvas").width,$("#queryModelCanvas").height);  
    $("#queryModelCanvas").empty();
    showModel(info.model_url, $("#queryModelCanvas"));
    if(window.controls){
        window.controls.enabled = false;
    }
    refreshViews(info["views"]);
    feature_vis("featureChart", info.features);

    refreshAttn(info.attns);
    refreshClassProbChart("classificationChart", info.probs);
    refreshModelsList(info["retrieval"]["models"]);
    refreshPageNav(window.search_result);

    if(window.author == "smy"){
        predictCenterView(window.search_result.center_view_recon);
    }else{
        predictViews_wxy(window.search_result.view_recon);
    }
    
}

// 刷新模型视图显示
function refreshViews(data){
    var views_div = $("#model_views");
    // $("#model_views_wrapper").show();
    views_div.empty();
    for(i in data.imgs){
        views_div.append(newModelDiv(data.imgs[i], is_model=false));
    }
    $("#model_views img").click(function(event){
            $("#bigImgModal").css("display", "block");
            $("#big-img").attr("src", $(event.target).attr("src"));
    });
    $("#model_views").removeClass("loading");
}


// 特征可视化
function feature_vis(canvas_name, feature_info){
    console.log("feature vis,", feature_info);
    if(feature_info.feature_dim > 0){
        var x = [];
        for(var i=0;i<feature_info.feature_dim;++i){
            x.push(i + "");
        }
        window.featureChart = refreshFeatureChart(canvas_name, x, feature_info.feature);
    }
}

// 检索结果
function refreshModelsList(modelsList){
  //首先清空原来的模型信息
  var modelsDiv = $("#models-list");
  modelsDiv.empty();
  for(i in modelsList){
      modelsDiv.append(newModelDiv(modelsList[i], true));
  }
  $("#models-list .model-col").click(function(event){
      if(!$(event.target).is("button")){
          openModelViewer($(this).data("info"));
      }
  });
  $("#models-list .model-col").hover(hoverInModel, hoverOutModel);
  $("#models-list").removeClass("loading");
}

function refreshPageNav(pageInfo){
     //分页浏览
    $('#models-pagination').pagination({
        items: Math.ceil(pageInfo.total_count / searchPageSize),
        itemOnPage: pageInfo.curr_count,
        currentPage: pageInfo.curr_page,
        cssStyle: '',
        prevText: '<span aria-hidden="true">&laquo;</span>',
        nextText: '<span aria-hidden="true">&raquo;</span>',
        onInit: function () {
            // fire first page loading
        },
        onPageClick: function (page, evt) {
            // 向服务器请求第page页的数据
            getSearchResult(page);
        }
      });
}

function hoverInModel(event){
    views = $(this).data("info").view_urls;

    //鼠标进入时轮流播放不同视角下的截图
    modelImgsTimer = window.setInterval(function(){
        modelImgsTimerCount += 1;
        if(views.length > 0){
            $(event.target).find(".model-img").attr("src", views[modelImgsTimerCount%views.length]);
        }
    }, 1000);
}
function hoverOutModel(event){
    //鼠标离开时取消定时器，然后图像恢复默认值
    if(modelImgsTimer){
        window.clearInterval(modelImgsTimer);
        if(views.length > 0) {
            $(event.target).find(".model-img").attr("src", views[0]);
        }
    }
    modelImgsTimer = null;
    modelImgsTimerCount = 0;
}

//弹出窗口展示模型信息
function openModelViewer(modelInfo){
  //弹出窗口
  $("#viewerModal").css("display", "block");
  $("#viewerModal").addClass("in");
  var method = window.searchingMethod;
  if(method == undefined){
      method = "SeqViews2SeqLabels";
  }
  currModelInfo = modelInfo;
  $("#viewerIframe").attr("src", "/viewer?"+"dataset="+modelInfo.dataset+"&class_name="+modelInfo.class_name+"&model_name="+modelInfo.name+"&method="+method+"&author="+window.author);
}

//关闭展示模型的窗口i 
function closeModelViewer(event){
  $("#viewerModal").css("display", "none");
  $("#viewerModal").removeClass("in");
}


function openCompareModal(model){
    $("#compareModal").css("display", "block");
    var x = [];
    var query_feature = window.search_result["features"]["feature"];
    for(var i=0;i<window.search_result["features"]["feature_dim"];++i){
        x.push(i + "");
    }
    refreshCompareFeatureChart("compareCanvas", x, query_feature, model.feature);
}

//关闭展示模型的窗口i 
function closeModelViewer(event){
  $("#viewerModal").css("display", "none");
  $("#viewerModal").removeClass("in");
}

function newViewPair(views){
  var midview_panel = $("#midview_panel");
  var pairDivRow = document.createElement("div");
  $(pairDivRow).addClass("row");
  $(midview_panel).append(pairDivRow);
  var pairDiv = document.createElement("div");
  $(pairDiv).addClass("col-md-12");
  $(pairDivRow).append(pairDiv);

  var viewHints = ["前视图  ", "后视图  ", "中心视图(预测)  ", "中心视图(真实)  "];

  for(var i in views){
    var viewDiv = document.createElement("div");
    $(viewDiv).addClass("col-md-3 center");
        var viewImg = document.createElement("img");
        $(viewImg).addClass("img-thumbnail model-img");
        $(viewImg).attr("src", views[i]);
        $(viewImg).attr("height", "64px");
        $(viewImg).css("width", "64px");
        

        var viewHint = document.createElement("span");
        $(viewHint).addClass("view-hint");
        $(viewHint).text(viewHints[i]);

        $(viewDiv).append(viewHint);
        $(viewDiv).append(viewImg);

    $(pairDiv).append(viewDiv);
  }
}

// 上下文视图预测中心视图
function predictCenterView(center_view_preds){
    $("#midview_panel").empty();
    var viewHints = new Array();
    if(block_views1 === null && block_views2 === null){
        viewHints = ["前视图  ", "后视图  ", "中心视图(预测)  ", "中心视图(真实)  "];
    }else{
        viewHints = ["前视图  ", "后视图  ", "中心视图(预测)  ", "中心视图(真实)  "];
    }
    for(var i in center_view_preds){
        var pair = center_view_preds[i];
        newViewPair([pair["neighbours"], pair["gt_center"], pair["pred_center"]]);
        $("#midview_panel").append(document.createElement("hr"));
    }
}


function predictViews_wxy(view_infos){
    var container = $("#midview_panel");
    for(var i in view_info){
        var pair = view_infos[i];
        newViewPair([pair["tru_view_cur"], pair["gen_view_cur"], pair["tru_view_opp"], pair["gen_view_opp"]]);
        container.append(document.createElement("hr"));
        container.append(newBlockViews(pair["piece_i"], ["", "", "", "", "", ""]));
        container.append(document.createElement("hr"));
        container.append(newBlockViews(pair["piece_o"], ["", "", "", "", "", ""]));
    }
}

// 视图小块展示
function newBlockViews(blocks, hints){
    var pairDivRow = document.createElement("div");
    $(pairDivRow).addClass("row");
    var pairDiv = document.createElement("div");
    $(pairDiv).addClass("col-md-12");
    $(pairDivRow).append(pairDiv);

    for(var i in blocks){
        var viewDiv = document.createElement("div");
        $(viewDiv).addClass("col-md-2 center");

        var viewImg = document.createElement("img");
        $(viewImg).addClass("img-thumbnail model-img");
        $(viewImg).attr("src", blcoks[i]);
        $(viewImg).attr("height", "64px");
        $(viewImg).css("width", "64px");
        

        var viewHint = document.createElement("span");
        $(viewHint).addClass("view-hint");
        $(viewHint).text(hints[i]);

        $(viewDiv).append(viewHint);
        $(viewDiv).append(viewImg);

        $(pairDiv).append(viewDiv);
    }
    return pairDivRow;
}

// 上下文视图特征重建
function predictNeighFeature(chart_id, neigh_features){
    var x = [];
    for(var i=0;i<neigh_features[0].feature_dim;++i){
        x.push(i + "");
    }
    refreshCompareNeighFeatureChart(chart_id, x, neigh_features[0], neigh_features[1]);
}


function refreshAttn(attns){
    // attns = {
    //     "class_names": ["bus", "car"],
    //     "attn_weights": [[0.4, 0.3], [0.2, 0.5]],
    //     "max": {
    //         "attn_weight": 0.4,
    //         "view_url": "https://ss1.baidu.com/6ONXsjip0QIZ8tyhnq/it/u=1472516260,3403254135&fm=173&app=49&f=JPEG?w=218&h=146&s=CE3605C35A3A3896EE24C89F03001001"
    //     },
    //     "min": {
    //         "attn_weight": 0.3,
    //         "view_url": "https://ss1.baidu.com/6ONXsjip0QIZ8tyhnq/it/u=1472516260,3403254135&fm=173&app=49&f=JPEG?w=218&h=146&s=CE3605C35A3A3896EE24C89F03001001"
    //     }
    // };
    if(window.author == "wxy"){
        refreshAttnChart_wxy("attentionChart", attns["attn_weights"]);
        refreshImg("#max_attn_img", attns["max"]["view_url"]);
        refreshImg("#min_attn_img", attns["min"]["view_url"]);
        refreshText("#max_attn_text", attns["max"]["attn_weight"].toFixed(2));
        refreshText("#min_attn_text", attns["min"]["attn_weight"].toFixed(2));
    }else{
        refreshAttnChart_smy("attentionChart", attns[0]["class_names"], attns, function(index){
            console.log("callback index:", index);
            refreshImg("#max_attn_img", attns[index]["max"]["view_url"]);
            refreshImg("#min_attn_img", attns[index]["min"]["view_url"]);
            refreshText("#max_attn_text", attns[index]["max"]["attn_weight"].toFixed(2));
            refreshText("#min_attn_text", attns[index]["min"]["attn_weight"].toFixed(2));
        }); 
        var index = 0;
        refreshImg("#max_attn_img", attns[index]["max"]["view_url"]);
        refreshImg("#min_attn_img", attns[index]["min"]["view_url"]);
        refreshText("#max_attn_text", attns[index]["max"]["attn_weight"].toFixed(2));
        refreshText("#min_attn_text", attns[index]["min"]["attn_weight"].toFixed(2));
    }
}


function refreshImg(img_id, url){
    $(img_id).attr("src", url);
}

function refreshText(text_id, text){
    $(text_id).text(text);
}