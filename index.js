var Chess = /** @class */ (function () {
    function Chess() {
        this.rows = 15;
        this.cols = 15;
        this.nextChess = 1;
        this.interval = 40;
        this.dom = document.querySelector('#game');
        this.infoDom = document.querySelector('#info');
        this.reset = document.querySelector('#reset');
        this.back = document.querySelector('#back');
        this.backBoard = [];
        this.board = this.initBoard();
        this.infoDom.innerHTML = "游戏开始，当前落子方：黑棋";
        this.dom.innerHTML = "";
        this.bindEvent();
    }
    /**
     * 初始化棋盘数组
     */
    Chess.prototype.initBoard = function () {
        var _a = this, rows = _a.rows, cols = _a.cols;
        var board = new Array(rows), len = board.length;
        for (var i = 0; i < len; i++) {
            board[i] = new Array(cols);
            // 将数组的每一位填充为0
            board[i].fill(0);
        }
        return board;
    };
    /**
     * 黑白玩家下棋子
     * @param row 行
     * @param col 列
     */
    Chess.prototype.playChess = function (row, col) {
        // 对该位置能否落子进行判断
        if (this.canMoveChess(row, col)) {
            return;
        }
        // 改变二维数组的值
        this.board[row][col] = this.nextChess;
        // 根据下棋的对应位置创建对应位置的dom
        var div = document.createElement('div');
        // 根据当前落子方确定类名
        div.className = "chess " + (this.nextChess === 1 ? "black" : "white");
        // 根据二维数组中的位置确定dom的位置
        div.style.left = col * this.interval + "px";
        div.style.top = row * this.interval + "px";
        this.dom.appendChild(div);
        // 每下一个棋子，就入栈： 将当前相关的信息添加到撤销队列中
        this.backBoard.push({
            lastDom: div,
            lastChess: this.nextChess,
            row: row,
            col: col
        });
        // 改变落子方
        this.nextChess = this.nextChess === 1 ? 2 : 1;
        // 每次落子判断胜负
        if (this.hasWin(row, col)) {
            this.gameOver = true;
            this.dom.onclick = null;
            this.back.onclick = null;
        }
        this.showInfo();
    };
    /**
     * 检查是否有人赢了
     * @param row
     * @param col
     */
    Chess.prototype.hasWin = function (row, col) {
        // 判断二维数组中是否有相连着的
        // 横向
        var curChess = this.getChess(row, col);
        return this.checkHorizontal(row, col, curChess) ||
            this.checkVertical(row, col, curChess) ||
            this.checkSlash(row, col, curChess) ||
            this.checkBackSlash(row, col, curChess);
    };
    /**
     * 检查纵向
     * @param row
     * @param col
     * @param chess
     */
    Chess.prototype.checkVertical = function (row, col, chess) {
        var line = 1; // 从自己开始计算，往上边和下边走。看有无与自己相同的
        for (var i = row - 1; this.getChess(i, col) === chess; i--) {
            line++;
        }
        for (var i = row + 1; this.getChess(i, col) === chess; i++) {
            line++;
        }
        return line >= 5;
    };
    /**
     * 检查正斜线方向
     * @param row
     * @param col
     * @param chess
     */
    Chess.prototype.checkSlash = function (row, col, chess) {
        var line = 1; // 从自己开始计算，往正斜线防线走。看有无与自己相同的
        for (var i = row - 1, j = col + 1; this.getChess(i, j) === chess; i--, j++) {
            line++;
        }
        for (var i = row + 1, j = col - 1; this.getChess(i, j) === chess; i++, j--) {
            line++;
        }
        return line >= 5;
    };
    /**
     * 检查反斜线方向
     * @param row
     * @param col
     * @param chess
     */
    Chess.prototype.checkBackSlash = function (row, col, chess) {
        var line = 1; // 从自己开始计算，往反斜线。看有无与自己相同的
        for (var i = row - 1, j = col - 1; this.getChess(i, j) === chess; i--, j--) {
            line++;
        }
        for (var i = row + 1, j = col + 1; this.getChess(i, j) === chess; i++, j++) {
            line++;
        }
        return line >= 5;
    };
    /**
     * 检查横向
     * @param row
     * @param col
     * @param chess
     */
    Chess.prototype.checkHorizontal = function (row, col, chess) {
        var line = 1; // 从自己开始计算，往左边和右边走。看有无与自己相同的
        for (var i = col - 1; this.getChess(row, i) === chess; i--) {
            line++;
        }
        for (var i = col + 1; this.getChess(row, i) === chess; i++) {
            line++;
        }
        return line >= 5;
    };
    /**
     * 得到当前位置的棋子
     * @param row
     * @param col
     */
    Chess.prototype.getChess = function (row, col) {
        // 边界检查
        if (this.board[row] === undefined) {
            return;
        }
        else if (this.board[row][col] === undefined) {
            return;
        }
        return this.board[row][col];
    };
    /**
     * 处理鼠标点击事件
     * @param e
     */
    Chess.prototype.handleClick = function (e) {
        var target = e.target;
        // 点击的位置在dom上有棋子了
        if (target.classList.contains('chess')) {
            return;
        }
        // 点击位置的offsetX - 20是因为棋盘距离整个游戏dom top和left各有20px的距离，
        // 如果点击的是最边角落得位置那么则不需要减去20，因为那样得话就超出了棋盘区域了
        var x = ((e.offsetX - 20) < 20) ? e.offsetX : e.offsetX - 20, y = ((e.offsetY - 20) < 20) ? e.offsetY : e.offsetY - 20;
        // 通过位置计算row， col，然后落子
        var row = Math.round(y / this.interval);
        var col = Math.round(x / this.interval);
        // 落子
        this.playChess(row, col);
    };
    /**
     * 绑定事件
     */
    Chess.prototype.bindEvent = function () {
        this.dom.onclick = this.handleClick.bind(this);
        this.reset.addEventListener('click', function () {
            new Chess();
        });
        this.back.onclick = this.handleBack.bind(this);
    };
    /**
     * 处理悔棋
     */
    Chess.prototype.handleBack = function () {
        // 取得上一个入栈的棋子及其相关的数据
        if (this.backBoard.length <= 0) { // 处理没有棋子的时候撤销的情况
            alert("没有相关的棋子可以撤销");
            return;
        }
        var backBoardChess = this.backBoard.pop();
        // 改变当前的落子者
        this.nextChess = backBoardChess.lastChess;
        // 在当前dom中移除该棋子
        this.dom.removeChild(backBoardChess.lastDom);
        // 修改当前二维数组中对应位置的数值
        this.board[backBoardChess.row][backBoardChess.col] = 0;
        this.showInfo();
    };
    /**
     * 是否可以落子
     * @param row
     * @param col
     */
    Chess.prototype.canMoveChess = function (row, col) {
        // 边界检查
        if (row < 0 || col < 0 || row > this.rows - 1 || col > this.cols - 1) {
            return true;
        }
        // 当前落子的位置已经存在其他棋子
        return !!this.board[row][col];
    };
    /**
     * 显示提示信息
     */
    Chess.prototype.showInfo = function () {
        if (this.gameOver) {
            // 游戏结束时，当前落子方的上家胜利（因为游戏已经结束，落子方还未落子）
            var winner = this.nextChess === 1 ? "白棋胜利" : "黑棋胜利";
            this.infoDom.innerHTML = "游戏结束，" + winner;
        }
        else {
            var nextPlayer = this.nextChess === 1 ? "黑棋" : "白棋";
            this.infoDom.innerHTML = "当前落子方：" + nextPlayer;
        }
    };
    return Chess;
}());
var chess = new Chess();
