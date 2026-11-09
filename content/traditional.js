// Traditional Chinese, learning English (Both ways, decided 9 November 2026: Simplified first, then Traditional, checked by
// a reader from Taiwan or Hong Kong before launch). Each simplified character the game shows learning English, and its
// traditional form as written in Taiwan (chars, in pairs: 万萬 is 万 → 萬); first, the words where a character's form
// depends on the word (老板 → 老闆, but 木板 stays), and 只 as a measure word (一只 → 一隻, but 只有 stays). A character
// not here is the same in both. A few words are said differently in Taiwan too, such as 设置 (Settings), 設定. js/lang.js writes the page in it (toTraditional), for a game that chooses it in Settings.
const TRADITIONAL = {
  words: [['游戏手柄', '遊戲手把'], ['设置', '設定'], ['菜单', '選單'], ['保存', '儲存'], ['文件', '檔案'], ['加载', '載入'], ['网络', '網路'], ['屏幕', '螢幕'], ['应用', '應用程式'],   // (as said in Taiwan, not just written)
    ['头发', '頭髮'], ['老板', '老闆'], ['树干', '樹幹'], ['干活', '幹活'], ['回复', '回覆'], ['关系', '關係'], ['松软', '鬆軟'], ['松动', '鬆動'],
    ['松开', '鬆開'], ['游戏', '遊戲'], ['战斗', '戰鬥'], ['叮当', '叮噹'], ['胡子', '鬍子'], ['雨冲', '雨沖'], ['浪冲', '浪沖'], ['被冲', '被沖'],
    ['海冲', '海沖'], ['冲下', '沖下'], ['冲上', '沖上'], ['冲到', '沖到']],
  measure: ['一二两三四五六七八九十几每这那哪是', '是有要能在会剩说听问'],   // 只 after one of these, and not before one of those, is the measure word 隻
  chars: '万萬丛叢东東丝絲丢丟两兩个個为為举舉么麼乌烏乐樂习習乡鄉书書买買于於云雲亲親从從仓倉们們伙夥会會传傳伤傷体體余餘儿兒关關兴興养養兽獸内內'
    + '写寫军軍农農冲衝决決冻凍净淨准準凉涼几幾击擊凿鑿划劃刚剛删刪别別制製办辦务務动動劲勁区區单單卖賣却卻厅廳厉厲厨廚参參双雙发發变變叶葉后後吓嚇'
    + '吗嗎听聽呜嗚响響哗嘩哟喲嘘噓园園围圍国國图圖圆圓场場坏壞块塊墙牆壮壯声聲壳殼壶壺处處备備复複够夠头頭夹夾奋奮妈媽孙孫学學宝寶实實宫宮宽寬对對'
    + '寻尋寿壽尽盡层層属屬帅帥师師帘簾带帶帧幀帮幫干乾并並庆慶库庫应應开開张張弯彎当當总總悬懸戏戲战戰户戶扎紮扑撲扫掃扬揚护護拥擁拧擰择擇挂掛挡擋'
    + '挣掙挥揮捡撿换換据據摆擺摇搖摊攤撑撐数數旧舊时時显顯晒曬暂暫术術机機杆桿条條来來枪槍柜櫃标標栈棧栏欄树樹样樣档檔桥橋桩樁梦夢横橫檐簷欢歡气氣'
    + '沟溝没沒洼窪浅淺浇澆测測浏瀏浑渾涂塗渔漁温溫滚滾满滿滩灘灯燈灵靈灿燦点點烂爛烛燭烟煙烧燒烫燙烬燼热熱爱愛猪豬猫貓猬蝟现現电電画畫盏盞盖蓋盘盤'
    + '着著码碼确確礼禮离離秃禿种種窜竄窝窩竖豎笔筆笼籠筝箏篮籃篱籬粮糧系繫紧緊红紅级級纷紛纸紙纹紋线線练練组組细細终終绍紹经經绑綁结結绕繞给給络絡'
    + '继繼续續绳繩绿綠编編缘緣缝縫缨纓网網联聯脏髒脑腦脚腳脱脫脸臉腾騰节節苹蘋荡蕩药藥莲蓮获獲萤螢蓝藍虫蟲虾蝦蜡蠟补補装裝见見观觀览覽觉覺认認让讓'
    + '记記讲講许許设設证證识識诉訴词詞试試话話该該语語说說请請读讀课課谁誰调調谊誼谜謎谢謝贝貝败敗货貨贴貼赌賭赛賽赢贏赶趕蹿躥车車转轉轮輪软軟轰轟'
    + '轴軸轻輕载載辅輔辆輛边邊过過运運还還这這进進远遠连連适適选選遥遙酿釀采採里裡针針钓釣钟鐘钥鑰钩鉤钮鈕钱錢钻鑽铁鐵铃鈴铜銅铲鏟链鏈锁鎖错錯键鍵'
    + '镇鎮长長门門闪閃闭閉问問间間闹鬧闻聞阔闊阳陽阵陣阶階险險随隨难難静靜页頁顶頂项項顺順顾顧顿頓领領颗顆题題颜顏风風飘飄飞飛饭飯饮飲饵餌饿餓馅餡'
    + '馆館马馬驾駕验驗骗騙鱼魚鲜鮮鸟鳥鸡雞鸭鴨鹅鵝鹤鶴鹰鷹黄黃齿齒龙龍龟龜'
};
