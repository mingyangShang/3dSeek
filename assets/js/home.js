(function ($) {

    $(document).ready(function () {
        
        $("#models-list .model-col").hover(hoverInModel, hoverOutModel);
        //分类导航
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

        $("#search").click(function(){
            window.location.href = "search_result.html";
        });

    });


    var imgs = ["https://www.w3schools.com/bootstrap/paris.jpg", "https://www.w3schools.com/bootstrap/sanfran.jpg", "https://www.w3schools.com/bootstrap/cinqueterre.jpg"];
    var modelImgsTimer;
    var modelImgsTimerCount = 0;
    function hoverInModel(event){
    	//鼠标进入时轮流播放不同视角下的截图
    	modelImgsTimer = window.setInterval(function(){
    		modelImgsTimerCount += 1;
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
    }

}(jQuery));