
var windowManager;

function windowLoad() {
    windowVueAppsLoad();
    // window-avoider是为了避免Vue加载完成之前显示异常画面
    document.getElementById("window-avoider").setAttribute("style", "");
}

function windowVueAppsLoad() {
    windowManager = new Vue({
        el: "#window-manager",
        data: {
            onShow: null,
            windowStyle: {
                position: "fixed",
                left: "0px",
                top: "0px",
                width: "600px",
                height: "500px",
                display: "none",
                borderTopLeftRadius: "12px",
                borderTopRightRadius: "12px",
                borderBottomLeftRadius: "12px",
                borderBottomRightRadius: "12px"
            },
            windows: {
                timer: {
                    windowName: "timer",
                    windowInfo: {
                        width: 600,
                        height: 500,
                    },
                    titleBar: {
                        title: "Dino Run"
                    },
                    taskName: "",
                    iframeSrc: "./404.html"
                }
            }
        },
        methods: {
            show: function (windowName) {
                if (this.windows[windowName] != undefined) {
                    this.windowStyle.width = this.windows[windowName].windowInfo.width + "px";
                    this.windowStyle.height = this.windows[windowName].windowInfo.height + "px";
                    this.windowStyle.left = window.innerWidth / 2 - this.windows[windowName].windowInfo.width / 2 + "px";
                    this.windowStyle.top = window.innerHeight / 2 - this.windows[windowName].windowInfo.height / 2 + "px";
                    this.windowStyle.display = "";
                    this.onShow = windowName;
                }
            },
            hide: function (windowName) {
                if (windowName == this.onShow)
                    this.onShow = null;
            },
            hideAll: function () {
                this.onShow = null;
            }
        },
        updated: function () {
            // 点击空白处，关闭当前页面
            document.getElementById("window-manager").onclick = function () {
                windowManager.hide(windowManager.onShow);
            };
            document.getElementById(windowManager.onShow + "-window").onclick = function () {
                var e = event || window.event;
                e.stopPropagation();
            };
        }
    });
}
