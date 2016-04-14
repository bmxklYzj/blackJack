/**
 * Created by 94822 on 2016/4/10.
 */
/**
 * 全局变量
 */

'use strict';

var tips = document.querySelector(".tips"),                     //顶部提示
    bankerCard = document.querySelector(".banker-card"),        //庄家纸牌显示
    playerCard = document.querySelector(".player-card"),        //玩家纸牌显示
    playerCardDouble = document.querySelector(".player-card-double"), //玩家double之后纸牌显示
    insuranceBtn = document.querySelector(".insurance"),        //保险
    dealBtn = document.querySelector(".deal"),                  //发牌
    addBet = document.querySelector(".add-bet"),                //增加筹码的容器
    addBetBtns = addBet.querySelectorAll("button"),             //增加筹码的具体的按钮
    operation = document.querySelector(".operation"),           //四个操作按钮的容器
    operationBtns = operation.querySelectorAll("button"), //四个操作按钮
    money = document.querySelector(".money"),                   //四种money按钮的容器
    moneyBtns = document.querySelectorAll(".operation button"), //四种money的按钮
    betNum = document.querySelector(".betNum"),                 //底部bet的金额
    balanceNum = document.querySelector(".balanceNum");         //底部余额
var bet = 0,                                                    //玩家当前赌注
    balance = 100;                                              //玩家余额

var PLAYER_INITIAL_BALANCE = 100;                                 //玩家初始balance
var firstCardsFinished = false; //全局变量，用于在分牌后判断第一副牌是否运行完毕，方便第二副牌运行


//黑桃，红桃，梅花，方块，四种花色顺序分别是：A,1,2,....,10,J,Q,K
var cards = ['11','12','13','14','15','16','17','18','19','20','1a','1b','1c'
            ,'21','22','23','24','25','26','27','28','29','30','2a','2b','2c'
            ,'31','32','33','34','35','36','37','38','39','40','3a','3b','3c'
            ,'41','42','43','44','45','46','47','48','49','50','4a','4b','4c'
            ,'unknown'];

/*
var img = document.createElement("img");
img.src = "images/"+ card[0]  + ".JPG";
playerCard.appendChild(img);*/

/**
 * PlayerClass类，拥有属性：若干牌cards
 * @constructor
 */
function PlayerClass() {
    this.cards = [];
}
//使用原型方式为 PlayerClass 添加计算点数point的方法,传入一个参数是为了区分后面的Player的cards 和 cardsCopy
PlayerClass.prototype.getPoint = function(mycards) {
    var i,
        len = mycards.length,
        sum = 0,
        flag = true;

    for(i = 0; i < len; i++) {
        sum += transformToPoint(mycards[i], flag);
    }
    if(sum <= 21) {
        return sum;
    } else {
        sum = 0;
        for(i = 0; i < len; i++) {
            sum += transformToPoint(mycards[i], !flag);
        }
        return sum;
    }
};

/**
 * 庄家Banker继承PlayerClass，庄家没有bet和balance属性
 * @constructor
 */
function Banker() {
    PlayerClass.call(this);
}
Banker.prototype = new PlayerClass();
Banker.prototype.constructor = Banker;


/**
 * 玩家Player继承PlayerClass，拥有bet和balance属性
 * @param bet
 * @param balance
 * @constructor
 */
function Player(bet, balance) {
    PlayerClass.call(this);

    this.bet = bet;
    this.balance = balance;
    this.cardsCopy = [];        //分牌后存储第二副牌
}
Player.prototype = new PlayerClass();
Player.prototype.constructor = Player;
/*//分牌后第二副牌的点数
Player.prototype.getPointCopy = function() {
    var i,
        len = this.cardsCopy.length,
        sum = 0;
    for(i = 0; i < len; i++) {
        sum += transformToPoint(this.cardsCopy[i]);
    }
    return sum;
};*/

