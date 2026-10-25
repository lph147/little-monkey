// Writes CHINESE.md: every piece of Chinese in the game, with pinyin and English, for a native
// speaker to check. Run it with:  npm run chinese   (or: node tools/chinese-sheet.js)
// It reads the content files, so run it again after changing any Chinese (a test reminds you).
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const {loadGame, ROOT} = require('../tests/fake-browser');

// New sentences waiting to be checked, as {zh, en, where}: ones not in the game yet, and new ones already
// in it (py: its pinyin, for a name that isn't in the word bank). Once checked (and corrected), put any corrections
// into the content and delete them from here.
const DRAFTS = [
  ...[['石头 里 有 猴子 。', 'There is a monkey inside the stone.'], ['我 是 猴子 。', 'I am a monkey.'], ['我 有 朋友 。', 'I have friends.'],
    ['我 吃 桃子 ， 喝 水 。', 'I eat peaches and drink water.'], ['草 里 有 动物 。', 'There are animals in the grass.'],
    ['树 上 有 鸟 。', 'There are birds in the trees.'], ['河 里 有 鱼 。', 'There are fish in the river.'],
    ['山 上 有 瀑布 ！', 'There is a waterfall on the mountain!']]
    .map(([zh, en]) => ({zh, en, where:'The new, shorter story at the waterfall (in the game)'})),
  ...[['瀑布 后面 有 什么 ？', 'What’s behind the waterfall?', 'The old monkey, as the troop gathers at the waterfall'],
    ['谁 跳 进去 ， 谁 就 是 王 ！', 'Whoever jumps in will be king!', 'The big monkey, daring the troop'],
    ['我 怕 ！', 'I’m scared!', 'The little monkey'],
    ['里面 有 什么 ？', 'What’s inside?', 'The old monkey, when you come back out of the cave'],
    ['里面 有 床 。', 'There are beds inside.', 'Your answer (you choose 床 to fill the gap)'],
    ['太 好 了 ！ 我们 去 看看 ！', 'Wonderful! Let’s go and see!', 'The old monkey'],
    ['河 上 有 桥 。', 'There is a bridge over the river.', 'The example on 桥 (bridge)’s page in the Word Scroll'],
    ['水帘洞', 'Water Curtain Cave', 'What the stone tablet (石碑 shíbēi: please check this name too) in the cave says']]
    .map(([zh, en, where]) => ({zh, en, where:'Chapter 1, part A (in the game): ' + where})),
  ...[['这 是 我们 的 家 ！', 'This is our home!', 'The old monkey, when the troop moves into the cave'],
    ['你 是 我们 的 王 ！', 'You are our king!', 'The big monkey, for the troop (then you’re called 美猴王 Měi Hóuwáng: please check this name too)'],
    ['一 ！', 'One!', 'The old monkey, counting the troop into the cave as each monkey comes in (teaching 一; changed on 21 October 2026 from 一只猴子。: see the question below)'],
    ['一 ， 二 ！', 'One, two!', 'The old monkey, counting (teaching 二; it was 两只猴子。)'],
    ['一 ， 二 ， 三 ！', 'One, two, three!', 'The old monkey, counting (teaching 三; it was 三只猴子。)']]
    .map(([zh, en, where]) => ({zh, en, where:'Chapter 1, part B (in the game): ' + where})),
  ...[['我 饿 了 。 我 要 吃 水果 ！', 'I’m hungry. I want to eat some fruit!', 'The hungry monkey now asks for fruit (水果), not a peach'],
    ['这 是 桃子 。 我 要 吃 苹果 ！', 'This is a peach. I want to eat an apple!', 'The hungry monkey, if you bring the peach first (he wants whichever you didn’t bring)'],
    ['苹果 ！ 太 好 了 ！', 'An apple! Wonderful!', 'The hungry monkey, when you bring the apple he wants (changed on 24 October 2026 from 你有苹果吗？: 有 yǒu sounded too like the 要 yào you say next; the same for the peach, 桃子！太好了！, and the water, 水！太好了！)'],
    ['我 要 吃 苹果 。', 'I want to eat an apple.', 'The sentence you finish when you give him the apple']]
    .map(([zh, en, where]) => ({zh, en, where:'The prologue, changed on 17 October 2026: ' + where})),
  ...[['草 里 有 蛇 。', 'There are snakes in the grass.', 'The rabbit, by the long grass on the mountain path'],
    ['水 从 山 上 来 。', 'The water comes from up the mountain.', 'The sheep (the fox until 23 October 2026), at the fork in the river valley'],
    ['去 找 动物 吧 ！', 'Go and find the animals!', 'A monkey across the river, giving advice'],
    ['老板 有 苹果 。', 'The shop owner has apples.', 'A monkey across the river, giving advice'],
    ['累 了 吗 ？ 去 床 上 睡觉 吧 ！', 'Tired? Go and sleep in a bed!', 'A monkey just inside the cave’s entrance (teaching 睡觉 shuìjiào, to sleep; 累 lèi, tired, is just for listening)']]
    .map(([zh, en, where]) => ({zh, en, where:'New on 18 and 19 October 2026: ' + where})),
  ...[['我 是 老 猴子 。 这 是 花果山 。', 'I’m the old monkey. This is Flower Fruit Mountain.', 'The old monkey, after your first 你好'],
    ['去 找 猴子 吧 ！', 'Go and find the monkeys!', 'The old monkey, sending you to help the troop'],
    ['饿 猴子 要 吃 水果 。', 'The hungry monkey wants to eat some fruit.', 'The old monkey, checking in'],
    ['渴 猴子 要 喝 水 。', 'The thirsty monkey wants to drink some water.', 'The old monkey, checking in'],
    ['水果 在 树 上 。', 'Fruit grows on the trees.', 'The hungry monkey, after asking for fruit'],
    ['河 里 有 水 。', 'There’s water in the river.', 'The thirsty monkey, after asking for water'],
    ['我 要 吃 桃子 ！', 'I want to eat a peach!', 'A monkey of the troop'],
    ['树 上 有 鸟 。', 'There are birds in the trees.', 'A monkey of the troop (also in the story at the waterfall)']]
    .map(([zh, en, where]) => ({zh, en, where:'The prologue, more dialogue on 18 October 2026 (in the game): ' + where})),
  ...[['水 从 哪里 来 ？', 'Where does the water come from?', 'The little monkey, when the rocks have rolled away'],
    ['山 上 有 蛇 。', 'There are snakes up the mountain.', 'The old monkey, before you set off up the mountain path (山路 shānlù: please check this name too)'],
    ['山 上 有 瀑布 ！', 'There’s a waterfall up the mountain!', 'You, back from the top of the path (also in the story at the waterfall)'],
    ['山 上 有 路 。', 'There is a path up the mountain.', 'The example on 路 (path)’s page in the Word Scroll'],
    ['这 是 棍子 。', 'This is a stick.', 'The big monkey, giving you a stick before you set off'],
    ['花 上 有 蜜蜂 。', 'There is a bee on the flower.', 'The example on 蜜蜂 (bee)’s page'],
    ['山 上 有 野猪 。', 'There is a wild boar on the mountain.', 'The example on 野猪 (wild boar)’s page']]
    .map(([zh, en, where]) => ({zh, en, where:'The prologue, up the stream, 18 October 2026 (in the game): ' + where})),
  ...[['水帘洞 是 我们 的 家 。', 'The Water Curtain Cave is our home.'], ['你 很 勇敢 ！', 'You are very brave! (很 hěn, very; 勇敢 yǒnggǎn, brave)'],
    ['美猴王 ！', 'Handsome Monkey King!'], ['从此 ， 花果山 的 猴子 很 快乐 。', 'From then on, the monkeys of Flower Fruit Mountain were very happy. (从此 cóngcǐ, from then on; 快乐 kuàilè, happy)']]
    .map(([zh, en]) => ({zh, en, where:'New on 21 October 2026 (in the game): the scene of becoming king, which ends the prologue (its third caption, 你是我们的王！, is the big monkey’s line from before)'})),
  ...[['我们 有 家 了 ！', 'We have a home now!', 'The old monkey, at the start of chapter 1, before showing you the troop’s new home ground'],
    ['这里 很 大 ！', 'It’s so big here!', 'The old monkey, arriving at the home ground beside the waterfall (这里 zhèlǐ, here; the place is called 家园 jiāyuán, home ground: please check this name too)']]
    .map(([zh, en, where]) => ({zh, en, where:'New on 21 October 2026 (in the game): ' + where})),
  ...[['我们 要 木头 和 小 石头 ！', 'We need wood and small stones!', 'The big monkey, who wants to build the school (木头 mùtou, wood, is just for listening until you find some)'],
    ['我们 要 木头 。', 'We need wood.', 'The big monkey, if you come back without the wood'],
    ['我们 也 要 小 石头 。', 'We need small stones too.', 'The big monkey, if you come back without the stones'],
    ['木头 ！ 太 好 了 ！', 'Wood! Wonderful!', 'The big monkey, when you bring the wood (it was 你有木头吗？ till 24 October 2026)'],
    ['石头 ！ 太 好 了 ！', 'Stones! Wonderful!', 'The big monkey, when you bring the small stones (it was 你有石头吗？)'],
    ['我们 要 木头 。', 'We need wood.', 'The sentence you finish when you give him the wood (filling in 木头)'],
    ['我们 要 小 石头 。', 'We need small stones.', 'The sentence you finish when you give him the stones (filling in 石头)'],
    ['你 要 木头 吗 ？', 'Do you want wood?', 'A squirrel in the pine wood (the place is called 松林 sōnglín, pine wood: please check this name too), showing you the dry, dead pines']]
    .map(([zh, en, where]) => ({zh, en, where:'New on 21 October 2026 (in the game), building the school: ' + where})),
  ...[['我们 来 盖 学校 吧 ！', 'Let’s build the school!', 'The big monkey, once the school’s frame is up (盖 gài, to build a house, is just for listening)'],
    ['我们 有 木头 ， 也 有 石头 。', 'We have wood, and stones too.', 'The scene of the troop building the school, caption 1'],
    ['一 ， 二 ， 三 ！', 'One, two, three!', 'Caption 2, as the troop lifts the walls'],
    ['太 好 了 ！', 'Wonderful!', 'Caption 3, as the roof goes on'],
    ['这 是 我们 的 学校 ！', 'This is our school!', 'Caption 4, teaching 学校 xuéxiào, school (also the name of the place inside: please check it as a name too)'],
    ['上课 ！', 'Class is starting!', 'The old monkey, the teacher now, starting a lesson (上课 shàngkè, just for listening)'],
    ['老师 好 ！', 'Hello, teacher!', 'The class (the little monkey) greeting him, teaching 老师 lǎoshī, teacher'],
    ['同学 们 好 ！', 'Hello, class!', 'The teacher’s reply (同学们 tóngxuémen; 们 is just for listening)'],
    ['我们 是 同学 ！', 'We’re classmates!', 'The little monkey at school, teaching 同学 tóngxué, classmate'],
    ['下课 ！', 'Class is over!', 'The teacher, after a lesson (下课 xiàkè, just for listening)']]
    .map(([zh, en, where]) => ({zh, en, where:'New on 21 October 2026 (in the game), the school opens: ' + where})),
  ...[['一 ， 二 ， 三 ， 四 ！', 'One, two, three, four!', 'The teacher counting peaches onto his table, teaching 四 sì, four (and the same, one more each time, for 五 wǔ, 六 liù, 七 qī, 八 bā, 九 jiǔ and 十 shí: one, two… up to ten)'],
    ['桌子 上 有 几 个 桃子 ？', 'How many peaches are on the table?', 'The teacher, asking how many (几 jǐ and 个 gè are just for listening); the same with 苹果 (apples) and 碗 (bowls)'],
    ['这里 有 几 只 猴子 ？', 'How many monkeys are there?', 'The teacher, asking how many of something alive (几只); the same with 兔子 (rabbits) and 鸟 (birds)']]
    .map(([zh, en, where]) => ({zh, en, where:'New on 21 October 2026 (in the game), the number lessons at school: ' + where})),
  ...[['这 是 黑色 。', 'This is black.', 'The teacher opening a pot of paint, teaching 黑色 hēisè, black (and the same for 蓝色 lánsè blue, 绿色 lǜsè green, 棕色 zōngsè brown, 橙色 chéngsè orange and 粉色 fěnsè pink)']]
    .map(([zh, en, where]) => ({zh, en, where:'New on 21 October 2026 (in the game), the colour lessons at school: ' + where})),
  ...[['鹿 在 吃 草 。', 'The deer is eating grass.', 'The example on 鹿 (lù, deer)’s page: a deer you make friends with, in a sunny clearing in the pine wood'],
    ['草 里 有 狼 。', 'There is a wolf in the grass.', 'The example on 狼 (láng, wolf)’s page: wolves jump out of the long grass in the pine wood, to fight']]
    .map(([zh, en, where]) => ({zh, en, where:'New on 21 October 2026 (in the game), the bigger pine wood: ' + where})),
  {zh:'树 上 有 蜘蛛 。', en:'There is a spider in the tree.', where:'New on 21 October 2026 (in the game): the example on 蜘蛛 (zhīzhū, spider)’s page; the spider takes the bee’s place in the long grass on the way up the mountain path'},
  {zh:'对不起 ！', en:'Sorry!', where:'New on 20 October 2026 (in the game): the hungry monkey, once he’s eaten, saying sorry for being so fussy; you reply 没关系 (méi guānxi, that’s OK)'},
  ...[['这 是 红色 。', 'This is red.', 'The teacher opening a pot of paint, teaching 红色 hóngsè, red (and the same for 黄色 huángsè, yellow, and 白色 báisè, white): the first three colours now, taught by the big monkey’s flowers in the prologue until now'],
    ['我们 去 刷 灯笼 吧 ！', 'Let’s go and paint the lanterns!', 'The class, going out to paint the school’s lanterns red (灯笼 dēnglong, lanterns, and 刷 shuā, to paint with a brush, just for listening): see the question below. (Since 24 October 2026 the other colours paint nothing: the sign, the step, the door, the roof, the windows, the walls and the pillars stay as they were built.)'],
    ['灯笼 是 红色 的 ！', 'The lanterns are red!', 'Once they’re painted']]
    .map(([zh, en, where]) => ({zh, en, where:'New on 22 October 2026 (in the game), red, yellow and white at school: ' + where})),
  ...[['学校 很 好看 ！', 'The school looks lovely!', 'The big monkey, once you know red, yellow and white from the school’s first colour lesson (好看 hǎokàn, lovely, just for listening)'],
    ['我们 来 种花 吧 ！', 'Let’s plant some flowers!', 'The big monkey (种花 zhòng huā, to plant flowers, just for listening: written as one piece, so a voice saying it on its own can’t read 种 as zhǒng)'],
    ['我 要 红色 、 黄色 和 白色 的 花 ！', 'I want red, yellow and white flowers!', 'The big monkey, asking for flowers to plant in front of the school: see the question below about white flowers'],
    ['红色 的 花', 'A red flower', 'What you see on a card when you pick a red flower for him (and 黄色的花, a yellow flower, and 白色的花, a white flower)'],
    ['花 ！ 太 好 了 ！', 'Flowers! Wonderful!', 'The big monkey, when you bring them (it was 你有花吗？)'],
    ['我 要 红色 的 花 。', 'I want a red flower.', 'The sentence you finish when you give him the flowers (filling in 红色)']]
    .map(([zh, en, where]) => ({zh, en, where:'New on 22 October 2026 (in the game), flowers for the school (the big monkey’s flowers were in the prologue until now): ' + where})),
  {zh:'南天门', py:'Nán Tiān Mén', en:'the Southern Gate of Heaven', where:'New on 23 October 2026 (in the game): written on the plaque of the gate of heaven in the opening, when the light from the little monkey’s eyes reaches heaven and two gods step out of it to look (in the book, 千里眼 Qiānlǐ Yǎn, Thousand-Mile Eye, and 顺风耳 Shùnfēng Ěr, Wind-Following Ear; the game doesn’t name them). Written left to right, in simplified characters (门): please check that reads naturally on a gate of heaven'},
  {zh:'这里 有 几 个 石头 ？', en:'How many stones are there?', where:'New on 23 October 2026 (in the game): two little monkeys on the hillside, building a tower of stones, as the troop does in the book (砌宝塔), ask you to count its stones with them. 块 (kuài) is the usual measure word for stones (几块石头): is 几个石头 natural for small stones, said by a child, or should it be 几块?'},
  {zh:'我们 在 玩 水 ！', en:'We’re playing in the water!', where:'New on 23 October 2026 (in the game): two little monkeys splashing each other in the hillside’s brook, as the troop washes by the stream in the book (绿水涧边随洗濯), when you say hello'},
  {zh:'羊 吃 草 。', en:'Sheep eat grass.', where:'New on 23 October 2026 (in the game): the example on 羊 (yáng, sheep)’s page. A sheep you make friends with in the meadow takes the fox’s place in the prologue, so you meet 羊, then 山羊 (shānyáng, goat): a mountain sheep. The fox comes in chapter 1, on the hillside'},
  {zh:'来 看看 ！', en:'Come and take a look!', where:'New on 24 October 2026 (in the game): the goat on the hillside’s lookout, the first time you come up beside it, before it walks you to its railing to show you the view (it said 去看看！, go and take a look, and a player walked on without looking)'},
  ...[['我们 有 家 ， 也 有 学校 ！', 'We have a home, and a school too!', 'The old monkey at school, after your first two lessons, teaching 有 yǒu, to have (a word without a picture, as 要 is): then it’s time for a great feast, for the whole troop'],
    ['我 有 桃子 。', 'I have peaches.', 'A sentence you finish in a lesson, to practise 有 (filling in 有)'],
    ['我 有 朋友 。', 'I have friends.', 'Another, to practise 有 (also in the story at the waterfall)']]
    .map(([zh, en, where]) => ({zh, en, where:'New on 24 October 2026 (in the game), the feast announced: ' + where})),
  ...[['这 是 我们 的 大 桌子 ！', 'This is our big table!', 'The hungry monkey, by the feast’s big table under the big tree'],
    ['我们 有 桃子 ， 也 有 苹果 ！', 'We have peaches, and apples too!', 'The hungry monkey'],
    ['我们 没有 蜂蜜 ！', 'We don’t have any honey!', 'The hungry monkey, teaching 没有 méiyǒu, don’t have (蜂蜜 fēngmì, honey, just for listening till the bees)'],
    ['我 要 吃 蜂蜜 ！', 'I want to eat honey!', 'The hungry monkey'],
    ['我们 有 桃子 。', 'We have peaches.', 'The feast’s list, A at the table (and 我们有苹果。, we have apples)'],
    ['我们 没有 蜂蜜 。', 'We don’t have any honey.', 'The feast’s list'],
    ['我 没有 苹果 。', 'I don’t have any apples.', 'A sentence you finish in a lesson, to practise 没有 (filling in 没有)']]
    .map(([zh, en, where]) => ({zh, en, where:'New on 24 October 2026 (in the game), the hungry monkey at the feast’s table: ' + where})),
  ...[['我们 来 捉迷藏 吧 ！', 'Let’s play hide and seek!', 'A little monkey at the home ground (捉迷藏 zhuō mícáng, hide and seek, just for listening)'],
    ['一 ， 二 ， 三 ， 四 ， 五 ， 六 ， 七 ， 八 ， 九 ， 十 ！', 'One, two, three, four, five, six, seven, eight, nine, ten!', 'You, counting with your eyes covered'],
    ['我 来 了 ！', 'Here I come!', 'You, when you’ve counted to ten (is this what children say in hide and seek?)'],
    ['我 在 大 树 后面 ！', 'I’m behind the big tree!', 'The little monkey, calling out where it’s hiding'],
    ['我 在 桌子 下面 ！', 'I’m under the table!', 'The little monkey (下面 xiàmiàn, under, just for listening)'],
    ['我 在 桥 下面 ！', 'I’m under the bridge!', 'The little monkey'],
    ['我 在 水 里 ！', 'I’m in the water!', 'The little monkey, in the pool'],
    ['我 在 花 里 ！', 'I’m in the flowers!', 'The little monkey, in the patch of flowers (would 花丛里, in the flowerbed, be more natural? 花丛 isn’t a word in the game)'],
    ['找到 你 了 ！', 'Found you!', 'You, finding it (找到 zhǎodào, to find, just for listening)']]
    .map(([zh, en, where]) => ({zh, en, where:'New on 25 October 2026 (in the game), hide and seek: ' + where})),
  ...[['河边', 'The riverside', 'The name of the new path east from the home ground, along the stream, to the bees’ valley (shown and said as you arrive: is 河边 a good name for a place, or would 小河边 or another be better?)', 'hé biān'],
    ['蝴蝶 在 花 上 。', 'The butterfly is on the flower.', 'The example on 蝴蝶 (húdié, butterfly)’s page in the Word Scroll: a butterfly flutters over the wildflowers on the riverside'],
    ['百花谷', 'Valley of a Hundred Flowers', 'The name of the bees’ valley, at the end of the riverside (in the game since v266: please check the name)', 'Bǎi huā gǔ'],
    ['去 找 蜂王 吧 ！', 'Go and find the queen bee!', 'The sixth bee you make friends with in their valley (蜂王 fēngwáng, the queen bee, just for listening till you meet her: is 蜂王 right for a queen bee?). As each bee becomes your friend, you count them aloud: 一！, 一，二！ … up to 一，二，三，四，五，六！ (the counting lines the old monkey and the teacher say too)'],
    ['花 里 有 黄蜂 ！', 'There are wasps in the flowers!', 'The example on 黄蜂 (huángfēng, wasp)’s page in the Word Scroll: wasps jump out of the valley’s tall flowers to fight. How it’s made: 黄 (yellow, as in 黄色) + 蜂 (bee) = a yellow bee, a wasp']]
    .map(([zh, en, where, py]) => ({zh, en, py, where:'New on 25 October 2026 (in the game), the way to the bees: ' + where})),
  {zh:'你好 ！ 我 是 大 猴子 。', en:'Hello! I’m the big monkey.', where:'New on 24 October 2026 (in the game): the big monkey in the meadow (大猴子 dà hóuzi, his name in the game), saying who he is, teaching 我 (wǒ, I). The hungry monkey now teaches 水果 (fruit) as he asks for some (我饿了。我要吃水果！), and 吃 (eat) when you give him the fruit, just before you finish 我要吃苹果。; each fruit tree teaches its own fruit, 桃子 or 苹果'}
];

