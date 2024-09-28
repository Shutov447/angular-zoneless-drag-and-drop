import {
    computed,
    effect,
    inject,
    Injectable,
    Injector,
    untracked,
} from '@angular/core';
import { DragNDropContainerService } from '../container';
import { DragNDropItemsService } from '../items';
import { PositionService } from '../position';
import { DragStateService } from '../drag-state';
import { DragNDropItemDirective } from '../../../directives';
import { IdService } from '../id';
import {
    getLargestTransitionTimeOf,
    convertTransitionsToString,
} from '../../utils';

@Injectable({
    providedIn: 'root',
})
export class DragNDropFacadeService {
    private readonly injector = inject(Injector);
    private readonly containerService = inject(DragNDropContainerService);
    private readonly idService = inject(IdService);

    private siblingItems: DragNDropItemDirective[] = [];

    readonly itemsService = inject(DragNDropItemsService);
    readonly dragStateService = inject(DragStateService);
    readonly positionService = inject(PositionService);
    readonly id = this.idService.generate();
    readonly transition = computed(() =>
        this.positionService.isStartSwitching()
            ? convertTransitionsToString(
                  untracked(this.itemsService.transitions),
              )
            : '',
    );

    init(elem: HTMLElement) {
        effect(
            () => {
                const elemContainer =
                    this.containerService.elemContainer() as HTMLElement;

                if (elemContainer) {
                    this.positionService.transitionTime.set(
                        getLargestTransitionTimeOf(
                            untracked(this.itemsService.transitions),
                        ),
                    );
                    this.siblingItems = this.itemsService.getDndSiblingItemsOf(
                        this.id,
                    );
                    this.positionService.transformInitialSetupToAbsolutePos(
                        elemContainer,
                        elem,
                    );
                    this.dragStateService.whenSiblingCovered(
                        this.positionService.switchStartPosition,
                        this.positionService,
                    );
                }
            },
            {
                allowSignalWrites: true,
                injector: this.injector,
            },
        );
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

    onMouseUp() {
        this.positionService.setIsStartSwitching(true);
        this.positionService.currentPosition.set(
            this.positionService.containerRelativeStartPosAfterSwitching,
        );
        this.positionService.containerRelativeStartPos =
            this.positionService.currentPosition();
        this.dragStateService.isStartDrag.set(false);
        this.positionService.setIsStartSwitching(false);
    }
}
