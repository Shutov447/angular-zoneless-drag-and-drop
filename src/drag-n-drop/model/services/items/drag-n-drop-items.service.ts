import { inject, Injectable, signal } from '@angular/core';
import { DragNDropItemDirective } from 'src/drag-n-drop/directives';
import { DragNDropCoverageService } from '../coverage';
import { isSufficientCovered } from '../../../lib';

@Injectable({
    providedIn: 'root',
})
export class DragNDropItemsService {
    private readonly dndItems = signal<readonly DragNDropItemDirective[]>([]);
    private readonly coverageService = inject(DragNDropCoverageService);

    setDndItems(items: readonly DragNDropItemDirective[]) {
        this.dndItems.set(items);
    }

    getDndItems() {
        return this.dndItems();
    }

    getDndSiblingItemsOf(draggedId: number) {
        return this.getDndItems().filter(({ id }) => id !== draggedId);
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
