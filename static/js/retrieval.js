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

        $("#model_views_wrapper").hide();
    });
}(jQuery));

function getUUID(len, radix) {
    var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
    var uuid = [], i;
    radix = radix || chars.length;

    if (len) {
        // Compact form
        for (i = 0; i < len; i++) uuid[i] = chars[0 | Math.random()*radix];
    } else {
        // rfc4122, version 4 form
        var r;
        // rfc4122 requires these characters
        uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
        uuid[14] = '4';
        // Fill in random data.  At i==19 set the high bits of clock sequence as
        // per rfc4122, sec. 4.1.5
        for (i = 0; i < 36; i++) {
            if (!uuid[i]) {
                r = 0 | Math.random()*16;
                uuid[i] = chars[(i == 19) ? (r & 0x3) | 0x8 : r];
            }
        }
    }
    return uuid.join('');
}

function uuid() {
    lastUID = getUUID(16, 16);
    console.log("Generated new UUID = " + lastUID);
    return lastUID;
}

function hide_blocks(selectors) {
    for(var x in selectors)
    {
        $(selectors[x]).hide();
    }
}

function show_blocks(selectors) {
    for(var x in selectors)
    {
        $(selectors[x]).show();
    }
}

function doTextQuery(queryID, queryText)
{
    lastQueryType = "text";
    var textQueryBackend = "http://166.111.80.36:8889/text_query";
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function()
    {
        if (xhr.readyState==4 && xhr.status==200)
        {
            lastQueryText = queryText;
            onTextQueryResult(lastUID, xhr.responseText);
        }
    }
    xhr.open("post", textQueryBackend, true);
    xhr.setRequestHeader("uuid", queryID);
    xhr.setRequestHeader("method", current_method);
    xhr.setRequestHeader("Content-type","application/x-www-form-urlencoded");
    xhr.send("query=" + queryText);

    console.log("Text query: " + queryText);

    hide_blocks([".image_query_result", ".big_image_display", "#server_message", ".vis_display"]);
    show_blocks([".text_query_result"]);
}

function doImageQuery(queryID, filename, imageFile)
{
    lastQueryType = "image";
    var imageQueryBackend = "http://166.111.80.36:8889/image_query"; // 接收上传文件的后台地址
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function()
    {
        if (xhr.readyState==4 && xhr.status==200)
        {
            onImageQueryResult(lastUID, xhr.responseText);
        }
    }
    xhr.open("post", imageQueryBackend, true);
    if(current_method == "cbow")
    {
        current_method = "cmst";
    }
    xhr.setRequestHeader("method", current_method);
    xhr.setRequestHeader("uuid", queryID);
    xhr.setRequestHeader("filename", filename);
    xhr.send(imageFile);

    console.log("Image query");

    hide_blocks([".text_query_result", ".big_image_display", "#server_message", ".vis_display"]);
    show_blocks([".image_query_result"]);
}

function onTextQueryResult(queryID, response)
{
    hasTextQueryResult = true;
    var textQueryRet = JSON.parse(response);
    var msg = textQueryRet['message'];
    var qtime = msg[0];
    var unks = msg[1];
    textQueryData = textQueryRet['data'];
    $("#query_time").text("检索用时："+ qtime + "秒");
    if(unks.length >= 2)
    {
        $("#server_message").text("查询中包含多个词表外的词语：" + unks + "。请考虑修改或替换这些词语以提高检索效果。");
        show_blocks(["#server_message"]);
    }
    else
    {
        hide_blocks(["#server_message"]);
    }

    for(var i = 0; i < textQueryData.length; i++)
    {
        var imgret = textQueryData[i];
        var imgid = ".resultimg" + (i + 1);
        $(imgid).attr("src", server + imgret['filename']);
        $(imgid).attr("alt", imgret['filename']);
    }
}

function onImageQueryResult(queryID, response)
{
    hasTextQueryResult = true;

    $("#uploaded_img").attr("src", server + queryID + ".png");

    var textQueryRet = JSON.parse(response);
    var msg = textQueryRet['message'];
    var qtime = msg[0];
    $("#query_time").text("检索用时："+ qtime + "秒");

    textQueryData = textQueryRet['data'];

    hide_blocks(["#server_message"]);

    for(var i = 0; i < textQueryData.length; i++)
    {
        var imgret = textQueryData[i];
        var imgid = ".resultimg" + (i + 1);
        $(imgid).attr("src", server + imgret['filename']);
        $(imgid).attr("alt", imgret['filename']);

        var sent_places = $("#text_row" + (i + 1) + " span");
        console.log("LEN: " + sent_places.length);
        var sents = imgret['sentence'].split('\n');

        var j = 0;
        if(sents.length >= sent_places.length)
        {
            for( ; j < sent_places.length; j++)
            {
                sent_places[j].textContent = sents[j];
            }
            //丢弃显示不下的句子
        }
        else
        {
            for( ; j < sents.length; j++)
            {
                sent_places[j].textContent = sents[j];
            }
            //隐藏没有内容的文本框
            for( ; j < sent_places.length; j++)
            {
                sent_places[j].textContent = "";
            }
        }
    }
}

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
        $(modelImg).attr("height", "236");
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
          var tagSpan = document.createElement("span");
          $(tagSpan).addClass("model-tag label label-default");
          $(tagSpan).text(model.class_name);
          var downloadA = document.createElement("a");
          var downloadBtn = document.createElement("button");
          $(downloadBtn).addClass("btn btn-primary btn-md btn-download");
          $(downloadBtn).text("下载");
          $(downloadA).attr("href", model.download_url);
          $(downloadA).append(downloadBtn);

          if(!isHomePage){
              var compareBtn = document.createElement("button");
              $(compareBtn).text("对比");
              $(compareBtn).addClass("btn btn-info btn-md btn-download");
              $(compareBtn).click(function(event){
                  openCompareModal($(event.target).parent().parent().data("info"));
              });
          }
      $(infoDiv).append(tagSpan);
      $(infoDiv).append(downloadA);
      $(infoDiv).append(compareBtn);
  $(modelDiv).append(infoDiv);
}
  //绑定数据
    $(modelDiv).data("info", data);
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
    var author = "smy";
    var formData = new FormData();
    formData.append("author", author);
    formData.append("type", type);
    formData.append("method", method);
    if(type == "url"){
        formData.append("url", url);
    }else if(type == "file"){
        formData.append("file", file);
        formData.append("name", file.name);
    }
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
          if(data.success){
                window.search_result = data;
                refreshViews(data["views"]);
              // window.location.href = data.result_url;
          }else{
              if(type == "url"){
                  // $("#url-error").removeClass("hide").text(data.info);
                  // $("#searchingUrl").addClass("hide");
              }else{
                  // $("#searchFileName").text(data.info);
                  // $("#uploadingFile").css("display", "none");
              }
          }
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
                }
          }; 
          refreshViews(fakeData["views"]);
    }
    });
}

// 刷新模型视图显示
function refreshViews(data){
    var views_div = $("#model_views");
    console.log(views_div);
    $("#model_views_wrapper").show();
    views_div.empty();
    for(i in data.imgs){
        views_div.append(newModelDiv(data.imgs[i], is_model=false));
    }
    $("#model_views img").click(function(event){
            $("#bigImgModal").css("display", "block");
            $("#big-img").attr("src", $(event.target).attr("src"));
    });
    // $("#model_views .model-col").hover(hoverInModel, hoverOutModel);
    $("#model_views").removeClass("loading");
}