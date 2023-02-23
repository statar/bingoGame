import {Component} from '@angular/core';
import {Board} from "../board.model";
import {AppService} from "../app.service";

export enum GameState {
    NOTSTARTED,
    ONGOING,
    FINISHED,
}

@Component({
    selector: 'app-root-2',
    templateUrl: './game.component.html',
    styleUrls: ['./game.component.css']
})
export class GameComponent {

    private _boardsList: Board[] = [];
    private _searchNumberList: number[] = [];
    private _round: number = -1;
    private _winnerIndex: number = -1;
    private _winnerScore: number = -1;
    private _gameState: GameState = GameState.NOTSTARTED;

    public solveFastClicked: boolean = false;
    public gameNotAvailable: boolean = false;

    get boardsList(): Board[] {
        return this._boardsList;
    }

    get searchNumberList(): number[] {
        return this._searchNumberList;
    }

    get winnerIndex(): number {
        return this._winnerIndex;
    }

    get winnerScore(): number {
        return this._winnerScore;
    }

    get round(): number {
        return this._round;
    }

    get gameState(): GameState {
        return this._gameState;
    }

    get gameFinish(): boolean {
        return this._gameState === GameState.FINISHED;
    }

    get gameOngoing(): boolean {
        return this._gameState === GameState.ONGOING;
    }

    get buttonLabel(): string {
        switch (this._gameState) {
            case GameState.NOTSTARTED:
                return "Play step by step";
            case GameState.ONGOING:
            default:
                return "Go next round";
        }
    }

    constructor(private _appService: AppService) {
        this.parseInputFile().then((success) => {
            console.log("File parsing success is " + success);
            if (!success)
                this.gameNotAvailable = true;
        });
    }

    async parseInputFile(): Promise<boolean> {
        return new Promise((resolve) => {
            this._appService.readAndParseInputText().then(() => {
                this._boardsList = this._appService.boardsList;
                this._searchNumberList = this._appService.searchNumberList;
                resolve(true);
            }).catch(() => {
                resolve(false);
            });
        })
    }

    /**
     * Returns the index of given number in the search number list
     * Used to show the finished round of board
     * @param finishNumber
     */
    getFinishedRoundOfBoard(finishNumber: number): number {
        return this._searchNumberList.indexOf(finishNumber);
    }

    /**
     * Looks for one given number in all boards and updates the game state
     * Used for round by round playing
     * @param numberVal
     */
    async lookForOneNumber(numberVal: number) {
        this.solveFastClicked = false;
        for (let i = 0; i < this._boardsList.length; i++) {
            let gameFinishSearchNum = await this._boardsList[i].lookForNumbers([numberVal]);
            if (gameFinishSearchNum >= 0) {
                this._winnerIndex = i;
                this._winnerScore = this._boardsList[i].score; // score 0 list[1]
            }
        }
        this.updateGameState();
        return Promise.resolve();
    }

    /**
     * Looks for all search number list for all boards to find last winner
     */
    async lookForAllNumbersForLast() {
        this.solveFastClicked = true;
        let maxWinnerRound = -1;

        for (let i = 0; i < this._boardsList.length; i++) {
            const boardFinishedOnSearchNumber = await this._boardsList[i].lookForNumbers(this._searchNumberList);

            let winBoardRound = this._searchNumberList.indexOf(boardFinishedOnSearchNumber);
            if (boardFinishedOnSearchNumber !== -1 && winBoardRound > maxWinnerRound) {
                maxWinnerRound = winBoardRound;
                this._winnerScore = this._boardsList[i].score;
                this._winnerIndex = i;
            }
        }
        this.updateGameState();
        return Promise.resolve();
    }

    /**
     * Looks for all search numbers for all boards to find first winner
     * If first board wins on Xth round, next boards will only be searched until Xth search numbers
     */
    async lookForAllNumbersForFirst() {
        this.solveFastClicked = true;
        let minWinnerRound = this._boardsList.length;
        let minWinnerInd = -1;

        for (let i = 0; i < this._boardsList.length; i++) {
            const boardFinishedOnSearchNumber = await this._boardsList[i].lookForNumbers(this._searchNumberList.slice(0, minWinnerRound));

            // Update the minWinnerInd to avoid searching all numbers for the next boards
            // For example if 1. board wins on 10th round, for 2. board we only need to check if it wins before 10th round
            // Because we only need the first winner
            let _winBoardRound = this._searchNumberList.indexOf(boardFinishedOnSearchNumber);
            if (boardFinishedOnSearchNumber !== -1 && _winBoardRound < minWinnerRound) {
                minWinnerRound = _winBoardRound;
                minWinnerInd = i;
            }
        }

        if (minWinnerInd > -1) {
            this._winnerScore = this._boardsList[minWinnerInd].score;
            this._winnerIndex = minWinnerInd;
        }

        this.updateGameState();
        return Promise.resolve();
    }

    /**
     * Starts the next round and used for round by round playing
     */
    async startNextRound() {
        if (this._gameState === GameState.FINISHED)
            this.resetGame();
        else {
            this._round++;
            await this.lookForOneNumber(this._searchNumberList[this._round]);
        }

        this.updateGameState();
        return Promise.resolve();
    }

    /**
     * Find last winner on one step
     */
    async findLast() {
        this.resetGame();
        await this.lookForAllNumbersForLast();

        this.updateGameState();
        return Promise.resolve();
    }

    /**
     * Find first winner on one step
     */
    async findFirst() {
        if (!this.gameOngoing)
            this.resetGame();
        await this.lookForAllNumbersForFirst();

        this.updateGameState();
        return Promise.resolve();
    }

    /**
     * Checks and returns the new game state
     */
    getNewGameState() {
        if (this._winnerIndex >= 0)
            return GameState.FINISHED;
        if (this._round < 0)
            return GameState.NOTSTARTED;
        if (this._round >= this._searchNumberList.length - 1)
            return GameState.FINISHED;
        return GameState.ONGOING;
    }

    /**
     * Checks and updates the game state
     */
    updateGameState() {
        let newState = this.getNewGameState();
        if (newState !== this._gameState)
            this._gameState = newState;
    }

    /**
     * Inits the game state
     */
    resetGame() {
        this._round = -1;

        this._winnerIndex = -1;
        this._winnerScore = -1;
        this._boardsList.forEach(b => b.resetBoard());
        this.updateGameState();
    }

}
