var modelSets = {
  "sets": ["ModelNet", "ShapeNet"],
  "subsets":
    {
      "ModelNet":["ModelNet10", "ModelNet40"],
      "ShapeNet":["ShapeNet-Core", "ShapeNet-Sem"]
    },
};
var classesData = {
  "ModelNet10": [
     {
        text: 'All',
        href: '#all',
        tags: ['4'],
        nodes: [
          {
            text: 'modelnet10-1',
            href: '#airplane',
            tags: ['2'],
          },
          {
            text: 'Car',
            href: '#modelnet10-2',
            tags: ['0']
          },
        ],
      },
      {
        text: 'Parent 2',
        href: '#parent2',
        tags: ['0']
      },
  ],
  "ModelNet40": [
      {
        text: 'All',
        href: '#all',
        tags: ['4'],
        nodes: [
          {
            text: 'modelnet40-1',
            href: '#airplane',
            tags: ['2'],
          },
          {
            text: 'Car',
            href: '#modelnet40-2',
            tags: ['0']
          },
        ],
      },
      {
        text: 'Parent 2',
        href: '#parent2',
        tags: ['0']
      },
      {
        text: 'Parent 3',
        href: "#parent3",
        tags: ['1']
      },
  ],
  "ShapeNet-Core": [
      {
          text: 'All',
          href: '#all',
          tags: ['4'],
          nodes: [
            {
              text: 'ShapeNet-Core-1',
              href: '#airplane',
              tags: ['2'],
            },
            {
              text: 'Car',
              href: '#ShapeNetCore-2',
              tags: ['0']
            },
          ],
        },
        {
          text: 'Parent 2',
          href: '#parent2',
          tags: ['0']
        },
  ],
  "ShapeNet-Sem": [
  ]
};
(function ($) {

    $(document).ready(function () {
        
        $("#models-list .model-col").hover(hoverInModel, hoverOutModel);
        //分类导航
        $("#model-set-select").change(function(event){
          refreshClasses($(event.target).val());
        });
        $("#search-error-hint").css("display", "none");
        refreshModelSetsSelect(modelSets);
        var classes_data = [
              {
                text: 'All',
                href: '#all',
                tags: ['4'],
                nodes: [
                  {
                    text: 'airplane',
                    href: '#airplane',
                    tags: ['2'],
                  },
                  {
                    text: 'Car',
                    href: '#car',
                    tags: ['0']
                  },
                  {
                    text: 'airplane',
                    href: '#airplane',
                    tags: ['2'],
                  },
                  {
                    text: 'car',
                    href: '#car',
                    tags: ['0']
                  },{
                    text: 'airplane',
                    href: '#airplane',
                    tags: ['2'],
                  },
                  {
                    text: 'car',
                    href: '#car',
                    tags: ['0']
                  },
                  {
                    text: 'airplane',
                    href: '#airplane',
                    tags: ['2'],
                  },
                  {
                    text: 'Car',
                    href: '#car',
                    tags: ['0']
                  },
                  {
                    text: 'airplane',
                    href: '#airplane',
                    tags: ['2'],
                  },
                  {
                    text: 'Car',
                    href: '#car',
                    tags: ['0']
                  },
                  {
                    text: 'airplane',
                    href: '#airplane',
                    tags: ['2'],
                  },
                  {
                    text: 'Car',
                    href: '#car',
                    tags: ['0']
                  },{
                    text: 'airplane',
                    href: '#airplane',
                    tags: ['2'],
                  },
                  {
                    text: 'Car',
                    href: '#car',
                    tags: ['0']
                  },{
                    text: 'airplane',
                    href: '#airplane',
                    tags: ['2'],
                  },
                  {
                    text: 'Car',
                    href: '#car',
                    tags: ['0']
                  },{
                    text: 'airplane',
                    href: '#airplane',
                    tags: ['2'],
                  },
                  {
                    text: 'Car',
                    href: '#car',
                    tags: ['0']
                  },{
                    text: 'airplane',
                    href: '#airplane',
                    tags: ['2'],
                  },
                  {
                    text: 'Car',
                    href: '#car',
                    tags: ['0']
                  },
                ]
              },
              {
                text: 'Parent 2',
                href: '#parent2',
                tags: ['0']
              },
              {
                text: 'Parent 3',
                href: '#parent3',
                 tags: ['0']
              },
              {
                text: 'Parent 4',
                href: '#parent4',
                tags: ['0']
              },
              {
                text: 'Parent 5',
                href: '#parent5'  ,
                tags: ['0']
              }
            ];
        $('#model-classes-treeview').treeview({
          color: "#428bca",
          showTags: true,
          data: classes_data,
          multiSelect: false,
          onNodeSelected: function(event, data){
            console.log(data);
          }
        });
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
	            console.log(""+page);
	        }
	      });

        $("#search").click(searchModel);
        $("#upload-model-btn").click(chooseModel);
        $("#model-file-input").change(uploadModel);

        $("#models-list .model-col").click(openModelViewer);
        $("#close-viewer").click(closeModelViewer);
        $("#viewerSourceButton").click(function(){
          //在新窗口中打开
          window.location.href = "view-model.html";
        });
        $("#models-list .btn-download").click(downloadModel);
        //检索结果中展示3维模型
        showModel("three-vtk/models/vtk/airplane.off", $("#canvas"));
        $(".views img").click(function(event){
            $("#bigImgModal").css("display", "block");
            $("#big-img").attr("src", $(event.target).attr("src"));
        });
        $("#bigImgModal .close").click(function(event){
            $("#bigImgModal").css("display", "none");
        });
    });


    var imgs = ["https://www.w3schools.com/bootstrap/paris.jpg", "https://www.w3schools.com/bootstrap/sanfran.jpg"];
    var modelImgsTimer;
    var modelImgsTimerCount = 0;
    function hoverInModel(event){
    	//鼠标进入时轮流播放不同视角下的截图
    	modelImgsTimer = window.setInterval(function(){
    		modelImgsTimerCount += 1;
        console.log(imgs[modelImgsTimerCount%imgs.length]);
    		$(event.target).find(".model-img").attr("src", imgs[modelImgsTimerCount%imgs.length]);
    	}, 1000);
    }
    function hoverOutModel(event){
    	//鼠标离开时取消定时器，然后图像恢复默认值
    	if(modelImgsTimer){
    		window.clearInterval(modelImgsTimer);
    		$(event.target).find(".model-img").attr("src", imgs[0]);
    	}
    	modelImgsTimer = null;
      modelImgsTimerCount = 0;
    }

    function searchModel(){
      //先检查搜索框有没有输入，有的话按照文字匹配类别，再检查是否有上传的模型，有的话模型检索，否则提示
      var inputKeyword = $("#search-key-input").val();
      console.log(inputKeyword);
      if(inputKeyword!=""){
        //匹配左侧文字类别
        $("#search-error-hint").css("display", "none");
        searchByKey(inputKeyword);
      }else{
          $("#search-error-hint").css("display", "inline");
      }
      
    }

    function searchByModel(){
      var methodVal = $("input[type=radio]:checked").val();
      console.log(methodVal);
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
      window.location.href = "search_result.html";
      console.log("chooseModel");
    }

    function uploadModel(){
      //存下来本地要能显示，然后将模型上传到服务器上
      var filepath = $("#model-file-input").val();
      $.ajax({
        // Your server script to process the upload
        url: 'upload.php',
        type: 'POST',

        // Form data
        data: new FormData($('#model-file-input')),

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

    

}(jQuery));

function downloadModel(){
  console.log("downloadModel");
}

function refreshModelsList(modelsList){
  //首先清空原来的模型信息
  var modelsDiv = $("#models-list");
  modelsDiv.empty();
  for(model in modelsList){
      modelsDiv.append(newModelDiv(model));
  }
}

function newModelDiv(model){
  var modelDiv = document.createElement("div");
  $(modelDiv).addClass("col-md-3 model-col");
    var modelImg = document.createElement("img");
    $(modelImg).addClass("img-thumbnail model-img");
    $(modelImg).attr("src", "https://www.w3schools.com/bootstrap/paris.jpg");
    $(modelImg).attr("width", "304");
    $(modelImg).attr("height", "236");
    $(modelImg).attr("alt", "Model view");
  $(modelDiv).append(modelImg);
  $(modelDiv).append("<br />");
    var infoDiv = document.createElement("div");
      var tagSpan = document.createElement("span");
      $(tagSpan).addClass("model-tag label label-default");
      $(tagSpan).text("label");
      var downloadBtn = document.createElement("button");
      $(downloadBtn).addClass("btn btn-primary btn-md btn-download");
      $(downloadBtn).text("下载");
    $(infoDiv).append(tagSpan);
    $(infoDiv).append(downloadBtn);
  $(modelDiv).append(infoDiv);
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
      console.log(data);
    }
  });
  $('#model-classes-treeview').addClass("loading");//进度条
}