//创建player和banker的实例
var player = new Player(0, PLAYER_INITIAL_BALANCE); //初始化玩家和庄家
var banker = new Banker();

//初始提示用户游戏规则
showTips("游戏规则参见：<a target='_blank' href='http://baike.so.com/doc/5329886-5565060.html'>黑杰克</a>");

(function() {
    /**
     * 开始游戏
     */
    var array = new Array(52);  //用来标记52张牌是否已经使用过
    //取牌随机数
    function getCardIndex() {
        var len = array.length;
        var index = Math.floor(Math.random() * len);
        var num = array[index];
        array.splice(index, 1);
        return num;
    }

    /**
     * 初始化界面 和 玩家庄家等
     */
    function init() {
        player.cards = [];      //初始化时要将数组清零
        player.cardsCopy = [];
        banker.cards = [];

        firstCardsFinished = false;
        player.bet = 0;
        bankerCard.innerHTML = '';
        playerCard.innerHTML = '';
        playerCardDouble.innerHTML = '';
        addBet.innerHTML = '';
        insuranceBtn.style.display = 'none';
        operation.style.display = 'none';
        tips.style.opacity = '0';
        updateBetBalance();

        money.addEventListener('click', addBetFunc);
        addBet.addEventListener('click', removeBetFunc);
        money.style.display = 'block';

        //初始化时array数组是满的
        for(var i = 0; i < 52; i++) {
            array[i] = i;
        }
    }
    init();

    function run() {
        /**
         * player点击发牌之后判断赌注bet是否为0，
         * 然后将下方四个money按钮隐藏，显示操作按钮
         */
        if(player.bet) {
            //庄家和玩家随机发两张牌
            banker.cards.push(getCardIndex());
            banker.cards.push(getCardIndex());

            /*player.cards.push(11);
            player.cards.push(12);*/
            player.cards.push(getCardIndex());
            player.cards.push(getCardIndex());


            console.log(banker.cards);
            console.log(player.cards);
            bankerCard.innerHTML = '<img src="images/'+ cards[banker.cards[0]] +'.JPG" alt="card"><img src="images/unknow.JPG" style="margin-left: 1em" alt="card">';
            //playerCard.innerHTML = '<img src="images/'+ cards[player.cards[0]] +'.JPG" alt="card"><img src="images/'+ cards[player.cards[1]] +'.JPG" style="margin-left: 1em;" alt="card">';
            playerCard.innerHTML = showCard(player.cards);

            //下方四个money按钮隐藏，显示操作按钮
            operation.style.display = 'block';
            operationBtns[1].style.display = 'inline-block';
            operationBtns[2].style.display = 'inline-block';
            operationBtns[3].style.display = 'inline-block';
            money.style.display = 'none';

            operationBtns[0].style.display = 'none'; //默认先隐藏 分牌按钮
            dealBtn.removeEventListener('click', run); //移除 发牌按钮 的事件监听
            dealBtn.innerHTML = player.getPoint(player.cards); //在右方按钮显示当前点数
            addBet.removeEventListener('click', removeBetFunc); //移除 撤销赌注 的事件监听

            operationBtns[2].addEventListener('click', hit);
            operationBtns[3].addEventListener('click', stand);

            //判断player的两张牌如果是相同的可以拆牌
            if(transformToPoint(player.cards[0], false) === transformToPoint(player.cards[1], false)) {
                operationBtns[0].style.display = 'inline-block'; //显示 分牌按钮
                operationBtns[0].addEventListener('click', splitCard);
            }

            //player加倍
            operationBtns[1].addEventListener('click', doubleCard);

            //如果banker的明牌是A，那么player是否买保险
            if(transformToPoint(banker.cards[0], true) === 11) {
                insuranceBtn.style.display = 'block';
                insuranceBtn.addEventListener('click', insurance);
            }

        } else {
            showTips("还没有下注，不能开始游戏");
        }

        //hit和stand的事件监听函数
        function hit() {
            insuranceBtn.removeEventListener('click', insurance);
            operationBtns[0].style.display = 'none'; //隐藏 分牌按钮
            operationBtns[0].removeEventListener('click', splitCard);
            operationBtns[1].style.display = 'none';    //隐藏 加倍 按钮
            operationBtns[1].removeEventListener('click', doubleCard);

            console.log("h");
            player.cards.push(getCardIndex());
            playerCard.innerHTML = showCard(player.cards);
            dealBtn.innerHTML = player.getPoint(player.cards);
            if(player.getPoint(player.cards) > 21) {   //如果爆牌就取消事件监听
                showTips("你爆牌了,游戏结束！");
                operationBtns[2].removeEventListener('click', hit);
                operationBtns[3].removeEventListener('click', stand);
                overGame();
            }
        }
        function stand() {
            insuranceBtn.removeEventListener('click', insurance);
            operationBtns[0].removeEventListener('click', splitCard);   //取消事件监听
            operationBtns[1].removeEventListener('click', doubleCard);
            operationBtns[2].removeEventListener('click', hit);
            operationBtns[3].removeEventListener('click', stand);
            overGame();
        }
        function insurance() {
            insuranceBtn.style.display = 'none';
            insuranceBtn.removeEventListener('click', insurance);
            if(player.balance < player.bet/2) {
                showTips("余额不足，不能买保险！");
            } else {
                player.balance -= (player.bet/2);
                updateBetBalance();
                if(transformToPoint(banker.cards[1], true) === 10) {
                    showTips("庄家是黑杰克!");
                    player.balance += player.bet*1.5;
                    operationBtns[0].removeEventListener('click', splitCard);   //取消事件监听
                    operationBtns[1].removeEventListener('click', doubleCard);
                    operationBtns[2].removeEventListener('click', hit);
                    operationBtns[3].removeEventListener('click', stand);

                    bankerCard.innerHTML = showCard(banker.cards);
                    console.log("s");
                    startAgain();
                } else {
                    showTips("庄家不是黑杰克，游戏继续！");
                }
            }
        }

        /**
         * 玩家 加倍 doubleCard()
         * 为避免冗余，doubleCard和 stand不用隐藏其它的按钮，因为他们点击之后游戏直接结束了，然后直接在overGame函数中隐藏除dealBtn之外的所有的按钮就行了,但需要取消事件监听
         */
        function doubleCard() {
            insuranceBtn.style.display = 'none'; //隐藏 保险按钮
            insuranceBtn.removeEventListener('click', insurance);
            operationBtns[0].removeEventListener('click', splitCard);   //取消事件监听
            operationBtns[1].removeEventListener('click', doubleCard);
            operationBtns[2].removeEventListener('click', hit);
            operationBtns[3].removeEventListener('click', stand);

            player.cards.push(getCardIndex());
            playerCard.innerHTML = showCard(player.cards);
            dealBtn.innerHTML = player.getPoint(player.cards);

            if(player.getPoint(player.cards) > 21) {
                showTips("爆掉啦!");
            }
            overGame();
        }

        /**
         * 玩家分牌之后的 拿牌函数 hitCard()
         */
        function splitHitCard(myCards) {

            //添加拿牌、停牌事件监听
            function splitHit() {
                myCards.push(getCardIndex());
                console.log(myCards);
                var whichCard = (myCards === player.cards) ? playerCard : playerCardDouble;
                whichCard.innerHTML = showCard(myCards);
                dealBtn.innerHTML = player.getPoint(myCards);

                if(player.getPoint(myCards) > 21) {   //如果爆牌就取消事件监听
                    operationBtns[2].removeEventListener('click', splitHit);
                    operationBtns[3].removeEventListener('click', splitStand);
                    firstCardsFinished = true;
                    if(myCards === player.cardsCopy) {  //如果是第二副牌就直接结束游戏
                        overGame();
                    }
                }
            }
            operationBtns[2].addEventListener('click', splitHit);

            function splitStand() {
                operationBtns[2].removeEventListener('click', splitHit);
                operationBtns[3].removeEventListener('click', splitStand);
                firstCardsFinished = true;
                if(myCards === player.cardsCopy) {  //如果是第二副牌就直接结束游戏
                    overGame();
                }
            }
            operationBtns[3].addEventListener('click', splitStand);

        }

        /**
         * 玩家 拆牌 splitCard()
         */
        function splitCard() {
            insuranceBtn.style.display = 'none';                    //隐藏 保险按钮
            insuranceBtn.removeEventListener('click', insurance);
            operationBtns[0].style.display = 'none';                //隐藏 分牌按钮
            operationBtns[0].removeEventListener('click', splitCard);
            operationBtns[1].style.display = 'none';                //隐藏 double按钮
            operationBtns[1].removeEventListener('click', doubleCard); //取消double按钮的事件监听
            //分牌之后只能操作 拿牌 和 停牌了，取消全局的hit和standbain绑定，使用splitHit和splitStand函数
            operationBtns[2].removeEventListener('click', hit);
            operationBtns[3].removeEventListener('click', stand);

            if(player.balance < player.bet) {
                showTips("余额不足，不能加倍！");
            } else {
                var temp = player.cards.splice(1, 1);
                player.cardsCopy.push(temp);
                playerCard.style.left = '3em'; //将第一副牌向左移一点，优化界面
                playerCard.innerHTML = showCard(player.cards);
                playerCardDouble.innerHTML = showCard(player.cardsCopy);

                player.balance -= player.bet;   //加倍之后更新余额，要减去当前的bet
                updateBetBalance();

                //分别对两副牌执行hitCard()函数，直到玩家burst||stand
                showTips("您现在操作的是左边一副牌！");
                splitHitCard(player.cards);
                //hitCard(player.cardsCopy);

                //第一副牌执行完毕，以下是第二副牌
                //hitCard(player.cardsCopy);
                (function secondCard() {
                    var i;
                    i = setTimeout(secondCard, 50);    //这里又是一个循环监听，等第一副牌执行完毕，再来执行第二副牌
                    if(firstCardsFinished) {
                        clearTimeout(i);
                        showTips("您现在操作的是右边一副牌！");
                        splitHitCard(player.cardsCopy);
                    }
                })();

                //overGame();
            }
        }
    }
    dealBtn.addEventListener('click', run); //拿牌

    /**
     * 将cards数组中的元素显示成图片
     * @param myCards   数组的名称
     * @returns {string}
     */
    function showCard(myCards) {
        var i,
            len = myCards.length,
            img='';
        for(i = 0; i < len; i++) {
            img += ('<img src="images/'+ cards[myCards[i]] +'.JPG" style="margin-left: '+ i +'em;" alt="card">')
        }
        return img;
    }




    /**
     * 结束游戏，计算输赢
     */
    function overGame() {
        //先隐藏所有的按钮
        insuranceBtn.style.display = 'none';
        operationBtns[0].style.display = 'none';
        operationBtns[1].style.display = 'none';
        operationBtns[2].style.display = 'none';
        operationBtns[3].style.display = 'none';

        (function bankerDeal() {
            var i = setTimeout(bankerDeal, 50);
            //console.log(banker.cards);
            bankerCard.innerHTML = showCard(banker.cards);
            if(banker.getPoint(banker.cards) < 17) {
                banker.cards.push(getCardIndex());
                //console.log(banker.cards);
                i = setTimeout(bankerDeal, 50);
            } else {
                clearTimeout(i);
            }
        })();

        var bankerPoint = banker.getPoint(banker.cards);
        var playerPoint = player.getPoint(player.cards);
        var playerPointCopy = player.getPoint(player.cardsCopy);

        if(firstCardsFinished) {  //firstCardsFinished 为true 表示分过牌

            if(bankerPoint === 21) {            //banker和player都是21,player.balance += player.bet;
                if(playerPoint === 21) {
                    player.balance += player.bet;showTips("第一副牌平局");
                } else {
                    showTips("第一副牌输了");
                }
                if(playerPointCopy === 21) {
                    player.balance += player.bet;setTimeout(function() {showTips("第二副牌平局");}, 1000);
                } else {
                    setTimeout(function() {showTips("第二副牌输了")}, 1000);
                }
            } else if(bankerPoint > 21) {       //banker>21而player <= 21, player.balance += player.bet*2;
                if(playerPoint <= 21) {
                    player.balance += player.bet*2;showTips("第一副牌赢了");
                } else {
                    showTips("第一副牌输了");
                }
                if(playerPointCopy <= 21) {
                    player.balance += player.bet*2;setTimeout(function() {showTips("第二副牌赢了")}, 1000);
                } else {
                    setTimeout(function() {showTips("第二副牌输了")}, 1000);
                }
            } else {                            //banker < 21
                if(playerPoint <= 21) {
                    if(playerPoint > bankerPoint) {
                        player.balance += player.bet*2;showTips("第一副牌赢了");
                    } else if(playerPoint === bankerPoint) {
                        player.balance += player.bet;showTips("第一副牌平局");
                    } else {
                        showTips("第一副牌输了");
                    }
                }
                if(playerPointCopy <= 21) {
                    if(playerPointCopy > bankerPoint) {
                        player.balance += player.bet*2;setTimeout(function() {showTips("第二副牌赢了")}, 1000);
                    } else if(playerPointCopy === bankerPoint) {
                        player.balance += player.bet;setTimeout(function() {showTips("第二副牌平局")}, 1000);
                    } else {
                        setTimeout(function() {showTips("第二副牌输了")}, 1000);
                    }
                }
            }
        } else {    //没有分过牌，注意玩家可能是black jack时候的balance
            if(bankerPoint === 21) {                                    //banker === 21
                if(player.cards.length == 2 && playerPoint === 21) {    //玩家是black jack
                    player.balance += player.bet*3;setTimeout(function() {showTips("你是黑杰克，赢了")}, 1000);
                } else if(playerPoint === 21) {                         //玩家是普通21点
                    player.balance += player.bet;setTimeout(function() {showTips("平局")}, 1000);
                } else {
                    setTimeout(function() {showTips("你输了")}, 1000);
                }
            } else if(bankerPoint > 21) {                               //banker > 21
                if(playerPoint <= 21) {
                    player.balance += player.bet*2;setTimeout(function() {showTips("你赢了")}, 1000);
                } else {
                    setTimeout(function() {showTips("你输了")}, 1000);
                }
            } else {                                                    //banker < 21
                if(playerPoint <= 21) {
                    if(player.cards.length == 2 && playerPoint === 21) {    //玩家是black jack
                        player.balance += player.bet*3;setTimeout(function() {showTips("你是黑杰克，赢了")}, 1000);
                    } else if(playerPoint === 21) {                         //玩家是普通21点
                        player.balance += player.bet*2;setTimeout(function() {showTips("你赢了")}, 1000);
                    } else if(playerPoint === bankerPoint) {
                        player.balance += player.bet;setTimeout(function() {showTips("平局")}, 1000);
                    } else if(playerPoint > bankerPoint) {
                        player.balance += player.bet*2;setTimeout(function() {showTips("你赢了")}, 1000);
                    } else {
                        console.log("shu");
                        setTimeout(function() {showTips("你输了")}, 100);
                    }
                }
            }

        }
        startAgain();
    }

    function startAgain() {

        setTimeout(function() {showTips("点击右侧按钮重新玩")}, 2000);
        dealBtn.innerHTML = "again";
        dealBtn.addEventListener('click', again);

        function again()  {
            //判断balance是否 不足，选择重置balance
            if(player.balance < 5) {
                var msg = confirm("您的余额不足，是否重置游戏余额？");
                if(msg) {
                    player.balance = 100;
                }
            }

            dealBtn.removeEventListener('click', again);
            if(player.bet >= 5) {
                init();
                dealBtn.addEventListener('click', run); //拿牌
            }
        }
    }

    /**
     * 开始游戏后下注时的金额money按钮设置事件代理
     */
    function addBetFunc(event) {
        //console.log(event + event.target.className);
        var isEnough = true;
        var notButton = false;

        switch (event.target.className){
            case 'm5':
                if(player.balance < 5) {
                    isEnough = false;
                } else {
                    player.bet += 5;
                    player.balance -= 5;
                    break;
                }
            case 'm10':
                if(player.balance < 10) {
                    isEnough = false;
                } else {
                    player.bet += 10;
                    player.balance -= 10;
                    break;
                }
            case 'm25':
                if(player.balance < 25) {
                    isEnough = false;
                } else {
                    player.bet += 25;
                    player.balance -= 25;
                    break;
                }
            case 'm100':
                if(player.balance < 100) {
                    isEnough = false
                } else {
                    player.bet += 100;
                    player.balance -= 100;
                    break;
                }
            default:
                notButton = true;
                break;
        }
        if(!isEnough) {
            showTips("余额不足，无法加注！");
        } else {
            if(!notButton) {
                var addedBet = document.createElement("button");
                addedBet.innerHTML = (event.target.className).substring(1);
                addedBet.classList.add(event.target.className.toString());
                addBet.appendChild(addedBet);
            }
        }
        updateBetBalance();
    }

    /**
     * 删除赌注
     */
    function removeBetFunc(event) {
        var notButton = false;
        switch (event.target.className) {
            case 'm5':
                player.bet -= 5;
                player.balance += 5;
                break;
            case 'm10':
                player.bet -= 10;
                player.balance += 10;
                break;
            case 'm25':
                player.bet -= 25;
                player.balance += 25;
                break;
            case 'm100':
                player.bet -= 100;
                player.balance += 100;
                break;
            default:
                notButton = true;
                break;
        }
        updateBetBalance();
        //移除点击的money
        //notButton 是为了防止点击了addBet容器，却没有点击里面的按钮时也会删除按钮
        if(!notButton) {
            event.target.remove();
        }
    }


    /**
     * 更新 bet 和 balance
     */
    function updateBetBalance() {
        betNum.innerHTML = player.bet;
        balanceNum.innerHTML = player.balance;
    }


})();


