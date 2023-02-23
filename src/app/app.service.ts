import {Injectable, OnDestroy} from "@angular/core";
import {Board} from "./board.model";


@Injectable()
export class AppService {

    static url: string = "../assets/input.txt";

    private _searchNumberList: number[] = [];
    private _boards: Board[] = [];

    get searchNumberList(): number[] {
        return [...this._searchNumberList];
    }

    get boardsList(): Board[] {
        return [...this._boards];
    }

    constructor() {
    }

    /**
     * Reads the file of given url
     * @param url
     * @return file content as Promise text
     */
    async readFile(url: string): Promise<string> {
        let response = await fetch(url).catch(undefined);
        if (!response) {
            console.warn("File could not be read " + url);
            return Promise.resolve("");
        }
        return response.text();
    }

    /**
     * Reads the file and parses the content to create board and search number lists
     */
    async readAndParseInputText() {
        const text = await this.readFile(AppService.url);
        if (text.length <= 0)
            return;

        const arr = text.split("\n");
        this._searchNumberList = arr[0].split(",").map(s => Number(s));

        let board: number[] = [];
        let boardArr: number[][] = [];
        for (let i = 1; i < arr.length; i++) {

            if (arr[i]?.length <= 0) {
                continue;
            }

            if (board.length === 25) {
                boardArr.push(board);
                board = [];
            }
            board = board.concat(arr[i].trim().split(/\s+/).map(s => Number(s)));
        }

        let newBoardsArr = [];
        for (let i = 0; i < boardArr.length; i++) {
            newBoardsArr.push(new Board(i, 5, boardArr[i]));
        }

        this._boards = newBoardsArr;
    }

}
