var vue_timer;                      // timer
var vue_searchorInput;              // 输入框
var vue_searchorSelection;          // 搜索器选择器
var vue_cleanLineBody;              // 清除线
var vue_searchorLenovo;             // 搜索关键词自动联想
var vue_favourite;                  // 快捷网站

let VCtimeout = null;               // VC: visibility change，这是该时间的timeout对象
let baiduTimeout = null;            // 延迟更新百度
var timerInterval = null;           // timer时间更新

// 联想的词条
class LenovoEntry{
    text = "";
    selected = false;
    constructor(text, selected) {
        this.text = text;
        this.selected = selected;
    }
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////

// 用于初始化
window.onload = function () {
    documentInit();
    modulesLoad();
    propsLoad();
    lenovoFetcher.load();
    console.log("Loaded.");
    console.log("大佬做的起始页：%c%s", "color: rgb(112, 192, 0);", "https://limestart.cn");
};

// 初始化document的一些信息
function documentInit() {
    document.title = database["config"]["normalTitle"];
    document.documentElement.onkeydown = (e) => {
        if (windowManager.onShow != null) {
            return;
        }
        document.getElementById('searchor-input').focus();
    };
    document.onclick = () => {
        vue_searchorSelection.hide();
    };
    document.ondblclick = () => {
        document.getElementById("searchor-input").focus();
    }
    if (database["props"]["funnyTitles"]["enable"]) {
        // 很皮的标题
        document.addEventListener('visibilitychange', function () {
            if (document.visibilityState == 'hidden') {
                var titleIndex = Math.floor(Math.random() * Object.keys(database["props"]["funnyTitles"]["titles"]).length);
                document.title = database["props"]["funnyTitles"]["titles"][titleIndex];
                if (VCtimeout != null) {
                    clearTimeout(VCtimeout);
                    VCtimeout = null;
                }
            } else {
                document.title = database["props"]["funnyTitles"]["welcomeBack"];
                VCtimeout = setTimeout(() => { document.title = database["config"]["normalTitle"]; }, 1000);
            }
        });
    }
    document.getElementById("searchor-selector").onclick = function () {
        if (vue_searchorSelection.onDisplay) {
            window.open(database["searchor"][vue_searchorSelection.index]["searchorNone"]);
            return;
        }
        vue_searchorSelection.show();
        var e = event || window.event;
        e.stopPropagation();
    };
    document.getElementById("searchor-search").onclick = function () {
        search();
    };
    document.getElementById("bg").style.backgroundImage = "url(" + database["config"]["background"]
}

// 加载vue相关的东西
function modulesLoad() {
    timerLoad();
    searchorLoad();
    favouriteLoad();
    windowLoad();
}

function timerLoad() {
    // 时间显示以及倒计时器
    vue_timer = new Vue({
        el: "#timer",
        data: {
            hours: 23,
            minutes: 33
        },
        methods: {
            update: timerUpdate,
            begin: timerBegin
        }
    });
    vue_timer.begin();
}

function searchorLoad() {
    searchorInputLoad();
    searchorCleanLineLoad();
    searchorLenovoLoad();
    searchorSelectorLoad();
}

function searchorInputLoad() {
    vue_searchorInput = new Vue({
        el: "#searchor-input",
        data: {
            text: "",
            lastTextRecord: ""		// 记录在onkeydown事件发生之前的searchor内的输入内容
        },
        computed: {
            command: {
                get: function () {
                    var res = "";
                    if (this.text.length > 2 && this.text.indexOf(database["config"]["commandPre"]) == 0) {
                        for (var i = database["config"]["commandPre"].length; i < this.text.length; ++i) {
                            res += this.text[i];
                        }
                    }
                    return res;
                }
            }
        },
        methods: {
            onkeydown: function () {
                var e = event || window.event;
                if (e) {
                    var key = e.keyCode;
                    if (key == 38) {
                        vue_searchorLenovo.selectedMoveUp();
                        return;
                    }
                    if (key == 40) {
                        vue_searchorLenovo.selectedMoveDown();
                        return;
                    }
                }
                vue_cleanLineBody.update();
                // 如果输入内容发生了变化
                if (this.lastTextRecord != this.text){
                    this.lastTextRecord = this.text;
                    vue_searchorLenovo.update();
                }
            },
            onkeyup: function () {
                var e = event || window.event;
                if (e) {
                    var key = e.keyCode;
                    if (key == 13 || key == 10) {
                        search();
                    }
                    if (key == 38 || key == 40 || key == 39 || key == 37) {
                        return;
                    }
                }
                vue_cleanLineBody.update();
                // 如果输入内容发生了变化
                if (this.lastTextRecord != this.text) {
                    this.lastTextRecord = this.text;
                    vue_searchorLenovo.update();
                }
            }
        }
    });
}

function searchorCleanLineLoad() {
    vue_cleanLineBody = new Vue({
        el: "#clean-line-vue",
        data: {
            show: false
        },
        methods: {
            update: function () {
                if (vue_searchorInput.text != "" || vue_searchorLenovo.lastRecord != "")
                    this.show = true;
                else
                    this.show = false;
            },
            clean: function () {
                vue_searchorLenovo.lastRecord = vue_searchorInput.text;
                vue_searchorInput.text = "";
                this.update();
                vue_searchorLenovo.update();
                document.getElementById("searchor-input").focus();
            }
        }
    });
}

function searchorLenovoLoad() {
    vue_searchorLenovo = new Vue({
        el: "#searchor-lenovo",
        data: {
            lenovos: [],    // TODO: 改成 entries
            lastRecord: "",
            selected: -1,           // selected: 方向键选择的联想词条
            commandInquire: ""      // commandInquire: 询问将要执行的指令之提示信息
        },
        computed: {
            // 联想词条
            lenovoEntries: {
                get: function () {
                    var res = Array();
                    for (var i = 0; i < lenovos.length; ++i){
                        res.push(lenovos[i].text);
                    }
                    return res;
                },
                // 仅仅是词条的列表，不能是LenovoEntry类型的对象
                set: function (entryList) {
                    // 如果entryList的length少，修剪this.lenovos使得二者length相同
                    while (entryList.length < this.lenovos.length) {
                        this.lenovos.pop();
                    }
                    for (var i = 0; i < entryList.length; ++i){
                        if (i >= this.lenovos.length) {
                            this.lenovos.push(new LenovoEntry(entryList[i], false));
                        }
                        else {
                            this.lenovos[i].text = entryList[i];
                            this.lenovos[i].selected = false;
                        }
                    }
                }
            }
        },
        methods: {
            // 更新lenovo中的内容
            // 监测输入内容、重新获取联想词条
            update: function () {
                var complied = commandRelease();
                if (complied != -1)
                    this.commandInquire = "选择 " + database["searchor"][complied]["name"] + " 为搜索器";
                else
                    this.commandInquire = vue_searchorInput.command;
                this.selected = -1;
                lenovoFetcher.update(vue_searchorInput.text);
            },
            selectedMoveUp: function () {
                if (this.lenovos.length == 0) {
                    this.selected = -1;
                    return;
                }
                if (--this.selected < 0) {
                    this.selected = 0;
                }
                this.lenovos[this.selected].selected = true;
                vue_searchorInput.text = this.lenovos[this.selected].text;
                this.lenovos[this.selected + 1].selected = false;
            },
            selectedMoveDown: function () {
                if (this.lenovos.length == 0) {
                    this.selected = -1;
                    return;
                }
                if (++this.selected >= this.lenovos.length) {
                    this.selected = this.lenovos.length - 1;
                }
                this.lenovos[this.selected].selected = true;
                vue_searchorInput.text = this.lenovos[this.selected].text;
                if (this.selected - 1 >= 0) {
                    this.lenovos[this.selected - 1].selected = false;
                }
            },
            searchorLenovoEntry_click: function (lenovoText) {
                vue_searchorInput.text = lenovoText;
                search();
            },
            lastRecord_onclick: function () {
                vue_searchorInput.text = this.lastRecord;
                this.lastRecord = "";
                this.update();
                vue_cleanLineBody.update();
            },
            command_onclick: function () {
                commandRun();
            }
        }
    });
}

function searchorSelectorLoad() {
    vue_searchorSelection = new Vue({
        el: "#searchor-selection",
        data: {
            realIndex: 0,
            onDisplay: false,
            searchorList: [],
            test: 0
        },
        computed: {
            index: {
                get: function () {
                    return this.realIndex;
                },
                set: function (newIndex) {
                    this.realIndex = newIndex;
                    document.getElementById("searchor-selector").style.backgroundImage = "url(" + vue_searchorSelection.getSearchorFavionUrl(this.realIndex) + ")";
                    document.getElementById("searchor-input").focus();
                    vue_searchorSelection.hide();
                }
            },
            UrlForOpen: {
                get: function () {
                    var text = vue_searchorInput.text;
                    // 无输入,直接打开对应网站
                    if (text == "") {
                        return database["searchor"][vue_searchorSelection.realIndex]["searchorNone"];
                    }
                    // 输入的是URL
                    for (var i = Object.keys(database["config"]["urlAgreements"]).length - 1; i >= 0; --i) {
                        if (text.indexOf(database["config"]["urlAgreements"][i]) == 0) {
                            return text;
                        }
                    }
                    // 一般的搜索
                    return database["searchor"][vue_searchorSelection.realIndex]["searchorLink"].replace("%s", encodeURIComponent(text));
                }
            }
        },
        methods: {
            show: function () {
                vue_searchorSelection.onDisplay = true;
            },
            hide: function () {
                vue_searchorSelection.onDisplay = false;
            },
            searchorSelection_onclick: function () {
                var e = event || window.event;
                e.stopPropagation();
            },
            getSearchorFavionUrl: function(index) {
                if (database["searchor"][index]["ico"] == undefined) {
                    return cutFaviconUrl(database["searchor"][index]["searchorNone"]);
                }
                else {
                    return database["searchor"][index]["ico"];
                }
            },
            selectSearchor: function(index) {
                this.index = index;
            }
        },
        mounted: function () {
            // 只需要装载要用到的信息
            for (var i = 0; i < database["searchor"].length; ++i) {
                this.searchorList.push({ name: database["searchor"][i]["name"] });
            }
        }
    });
    document.getElementById("searchor-selector").style.backgroundImage = "url(" + vue_searchorSelection.getSearchorFavionUrl(0) + ")";
}

function favouriteLoad() {
    vue_favourite = new Vue({
        el: "#favourite",
        data: {
            favouriteList: []
        },
        methods: {
            getFavouriteFavionUrl: function (index) {
                if (database["favourite"][index]["ico"] == undefined)
                    return cutFaviconUrl(database["favourite"][index]["url"]);
                else
                    return database["favourite"][index]["ico"];
            },
            favouriteMonomer_onclick: function (index) {
                window.open(database["favourite"][index]["url"]);
            }
        },
        mounted: function () {
            // 只需要装载要用到的信息
            for (var i = 0; i < database["favourite"].length; ++i) {
                this.favouriteList.push({ name: database["favourite"][i]["name"] });
            }
        }
    });
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////

// 对整个页面的事件
//   当在页面任意位置按下按键的时候，使搜索框获得焦点

// 更新顶部时钟显示内容
function timerUpdate() {
    var dt = new Date();
    vue_timer.hours = dt.getHours() < 10 ? "0" + dt.getHours() : dt.getHours();
    vue_timer.minutes = dt.getMinutes() < 10 ? "0" + dt.getMinutes() : dt.getMinutes();
}
// 启动timer
function timerBegin() {
    timerInterval = setInterval(function () {
        vue_timer.update();
    }, 1000);
}
// timer到时间了，开始警报
function timerBell() {
    alert(windowManager.windows.timer.taskName);
}

// 生成目标网站source下的网站图表的url
// 参数：
//   source: 目标网站
function cutFaviconUrl(source) {
    var res = "", slashCount = 0;
    for (var i = 0; i < Object.keys(source).length; ++i){
        if (source[i] == "/" && ++slashCount >= 3)
            break;
        res += source[i];
    }
    return res + "/favicon.ico";
}

// 搜索功能
function search() {
    var command = vue_searchorInput.command;
    if (command != "") {
        commandRun();
        vue_cleanLineBody.clean();
        return;
    }
    window.open(vue_searchorSelection.UrlForOpen);
    vue_cleanLineBody.clean();
}

// 解析指令
// 目前：返回选择的搜索器之下标
function commandRelease() {
    var command = vue_searchorInput.command;
    var toIndex = Number(command);
    if (toIndex != NaN && toIndex >= 1 && toIndex <= Object.keys(vue_searchorSelection.searchorList).length) {
        return toIndex - 1;
    }
    return findSearchorIndexByTag(command);
}
// 运行指令
function commandRun() {
    var complied = commandRelease();
    if (complied == -1) {
        return;
    }
    vue_searchorSelection.index = complied;
    vue_cleanLineBody.clean();
}

/***************************************************/
