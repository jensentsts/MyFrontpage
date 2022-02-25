
class Fetcher{
    load;   // function ()
    update; // function (inputText)
    constructor(load, update) {
        this.load = load;
        this.update = update;
    }
};

var lenovoFetcher = {
    load: function () {
        for (tag in this.fetchers) {
            this.fetchers[tag].load();
        }
        this.enable = database["config"]["primalLenovoFetcher"];
    },
    fetchers: {
        "baidu": new Fetcher(baiduLoad, baiduUpdate),
        "bilibili": new Fetcher(bilibiliLoad, bilibiliUpdate)
    },
    enable: "",
    // inputText: 需要将进行联想的内容，是经过转换为URL后的String
    update: function (inputText) {
        if (inputText == "" || inputText == undefined) {
            vue_searchorLenovo.lenovoEntries = [];
            return;
        }
        this.fetchers[this.enable].update(encodeURIComponent(inputText));
    }
};

function baiduLoad() {
    window.baidu = {
        sug: function (json) {
            if (json["g"] == undefined || Object.keys(json["g"]).length == 0) {
                vue_searchorLenovo.lenovoEntries = [];
                return;
            }
            var newEntries = Array();
            for (var i = 0; i < Object.keys(json["g"]).length; ++i){
                newEntries.push(json["g"][i]["q"]);
            }
            vue_searchorLenovo.lenovoEntries = newEntries;
        }
    };
}

function baiduUpdate(inputText) {   
    // TODO: 实现 .7s 内没有按键再进行百度搜索联想
    try {
        // 清除旧的数据包，后面再重新添加标签，从而实现重新请求数据包
        if (document.getElementById("lenovo-baidu")) {
            document.getElementsByTagName("head")[0].removeChild(document.getElementById("lenovo-baidu"));
        }
    }
    catch (e) {
        console.error(e);
    }
    // 新建一个script，使得百度（重新）发送新内容的联想词条信息
    var newBaidu = document.createElement("script");
    newBaidu.id = "lenovo-baidu";
    newBaidu.type = "text/javascript";
    newBaidu.src = "https://sp0.baidu.com/5a1Fazu8AA54nxGko9WTAnF6hhy/su?json=1&wd=" + inputText;
    document.getElementsByTagName("head")[0].appendChild(newBaidu);
}

function bilibiliLoad() {
    // pass
}

function bilibiliUpdate(inputText) {
    fetch("https://api.bilibili.com/suggest?term=" + inputText)
        .then(res => res.json())
        .then(json => {
            console.log(json);
        });
}