// Chapter 1, written but not built yet (the script was agreed on 17 October 2026). Its words aren't in the
// word bank yet, so each line gives its own pinyin. When it's built, these move into the area file.
// Questions for the native speaker about the game's Chinese.
const QUESTIONS = ['A sheep in the meadow teaches 羊 (yáng) as sheep, before the goat teaches 山羊 (shānyáng), so players see that a goat is a mountain sheep. Strictly, 羊 means any sheep or goat, and 绵羊 (miányáng) is the exact word for sheep. Is 羊 natural for the sheep?',
  'The big monkey wants red, yellow and white flowers to plant in front of the school. White flowers can be for funerals: are white ones all right in a flower bed in front of a school, or would pink (粉色 fěnsè) be better?',
  'Lanterns are usually made of red paper or cloth, not painted. Is 我们去刷灯笼吧！ (let’s go and paint the lanterns) natural for a class making the school’s lanterns red, or would something else be better?',
  'The goat’s tip says each Chinese character is one syllable (山 shān + 羊 yáng). 儿 in words such as 哪儿 (nǎr) joins the syllable before it: is the tip still fine for beginners as it is?',
  'When the troop is counted into the cave, the old monkey said 一只猴子。两只猴子。三只猴子。 while the cards taught 一, 二 and 三, which was muddling (two monkeys is 两只, not 二只). Now he counts them, as each one comes in: 一！ 一，二！ 一，二，三！ Is that natural? (两, for two of something, will be taught later as a word of its own, such as 两个苹果 at the shop. Until then, the number lessons never ask how many there are when there are two.)'];
