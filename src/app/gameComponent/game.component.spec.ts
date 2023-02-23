import {TestBed} from '@angular/core/testing';
import {RouterTestingModule} from '@angular/router/testing';
import {GameComponent} from './game.component';
import {AppService} from "../app.service";

describe('GameComponent', () => {
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                RouterTestingModule
            ],
            declarations: [
                GameComponent
            ],
            providers: [
                AppService
            ],
        }).compileComponents();
    });

    it('should create the app', () => {
        const fixture = TestBed.createComponent(GameComponent);
        const app = fixture.componentInstance;
        expect(app).toBeTruthy();
    });

    it('should find first board score', () => {
        const fixture = TestBed.createComponent(GameComponent);
        fixture.detectChanges();
        const app = fixture.componentInstance;

        app.parseInputFile().then((success) => {
            expect(success).toBeTruthy();

            app.findFirst().then(() => {
                expect(app.winnerIndex).toEqual(93);
                expect(app.winnerScore).toEqual(27027);
            });
        })

    });

    it('should find last board score', () => {
        const fixture = TestBed.createComponent(GameComponent);
        fixture.detectChanges();
        const app = fixture.componentInstance;

        app.parseInputFile().then((success) => {
            expect(success).toBeTruthy();

            app.findLast().then(() => {
                expect(app.winnerIndex).toEqual(21);
                expect(app.winnerScore).toEqual(36975);
            });
        })

    });

});
