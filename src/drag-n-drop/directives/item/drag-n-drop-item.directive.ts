import {
    DestroyRef,
    Directive,
    ElementRef,
    HostListener,
    inject,
    OnInit,
    signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DragStateService, IdService } from '../../lib';
import {
    DragNDropContainerService,
    DragNDropCoverageService,
    DragNDropItemsService,
} from '../../model';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';

@Directive({
    selector: '[appDragNDropItem]',
    providers: [DragStateService],
    host: {
        '[style.zIndex]': 'this.dragStateService.isStartDrag() ? 999 : 1',
        '[style.cursor]':
            'this.dragStateService.isStartDrag() ? "grabbing" : "grab"',
        '[style.position]': 'positionType()',
        '[style.top]': 'this.dragStateService.position().top + "px"',
        '[style.left]': 'this.dragStateService.position().left + "px"',
    },
})
export class DragNDropItemDirective implements OnInit {
    private readonly destroyRef = inject(DestroyRef);
    private readonly eRef = inject<ElementRef<HTMLElement>>(ElementRef);
    private readonly idService = inject(IdService);
    private readonly dragStateService = inject(DragStateService);
    private readonly dndContainerService = inject(DragNDropContainerService);
    private readonly itemService = inject(DragNDropItemsService);
    private readonly coverageService = inject(DragNDropCoverageService);
    private readonly coveredDndItemToSwitch = new Subject<
        DragNDropItemDirective | undefined
    >();

    private containerRelativeStartPos = {
        top: 0,
        left: 0,
    };
    private containerRelativeStartPosAfterSwitching = {
        top: 0,
        left: 0,
    };
    private ownDndSiblingItems: readonly DragNDropItemDirective[] = []; // вынести соседей и работы с ними в отдельный сервис

    readonly id = this.idService.generate();

    readonly elem = this.eRef.nativeElement;
    private readonly positionType = signal(
        getComputedStyle(this.elem).position,
    );

    ngOnInit() {
        this.ownDndSiblingItems = this.itemService.getDndSiblingItemsOf(
            this.id,
        );
        this.transformInitialSetup(
            this.dndContainerService.getElem() as HTMLElement,
        );
        this.subscribeToCoveredDndItem();
    }

    private subscribeToCoveredDndItem() {
        this.coveredDndItemToSwitch
            .asObservable()
            .pipe(
                distinctUntilChanged(),
                debounceTime(this.coverageService.getTime()),
                takeUntilDestroyed(this.destroyRef),
            )
            .subscribe((target) => {
                if (target && this.dragStateService.isStartDrag()) {
                    this.switchStartPosition(target);
                }
            });
    }

    private getDndSiblingItems() {
        return this.itemService
            .getDndItems()
            .filter(({ id }) => id !== this.id);
    }

    @HostListener('window:mouseup')
    private onWindowMouseup() {
        if (this.dragStateService.isDraggedItemNow()) {
            this.dragStateService.setStartPosition(
                this.containerRelativeStartPosAfterSwitching,
            );
            this.containerRelativeStartPos =
                this.dragStateService.getPosition();
            this.dragStateService.isDraggedItemNow.set(false);
        }
    }

    @HostListener('mousedown', ['$event'])
    private onMousedown(event: MouseEvent) {
        this.dragStateService.setDragStartState(event.x, event.y);
    }

    @HostListener('mousemove', ['$event'])
    private onMousemove(event: MouseEvent) {
        if (this.dragStateService.isStartDrag()) {
            const coveredSibling = this.itemService.getCoveredSibling(
                this.elem,
                this.ownDndSiblingItems,
            );
            this.coveredDndItemToSwitch.next(coveredSibling);
            this.dragStateService.elemOffsetToPoint(
                event.x,
                event.y,
                this.containerRelativeStartPos.top,
                this.containerRelativeStartPos.left,
            );
        }
    }

    @HostListener('mouseup')
    private onMouseup() {
        this.dragStateService.setStartPosition(this.containerRelativeStartPos);
        this.containerRelativeStartPos = this.dragStateService.getPosition();
    }

    private transformInitialSetup(dndContainerElem: HTMLElement) {
        const dndContainerDomRect = dndContainerElem.getBoundingClientRect();
        const oldDndContainerHeight = dndContainerDomRect.height;
        const oldDndContainerWidth = dndContainerDomRect.width;

        this.setContainerRelativeStartPos(dndContainerDomRect);

        dndContainerElem.style.height = oldDndContainerHeight + 'px';
        dndContainerElem.style.width = oldDndContainerWidth + 'px';
    }

    private setContainerRelativeStartPos(dndContainerDomRect: DOMRect) {
        const domRect = this.elem.getBoundingClientRect();
        const top =
            domRect.y -
            dndContainerDomRect.y -
            parseFloat(getComputedStyle(this.elem).marginTop);
        const left =
            domRect.x -
            dndContainerDomRect.x -
            parseFloat(getComputedStyle(this.elem).marginLeft);

        this.containerRelativeStartPos = {
            top,
            left,
        };
        this.containerRelativeStartPosAfterSwitching = {
            top,
            left,
        };
        this.dragStateService.setStartPosition(this.containerRelativeStartPos);

        window.setTimeout(() => this.positionType.set('absolute'));
    }

    private switchStartPosition(dndItem: DragNDropItemDirective) {
        console.log('switching');
        const oldContainerRelativeStartPosAfterSwitching =
            this.containerRelativeStartPosAfterSwitching;
        const oldDndItemContainerRelativeStartPos =
            dndItem.containerRelativeStartPos;

        dndItem.containerRelativeStartPos =
            oldContainerRelativeStartPosAfterSwitching;
        dndItem.containerRelativeStartPosAfterSwitching =
            oldContainerRelativeStartPosAfterSwitching;

        this.containerRelativeStartPosAfterSwitching =
            oldDndItemContainerRelativeStartPos;

        dndItem.dragStateService.setStartPosition(
            oldContainerRelativeStartPosAfterSwitching,
        );
    }
}
