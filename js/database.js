
var database = {
    "config": {
        /* 背景 */
        "background": "./img/bg.jpg",
        /*"background": "https://ae01.alicdn.com/kf/HTB1ROr5XBSD3KVjSZFq7634bpXaF.png",*/
        /* 支持识别的url协议 */
        "urlAgreements": ["https://", "file://", "http://", "ftp://"],
        /* 写命令时的前缀 */
        "commandPre": "./",
        /* 初始 */
        "primalLenovoFetcher": "baidu",
        /* 标题 */
        "normalTitle": "开始"
    },
    "props": {
        "funnyTitles": {
            "enable": true,
            "titles": ["咩咩~", "大棚的生瓜蛋子，两块钱一斤", "结束", "All perfect", "Miss", "Good", "Pure", "Million Master", "Perfect"],
            "welcomeBack": "你可算回来辣！(〃\'▽\'〃)"
        }
    },
    "searchor": [
        {
            "searchorLink": "https://www.baidu.com/s?wd=%s",
            "searchorNone": "https://www.baidu.com/",
            "ico": undefined,
            "name": "百度",
            "tag": ["bd", "baidu"]
        },
        {
            "searchorLink": "https://search.bilibili.com/all?keyword=%s",
            "searchorNone": "https://www.bilibili.com/",
            "ico": undefined,
            "name": "B站",
            "tag": ["bilibili", "b", "bz", "bizhan"]
        },
        /*{
            "searchorLink": "https://www.google.com/search?q=%s",
            "searchorNone": "https://www.google.com/",
            "ico": "./img/Temmie.gif",
            "name": "谷歌",
            "tag": ["google", "gg", "404"]
        },*/
        {
            "searchorLink": "https://cn.bing.com/search?q=%s",
            "searchorNone": "https://cn.bing.com/",
            "ico": undefined,
            "name": "必应",
            "tag": ["bing", "by"]
        },
        {
            "searchorLink": "https://s.elecfans.com/s?keyword=%s",
            "searchorNone": "http://www.elecfans.com/",
            "ico": undefined,
            "name": "电子发烧友",
            "tag": ["dz", "dzfsy", "dianzifashaoyou"]
        },
        {
            "searchorLink": "https://www.youdao.com/w/eng/%s/#keyfrom=dict2.index",
            "searchorNone": "http://www.youdao.com/",
            "ico": "https://shared-https.ydstatic.com/images/favicon.ico",
            "name": "有道",
            "tag": ["yd", 'yo', "youdao"]
        }
    ],
    "favourite": [
        {
            "url": "https://www.bilibili.com/",
            "name": "哔哩哔哩"
        },
        {
            "url": "https://www.luogu.com.cn/",
            "name": "洛谷"
        },
        {
            "url": "http://www.youdao.com/",
            "name": "有道翻译",
        },
        {
            "url": "https://github.com/",
            "name": "github"
        },
        {
            "url": "https://translate.google.cn",
            "name": "谷歌翻译"
        },
        {
            "url": "https://mail.163.com/",
            "name": "163邮箱",
            "ico": "./img/163email.jpg"
        },
        {
            "url": "https://mail.qq.com/",
            "name": "QQ邮箱",
            "ico": "./img/QQemail.jpg"
        },
        {
            "url": "https://static-web.ghzs.com/cspage_pro/yuanshenMap.html#/?user=60e0646dd1a27d0001ca9a3d",
            "name": "原神大地图"
        }
    ]
};

// 根据tag查找相应的搜索器的下标
function findSearchorIndexByTag(tag) {
    for (var i = 0; i < database["searchor"].length; ++i){
        if (tag in database["searchor"][i]["tag"]) {
            return i;
        }
    }
    return -1;
}
