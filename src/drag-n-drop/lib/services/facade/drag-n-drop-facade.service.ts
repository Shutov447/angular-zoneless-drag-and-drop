import { inject, Injectable } from '@angular/core';
import { DragNDropContainerService } from '../container';
import { DragNDropItemsService } from '../items';
import { PositionService } from '../position';
import { DragStateService } from '../drag-state';
import { DragNDropItemDirective } from '../../../directives';
import { IdService } from '../id';

@Injectable({
    providedIn: 'root',
})
export class DragNDropFacadeService {
    private readonly containerService = inject(DragNDropContainerService);
    private readonly itemsService = inject(DragNDropItemsService);
    private readonly idService = inject(IdService);

    private siblingItems: DragNDropItemDirective[] = [];

    readonly dragStateService = inject(DragStateService);
    readonly positionService = inject(PositionService);
    readonly id = this.idService.generate();

    init(elem: HTMLElement) {
        this.siblingItems = this.itemsService.getDndSiblingItemsOf(this.id);
        this.positionService.transformInitialSetupToAbsolutePos(
            this.containerService.getElem() as HTMLElement,
            elem,
        );
        this.dragStateService.whenSiblingCovered(
            this.positionService.switchStartPosition,
            this.positionService,
        );
    }

    onMouseUp() {
        this.positionService.currentPosition.set(
            this.positionService.containerRelativeStartPosAfterSwitching,
        );
        this.positionService.containerRelativeStartPos =
            this.positionService.currentPosition();
        this.dragStateService.isStartDrag.set(false);
    }

    onMouseDown(x: number, y: number) {
        this.dragStateService.setDragStartState(x, y);
    }

    onMouseMove(x: number, y: number, elem: HTMLElement) {
        const coveredSibling = this.itemsService.getCoveredSibling(
            elem,
            this.siblingItems,
        );
        this.dragStateService.setCoveredSiblingPosition(
            coveredSibling?.positionService,
        );
        const position = this.dragStateService.getDragItemOffset(
            x,
            y,
            this.positionService.containerRelativeStartPos,
        );
        this.positionService.currentPosition.set(position);
    }
}