const PUNCT = {'。':'.', '！':'!', '，':',', '？':'?', '、':',', '……':'…'};
function sheet(){
  const game = loadGame();
  const get = expr => JSON.parse(game.run(`JSON.stringify(${expr})`));
  const AREA = get('AREA'), BANK = get('WORD_BANK'), MENU = get('MENU_TILES'), MADE = get('MADE');
  // Pinyin for a sentence written with spaces between words, from the word bank.
  const py = zh => zh.split(' ').reduce((out, t) => PUNCT[t] ? out + PUNCT[t] : (out ? out + ' ' : '') + ((BANK[t] || {}).py || '??'), '');
  const chars = zh => zh.split(' ').join('');
  const row = cells => `| ${cells.join(' | ')} |`;
  const table = (head, rows) => [row(head), row(head.map(() => '---')), ...rows.map(row)].join('\n');
  const name = id => {   // a character's name, or for an animal friend (which has none), its word, such as 山羊 (goat)
    if (id === 'player') return '小猴子 (You)';
    const c = AREA.characters.find(x => x.id === id);
    return c && c.name ? `${c.name.zh} (${c.name.en})` : c && BANK[c.look] ? `${c.look} (${BANK[c.look].en})` : id;
  };

  // Who says each line
  const saidBy = {};
  const add = (key, who) => { (saidBy[key] = saidBy[key] || new Set()).add(who); };
  for (const [who, parts] of Object.entries(AREA.talk)) for (const p of parts) for (const s of p.do) if (s.say) add(s.say, name(s.by || who));   // (by: someone else says it)
  for (const [who, parts] of Object.entries(AREA.talk)) for (const p of parts) for (const s of p.do) if (s.countGame){   // counting with you: the question, and what they say if you get them all right
    const g = AREA.countGames[s.countGame];
    for (const k of [g.thing.ask, ...(g.win || []).map(w => w.say)]) if (k) add(k, name(who));
  }
  for (const r of Object.values(AREA.requests)) for (const k of [r.ask, r.offer, r.thanks, r.wrong]) if (k) add(k, name(r.from));
  if (AREA.shop) for (const k of [AREA.shop.ask, AREA.shop.welcome]) add(k, name(AREA.shop.who));
  for (const r of Object.values(AREA.requests)) if (r.wrongAnswer) add(r.wrongAnswer, name(r.from));
  if (AREA.hideSeek){   // hide and seek: you count and find it; it calls out where it's hiding
    const h = AREA.hideSeek;
    for (const k of [h.count, h.coming, h.found]) add(k, 'you');
    for (const p of h.spots) add(p.say, name(h.by));
  }

  const collect = Object.keys(BANK).filter(w => BANK[w].area === AREA.number), heard = Object.keys(BANK).filter(w => !BANK[w].area);
  const names = [...AREA.characters.filter(c => c.name).map(c => c.name), AREA.sign.name, AREA.name, ...Object.values(AREA.places).map(p => p.name)];   // characters, the sign, the area and its places
  const builds = [...Object.values(AREA.requests).flatMap(r => (r.choices ? Object.values(r.choices) : [r]).map(c => [c.sentence, c.sentenceEn, name(r.from)])), ...(AREA.shop ? AREA.shop.items.map(i => [i.sentence, i.sentenceEn, name(AREA.shop.who)]) : []), ...(AREA.wardrobe || []).map(c => [c.sentence, c.sentenceEn, 'You, in the wardrobe']),
    ...(AREA.practiceSentences || []).map(c => [c.sentence, c.sentenceEn, 'You, in a lesson at school'])];
  const notes = '';
  // how a word is made, in one line: its parts (each Chinese, pinyin, English) and what they add up to; or the clue inside it;
  // or the character it shares with another word
  const part = ([zh, p, en]) => `${zh} ${p} (${en})`;
  const made = m => m.parts ? `${m.parts.map(part).join(' + ')} = ${m.why}` : m.clue ? `${part(m.clue)}: ${m.why}` : m.same ? `${part(m.same)}, as in ${m.as}: ${m.why}` : m.why;

  return `# Chinese in Little Monkey: for checking

Everything the player reads or hears in Chinese, with pinyin and English. Please check that each
piece is natural, simple Mandarin that a child or beginner might hear, that the pinyin and tones are
right, and that the English means the same. Write anything to change in the last column.

This file is made from the game's content by \`npm run chinese\`; don't edit it by hand.
The pinyin of sentences is put together word by word, so tone changes (such as 一 and 不) are only
shown where the word list has them.

## ${AREA.name.zh} ${AREA.name.en}

### Lines characters say

${table(['Chinese', 'Pinyin', 'English', 'Said by', 'Notes'], Object.entries(AREA.lines).map(([k, l]) => [chars(l.zh), py(l.zh), l.en.replace(/\{([^}|]+)(?:\|([^}]*))?\}/g, (m, w, en) => en || BANK[w].en.split(',')[0]), [...(saidBy[k] || [])].join(', '), notes]))}

### Sentences the player completes (one word missing)

${table(['Chinese', 'Pinyin', 'English', 'Said to', 'Notes'], builds.map(([b, en, who]) => [chars(b), py(b), en || '', who, notes]))}

### What you pick

What a card shows when you pick a flower for the big monkey: a red flower, and so on.

${table(['Chinese', 'Pinyin', 'English', 'Notes'], [...new Map(Object.values(AREA.legend).filter(t => t.gather && t.gather.picked).map(t => [t.gather.picked.zh, t.gather.picked])).values()].map(f => [chars(f.zh), py(f.zh), f.en, notes]))}

### The feast's list

What A at the feast's big table shows: what the troop has, and what it still needs.

${table(['Chinese', 'Pinyin', 'English', 'Notes'], (AREA.feastList ? AREA.feastList.foods : []).flatMap(f => [f.yes, f.no].filter(Boolean)).map(l => [chars(l.zh), py(l.zh), l.en, notes]))}

### The sign

${table(['Chinese', 'Pinyin', 'English', 'Notes'], [[chars(AREA.sign.says.zh), py(AREA.sign.says.zh), AREA.sign.says.en, notes]])}

### The story at the waterfall

${table(['Chinese', 'Pinyin', 'English', 'Notes'], AREA.story.map(s => [chars(s.zh), py(s.zh), s.en, notes]))}

### Example sentences on word pages

For words that no line or story sentence uses, shown on the word's page in the Word Scroll.

${table(['Chinese', 'Pinyin', 'English', 'For the word', 'Notes'], Object.entries(AREA.examples).map(([w, e]) => [chars(e.zh), py(e.zh), e.en, w, notes]))}

### Questions after the story

${table(['Chinese', 'Pinyin', 'English', 'Answer', 'Notes'], AREA.storyQuestions.map(q => [chars(q.zh), py(q.zh), q.en || '', q.answer, notes]))}

### The opening scene

${table(['Chinese', 'Pinyin', 'English', 'Notes'], AREA.intro.map(c => [chars(c.zh), py(c.zh), c.en, notes]))}
${Object.entries(AREA.scenes || {}).filter(([, sc]) => sc.watch).map(([id, sc]) => `
### Scene: ${sc.watch.replace(/^Watch /, '')}

${table(['Chinese', 'Pinyin', 'English', 'Notes'], sc.captions.map(c => [chars(c.zh), py(c.zh), c.en, notes]))}
`).join('')}${Object.values(AREA.scenes || {}).some(sc => !sc.watch) ? `
### Scenes after lessons (the class painting the school)

${table(['Chinese', 'Pinyin', 'English', 'Notes'], Object.values(AREA.scenes).filter(sc => !sc.watch).flatMap(sc => sc.captions).map(c => [chars(c.zh), py(c.zh), c.en, notes]))}
` : ''}
### Names

${table(['Chinese', 'Pinyin', 'English', 'Notes'], names.map(n => [n.zh, n.py, n.en, notes]))}

### Words to collect

${table(['Chinese', 'Pinyin', 'English', 'Notes'], collect.map(w => [w, BANK[w].py, BANK[w].en, notes]))}

### How words are made

Shown on a word's new-word card and its page in the Word Scroll (new on 23 October 2026, not checked yet): its parts and
what they add up to, the clue inside it, or the picture it was drawn from. Please check that each is true, well known and
simply put. A part's pinyin is as it's said in the word.

${table(['Word', 'Pinyin', 'How it’s made', 'Notes'], [...Object.entries(MADE).map(([w, m]) => [w, BANK[w].py, made(m), notes]),
  ...(AREA.sign.made ? [[AREA.sign.says.zh, AREA.name.py, `${made(AREA.sign.made)} (your home’s name, on the sign by your stone, once you know its parts)`, notes]] : [])])}

### Tips about Chinese

Each shown once, on a card, the first time an animal plays with you (new on 23 October 2026, not checked yet). Please
check that each is true and simply put.

${table(['Tip', 'Example', 'Text', 'Notes'], Object.values(AREA.tips || {}).map(t => [t.title, t.example.map(([c, p]) => `${c} ${p}`).join(' + '), [t.heard, t.text].filter(Boolean).join('. '), notes]))}

### Words only heard in sentences

${table(['Chinese', 'Pinyin', 'English', 'Notes'], heard.map(w => [w, BANK[w].py, BANK[w].en, notes]))}

## The menu

The names of the menu's tiles, shown with pinyin and English.

${table(['Chinese', 'Pinyin', 'English', 'Notes'], MENU.map(t => [t.zh, t.py, t.en, notes]))}

## New sentences to check

Sentences that haven't been checked yet: new ones waiting to go into the game, and new ones already in it.

${DRAFTS.length ? table(['Chinese', 'Pinyin', 'English', 'Where', 'Notes'], DRAFTS.map(d => [chars(d.zh), d.py || py(d.zh), d.en, d.where, notes])) : 'None at the moment.'}

## Questions

${QUESTIONS.map(q => '- ' + q).join('\n')}
`;
}

module.exports = {sheet, DRAFTS, QUESTIONS, FILE: path.join(ROOT, 'CHINESE.md')};
if (require.main === module){
  fs.writeFileSync(module.exports.FILE, sheet());
  console.log('Wrote CHINESE.md');
}
