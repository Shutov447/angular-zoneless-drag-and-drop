import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class DragNDropCoverageService {
    private percentage = 0;
    private time = 0;

    setPercentage(value: number) {
        this.percentage = value;
    }

    setTime(value: number) {
        this.time = value;
    }

    getPercentage() {
        return this.percentage;
    }

    getTime() {
        return this.time;
    }
}