/**
 * 顶部显示tips
 * @param msg string 消息
 */
function showTips(msg) {
    tips.innerHTML = msg;
    tips.classList.add("fadeIn");
    setTimeout(function() {
            tips.classList.remove("fadeIn");
            tips.classList.add("fadeOut");
        },
        1000);
    setTimeout(function() {
            tips.classList.remove("fadeOut");
        },
        2000);
}

/**
 * 将cards数组转化为对应的点数
 * @param i
 * @param flag 如果flag==true表示A为11，否则A为1
 * @returns {*}
 */
function transformToPoint(i, flag) {
    if(flag) {
        if(i === 0 || i === 13 || i === 26 || i === 39) {
            return 11;
        }
    } else {
        if(i === 0 || i === 13 || i === 26 || i === 39) {
            return 1;
        }
    }

    if(i >= 1 && i <= 12) {
        if(i <= 9) {
            return i+1;
        } else {
            return 10;
        }
    } else if(i >= 14 && i <= 25) {
        if( i <= 22) {
            return (i - 12);
        } else {
            return 10;
        }
    } else if(i >= 27 && i <= 38) {
        if(i <= 35) {
            return (i - 25);
        } else {
            return 10;
        }
    } else if(i >= 40 && i <= 51) {
        if(i <= 48) {
            return (i - 38);
        } else {
            return 10;
        }
    }
}

