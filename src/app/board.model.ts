/**
 * Board game model
 */
export class Board {

    /**
     * Map keeps the number of board found cells
     * key (r + indexNumber) means the row E.g. r0 r1 r2
     * key (c + indexNumber) means the column E.g. c0 c1 c2
     */
    public rowColumnMap: Map<string, number> = new Map();

    /**
     * Last found number value caused winning
     */
    public finishedSearchNumber: number = -1;

    /**
     * Score value calculated by (finishedSearchNumber * sum of not found numbers)
     */
    public score: number = -1;

    /**
     * Board number values as 1D array (Board is played as 5x5 table)
     */
    public boardValues: number[] = [];

    constructor(public readonly boardIndex: number,
                public readonly boardSize: number,
                public readonly rawBoardValues: number[]) {

        this.resetBoard();
    }

    /**
     * @return Returns the row and column index of given index based on 5x5 table
     * @param index
     * @private
     */
    private getBoardRowColumnIndex(index: number): number[] {
        return [Math.floor(index / this.boardSize), index % this.boardSize];
    }

    /**
     * Updates the map for a found num ber index (index value represents the index of the number in boardValues)
     * @param index
     * @return Returs found numbers amount of row and column as 2 element array
     * @private
     */
    private updateRowColumnMap(index: number): Promise<number[]> {
        return new Promise((resolve, reject) => {
            this.boardValues[index] = -1;
            let [_rowIndex, _columnIndex]: number[] = this.getBoardRowColumnIndex(index);
            let rowCount = this.rowColumnMap.get("r" + _rowIndex) ?? 0;
            this.rowColumnMap.set("r" + _rowIndex, 1 + rowCount);

            let columnCount = this.rowColumnMap.get("c" + _columnIndex) ?? 0;
            this.rowColumnMap.set("c" + _columnIndex, 1 + columnCount);

            resolve([1 + rowCount, 1 + columnCount]);
        });
    }

    /**
     * @return Returns true if game is finished, otherwise false
     * Game is finished if a rows or columns all numbers are found
     * @param rowCount
     * @param columnCount
     * @private
     */
    private isGameFinished(rowCount: number, columnCount: number): boolean {
        return rowCount === this.boardSize || columnCount === this.boardSize;
    }


    /**
     * Resets the board for a new play
     */
    resetBoard(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.finishedSearchNumber = -1;
            this.boardValues = [...this.rawBoardValues];

            this.rowColumnMap = new Map();
            [...Array(this.boardSize)].map((index) => {
                this.rowColumnMap.set(("r" + index), 0);
                this.rowColumnMap.set(("c" + index), 0);
            });
            resolve();
        });
    }

    /**
     * Looks for the given search numbers in the board values array and updates the Board object
     * @return Returns the searched number if board is finished, otherwise -1
     * @param searchNumbers
     */
    async lookForNumbers(searchNumbers: number[]): Promise<number> {
        for (let number of searchNumbers) {
            if (this.boardValues.indexOf(number) < 0)
                continue;

            let foundInBoardInd = this.boardValues.indexOf(number);
            let rowColumnCounts = await this.updateRowColumnMap(foundInBoardInd);

            if (this.isGameFinished(rowColumnCounts[0], rowColumnCounts[1])) {
                let restSum = this.boardValues.filter(i => i > -1)?.reduce((a, b) => a + b) ?? 0;
                this.finishedSearchNumber = number;
                this.score = restSum * number;
                return Promise.resolve(number);
            }
        }
        return Promise.resolve(-1);
    }
}
