import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class IdService {
    private id = 0;

    generate(): number {
        return this.id++;
    }
}
