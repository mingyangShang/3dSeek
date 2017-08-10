var setsData, classesData;
var isHomePage = true;
var homePageSize = 20, searchPageSize = 30;
var modelImgsTimer;
var modelImgsTimerCount = 0;
var views;
(function ($) {

    $(document).ready(function () {
        //分类导航
        $("#model-set-select").change(function(event){
          refreshClasses($(event.target).val());
          searchByKey("All");
        });
        // $("#search-error-hint").css("display", "none");
        //说明是搜索结果页面
        if($("#model-classes-treeview").length > 0){
                $.getJSON("/api/set/names", function(data, status){
                setsData = data;
                console.log(setsData);
                refreshModelSetsSelect(data);
            });
            $.getJSON("/api/set/classes", function (data, status) {
                classesData = data;
                console.log(classesData);
                refreshClasses("ModelNet10"); //TODO use modelnet10 as default
                //默认选择第一个节点
                if(classesData["ModelNet10"].length > 0){
                    searchByKey("All");
                    // $("#model-classes-treeview").treeview('selectNode', [$("#model-classes-treeview ul li:first"), { silent: false }]);
                }
            });
        }else{
            isHomePage = false;
        }

        //分页浏览
        window.pagObj = $('#models-pagination').pagination({
	        items: 20,
	        itemOnPage: 8,
	        currentPage: 1,
	        cssStyle: '',
	        prevText: '<span aria-hidden="true">&laquo;</span>',
	        nextText: '<span aria-hidden="true">&raquo;</span>',
	        onInit: function () {
	            // fire first page loading
	        },
	        onPageClick: function (page, evt) {
	            // 向服务器请求第page页的数据
                if(isHomePage){
                    getModels($("#model-classes-treeview").treeview("getSelected")[0].href + "&page=" + page);
                }else{
                    getModels();
                }
	        }
	      });

        $("#search").click(searchModel);
        $("#upload-model-btn").click(function(){
          $("#fileSearchDiv").css("display", "block");
        });
        $("#model-file-input").change(searchByModel);

        $("#close-viewer").click(closeModelViewer);
        $("#viewerSourceButton").click(function(){
          //在新窗口中打开
          window.location.href = "view-model.html";
        });
        $("#models-list .btn-download").click(downloadModel);
        //检索结果中展示3维模型
        if($("#canvas").length > 0){
          showModel("static/three-vtk/models/vtk/airplane.off", $("#canvas"));
          window.controls.enabled = false;
        }
        
        $(".views img").click(function(event){
            $("#bigImgModal").css("display", "block");
            $("#big-img").attr("src", $(event.target).attr("src"));
        });
        $("#canvas").mouseenter(function(){
          if(window.controls){
            window.controls.enabled = true;
          }
        }).mouseout(function(){
          if(window.controls){
            window.controls.enabled = false;
          }
        });
        $("#bigImgModal .close").click(function(event){
          $("#bigImgModal").css("display", "none");
        });

        if($("#featureChart").length > 0){
          window.featureChart = refreshFeatureChart("featureChart", [], []);
        }
        //文件检索
        //找好位置
        $("#fileSearchDiv").css("top", $("#search-row").offset().top);
        $("#fileSearchDiv").css("width", $("#search-row").width());
        $(".nav-tabs a").click(function(){
          if($(this).attr("id") == "urlLink"){
            $("#urlSearchPane").css("display", "block");
            $("#fileSearchPane").css("display", "none");
          }else{
            $("#urlSearchPane").css("display", "none");
            $("#fileSearchPane").css("display", "block");
          }
        });
        $("#closeFileSearchDiv").click(function(){
            $("#fileSearchDiv").css("display", "none");
            //停止上传相关的操作
        });
        $("#search_url").click(searchByUrl);
        $("#searchFile").click(chooseModel);
    });

}(jQuery));

function downloadModel(){
  console.log("downloadModel");
}

function refreshModelsList(modelsList){
  //首先清空原来的模型信息
  var modelsDiv = $("#models-list");
  modelsDiv.empty();
  for(i in modelsList){
      modelsDiv.append(newModelDiv(modelsList[i]));
  }
  $("#models-list .model-col").click(openModelViewer);
  $("#models-list .model-col").hover(hoverInModel, hoverOutModel);

}

function newModelDiv(model){
  var modelDiv = document.createElement("div");
  $(modelDiv).addClass("col-md-3 model-col");
    var modelImg = document.createElement("img");
    $(modelImg).addClass("img-thumbnail model-img");
    $(modelImg).attr("src", model.view_urls[0]);
    $(modelImg).attr("height", "236");
    $(modelImg).attr("alt", "Model view");
  $(modelDiv).append(modelImg);
  $(modelDiv).append("<br />");
    var infoDiv = document.createElement("div");
      var tagSpan = document.createElement("span");
      $(tagSpan).addClass("model-tag label label-default");
      $(tagSpan).text(model.class_name);
      var downloadBtn = document.createElement("button");
      $(downloadBtn).addClass("btn btn-primary btn-md btn-download");
      $(downloadBtn).text("下载");
      $(downloadBtn).attr("href", model.download_url);
    $(infoDiv).append(tagSpan);
    $(infoDiv).append(downloadBtn);
  $(modelDiv).append(infoDiv);
  //绑定数据
    $(modelDiv).data("info", model);
  return modelDiv;
}

