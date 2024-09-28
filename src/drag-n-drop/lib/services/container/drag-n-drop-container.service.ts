import { computed, Injectable, signal } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class DragNDropContainerService {
    private readonly _elemContainer = signal<HTMLElement | null>(null);
    readonly positionType = signal('relative');
    readonly elemContainer = computed(() => this._elemContainer());

    setElem(container: HTMLElement) {
        this._elemContainer.set(container);
    }
}
