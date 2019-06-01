examples = ["football game", "man riding bike", "red shirt", "dog catching balls", "two men", "busy street", "sand", "water"];
current_page = 1;
server = "http://166.111.80.36:8889/";
current_method = "cmst";

lastUID = "";

all_case = 20;
t2i_results = null;
i2t_results = null;
indices = [];
name_maps = null;
eval_results = [];

eval_methods = ['ACMR', 'CMST', 'CMST+CBOWAlign'];
methods_indice = [0, 1, 2];
eval_scores = [0, 0, 0];
score_for_rank = [3, 2, 1];

verify_items = []; //ten


function shuffle(a) {
    var j, x, i;
    for (i = a.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = a[i];
        a[i] = a[j];
        a[j] = x;
    }
    return a;
}

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

function shuffle_results(ret)
{
    for (var k in ret){
        indices.push(k);
    }
    indices = shuffle(indices);
}

function restore_ranks() {
    $(".rank_method_a").val(1);
    $(".rank_method_b").val(1);
    $(".rank_method_c").val(1);
}

function get_rank() {
    var userrank = [];
    var a = $(".rank_method_a.rank_" + current_eval ).val() - 1;
    var b = $(".rank_method_b.rank_" + current_eval ).val() - 1;
    var c = $(".rank_method_c.rank_" + current_eval ).val() - 1;
    userrank.push(a);
    userrank.push(b);
    userrank.push(c);
    console.log("get_rank:"+userrank);
    return userrank;
}

function load_result(idx){
    //submit last eval
    if(started)
    {
        var rk = get_rank();
        for (var i in rk)
        {
            eval_scores[methods_indice[i]] += score_for_rank[rk[i]];
        }
        restore_ranks();
        //eval_summary();
    }
    //shuffle position
    methods_indice = shuffle(methods_indice);
    
    //load new content
    if(current_eval == 't2i')
    {
        load_t2i_result(idx);
    }
    else if(current_eval == "i2t")
    {
        load_i2t_result(idx);
    }
    $("#cpage").html(current_case + " / " + all_case);
}

function load_t2i_result(idx)
{
    var data = t2i_results[indices[idx]];
    $("#current_query_text").text(data[3]);
    for (var i = 0; i < 3; i++)
    {
        for(var j = 0; j < 5; j++)
        {
            var tarimg = "#image_row" + (i + 1) + " .resultimg" + (j + 1);
            $(tarimg).attr("src", server + data[methods_indice[i]][j]);
        }
    }
}

function load_i2t_result(idx)
{
    var data = i2t_results[indices[idx]];
    $("#current_query_image").attr("src", server + indices[idx]);
    for (var i = 0; i < 3; i++)
    {
        var sent_places = $("#text_row" + (i + 1) + " .image_info_sentence");
        for(var j = 0; j < 5; j++)
        {
            sent_places[j].textContent = data[methods_indice[i]][j];
        }
    }
}

function start_eval() {
    started = true;
    current_case = 1;
    eval_scores = [0, 0, 0];
    $("#submit_button").val("提交");
}


function finish_eval() {
    started = false;
    current_case = 1;
    eval_scores = [0, 0, 0];
    $("#submit_button").val("开始评估");
}


function request_data()
{
    var backend = "http://166.111.80.36:8889/text_query";
    if(current_eval == "t2i")
    {
        backend = "http://166.111.80.36:8889/t2i_eval";
    }
    else if (current_eval == "i2t")
    {
        backend = "http://166.111.80.36:8889/i2t_eval";
    }

    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function()
    {
        if (xhr.readyState==4 && xhr.status==200)
        {
            if(current_eval == "t2i")
            {
                t2i_results = JSON.parse(xhr.responseText);
                shuffle_results(t2i_results);
                load_result(0);
            }
            else if(current_eval == "i2t")
            {
                i2t_results = JSON.parse(xhr.responseText);
                shuffle_results(i2t_results);
                load_result(0);
            }

            start_eval();
        }
    }
    xhr.open("post", backend, true);
    xhr.setRequestHeader("Content-type","application/x-www-form-urlencoded");
    xhr.send("get_data=" + current_eval);
}

function eval_summary()
{
    var summary = "";
    for(var i in eval_methods)
    {
        summary += eval_methods[i] + ": " + eval_scores[i] + "\n";
    }
    alert(summary);
}

function submit_eval()
{
    var backend = "http://166.111.80.36:8889/submit_score";

    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function()
    {
        if (xhr.readyState==4 && xhr.status==200)
        {
            alert("提交成功");
        }
    }
    xhr.open("post", backend, true);
    xhr.setRequestHeader("Content-type","application/x-www-form-urlencoded");
    xhr.send("type=" + current_eval + "&acmr=" + eval_scores[0] + "&cmst=" + eval_scores[1] + "&cbow=" + eval_scores[2]);
}

$("#submit_button").click(function () {
    if(!started)
    {
        request_data();
    }
    else{
        //if(current_case != all_case)
        //{
        //    alert("评价尚未全部完成，无法提交");
        //}
        //else
        //{
            var rk = get_rank();
            for (var i in rk)
            {
                eval_scores[methods_indice[i]] += score_for_rank[rk[i]];
            }
            restore_ranks();
            eval_summary();
            submit_eval();
            finish_eval();
        //}
    }
});

function nextPage(){
    if(current_case < all_case)
    {
        current_case += 1;
        load_result(current_case + 1);
    }
    if(current_case == all_case)
    {
        $("#next").css("color", "gray");
    }
    else
    {
        $("#next").attr("style", "");
    }
}

function prevPage(){
    if(started && current_case > 1)
    {
        alert("不可以修改已评价的样本");
    }
}

$(document).keydown(function(e){
    if(e.keyCode == 37)
    {
        prevPage();
    }
    else if(e.keyCode == 39)
    {
        nextPage();
    }
});