function refreshModelSetsSelect(sets){
  var setsSelect = $("#model-set-select");
  setsSelect.empty();
  var parentSets = sets["sets"];
  for(i in parentSets){
    var group = document.createElement("optgroup");
    $(group).attr("label", parentSets[i]);
    var subSets = sets["subsets"][parentSets[i]];
    for(j in subSets){
      //TODO 暂时不使用ShapeNet
      if(subSets[j].indexOf("ShapeNet") != -1){
        $(group).append("<option disabled>"+subSets[j]+"</option>");
      }else{
        $(group).append("<option>"+subSets[j]+"</option>");
      }
    }
    setsSelect.append(group);
  }
}

//弹出窗口展示模型信息
function openModelViewer(event){
  // var modelInfo = $(event.target).data("model");
  //弹出窗口
  $("#viewerModal").css("display", "block");
  $("#viewerModal").addClass("in");
  $("#viewerIframe").attr("src", "view-model.html");
}

//关闭展示模型的窗口i 
function closeModelViewer(event){
  $("#viewerModal").css("display", "none");
  $("#viewerModal").removeClass("in");
}

function refreshClasses(modelsetName){
  $('#model-classes-treeview').treeview({
    color: "#428bca",
    showTags: true,
    data: classesData[modelsetName],
    multiSelect: false,
    onNodeSelected: function(event, data){
        //获取该类下的数据
        getModels(data.href);
    }
  });
  // $('#model-classes-treeview').addClass("loading");//进度条
}

function getModels(url){
    $.getJSON(url, function(resp, status){
        if(status == "success") {
            refreshModelsList(resp);
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

function searchModel(){
  //先检查搜索框有没有输入，有的话按照文字匹配类别，再检查是否有上传的模型，有的话模型检索，否则提示
  var inputKeyword = $("#search-key-input").val();
  if(inputKeyword!=""){
    //匹配左侧文字类别
    $("#search-error-hint").addClass("hide");
    searchByKey(inputKeyword);
  }else{
      $("#search-error-hint").removeClass("hide");
  }
}

function searchByUrl(){
    var url = $("#search-url-input").val();
    if(url != ""){
        //检查URL是否合法
        if((/\.(gif|jpg|jpeg|tiff|png|off|)$/i).test(url))
        {
            search("url", url, null);
        }
    }else{

    }
}

function search(type, url, file){
    var method = $("#fileSearchDiv input[type=radio]:checked").val();
    var formData = new FormData();
    formData.append("method", method);
    if(type == "url"){
        formData.append("url", url);
    }else if(type == "file"){
        formData.append("file", file);
        formData.append("name", file.name);
    }
    $.ajax({
        // Your server script to process the upload
        url: 'upload.php',
        type: 'POST',

        // Form data
        data: formData,

        // Tell jQuery not to process data or worry about content-type
        // You *must* include these options!
        cache: false,
        contentType: false,
        processData: false,

        // Custom XMLHttpRequest
        // xhr: function() {
        //   var myXhr = $.ajaxSettings.xhr();
        //   if (myXhr.upload) {
        //       // For handling the progress of the upload
        //       myXhr.upload.addEventListener('progress', function(e) {
        //           if (e.lengthComputable) {
        //               $('progress').attr({
        //                   value: e.loaded,
        //                   max: e.total,
        //               });
        //           }
        //       } , false);
        //   }
        //   return myXhr;
        // },
        success: function(data, status, xhr){
          console.log("success");
        },
        error: function(data, status, xhr){
          console.log("error");
        }
    });
}

function searchByKey(key){
  //从现在的分类列表中查找包含关键词的分类
  var selectableNodes = findSelectableNodes(key);
  $("#model-classes-treeview").treeview('selectNode', [selectableNodes[0], { silent: false }]);
}

function findSelectableNodes(key) {
  return $("#model-classes-treeview").treeview('search', [ key, { ignoreCase: true, exactMatch: false } ]);
};

function chooseModel(){
  //弹出选择模型框
  $("#model-file-input").trigger("click");
}

function searchByModel(){
  //存下来本地要能显示，然后将模型上传到服务器上
  var filepath = $("#model-file-input").val();
  if(filepath == ""){
    $("#uploadingFile").css("display", "none");
    $("#searchFileName").text("未选择文件");
    return;
  }
  var file = $("#model-file-input")[0].files[0];
  if((/\.(off|obj)$/i).test(file.name)){
      $("#searchFileName").text(filepath);
      $("#uploadingFile").css("display", "inline-block");
      search("file", "", filepath);
  }else{
      $("#searchFileName").text("模型格式错误");
  }
}