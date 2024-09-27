import { Injectable, signal } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class DragNDropContainerService {
    private readonly elemContainer = signal<HTMLElement | null>(null);

    setElem(container: HTMLElement) {
        this.elemContainer.set(container);
    }

    getElem() {
        return this.elemContainer();
    }
}
