import { inject, Injectable, signal } from '@angular/core';
import { DragNDropItemDirective } from '../../../directives';
import { DragNDropCoverageService } from '../coverage';
import { isSufficientCovered, Transition } from '../../../lib';

@Injectable({
    providedIn: 'root',
})
export class DragNDropItemsService {
    private readonly coverageService = inject(DragNDropCoverageService);
    private readonly dndItems = signal<readonly DragNDropItemDirective[]>([]);
    readonly transitions = signal<Transition[]>([
        ['top', 200, 'ease-out'],
        ['left', 200, 'ease-out'],
    ]);

    setDndItems(items: readonly DragNDropItemDirective[]) {
        this.dndItems.set(items);
    }

    getDndSiblingItemsOf(draggedId: number) {
        return this.dndItems().filter(({ id }) => id !== draggedId);
    }

    getCoveredSibling(
        draggedElem: HTMLElement,
        siblings: readonly DragNDropItemDirective[],
    ) {
        return siblings.find((item) =>
            isSufficientCovered(
                draggedElem,
                item.elem,
                this.coverageService.getPercentage(),
            ),
        );
    }
}
