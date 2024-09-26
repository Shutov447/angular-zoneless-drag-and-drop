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
import { isSufficientCovered, DragNDropService } from '../lib';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';

@Directive({
    selector: '[appDragNDropItem]',
    host: {
        '[style.zIndex]': 'zIndex()',
        '[style.cursor]': 'this.isStartDrag() ? "grabbing" : "grab"',
        '[style.top]': 'position().top + "px"',
        '[style.left]': 'position().left + "px"',
    },
})
export class DragNDropItemDirective implements OnInit {
    private readonly destroyRef = inject(DestroyRef);
    private readonly eRef = inject<ElementRef<HTMLElement>>(ElementRef);
    private readonly elem = this.eRef.nativeElement;
    private readonly dndService = inject(DragNDropService);
    private readonly coveredDndItemToSwitch = new Subject<
        DragNDropItemDirective | undefined
    >();
    private readonly coveragePercentage = this.dndService.coveragePercentage;
    private readonly coverageTime = this.dndService.coverageTime;
    private readonly init = signal(false);
    private readonly isStartDrag = signal(false);
    private readonly isDraggedItemNow = signal(false);
    private readonly zIndex = signal(1);
    private readonly position = signal({
        top: 0,
        left: 0,
    });
    private readonly absoluteInitialPosX = this.elem.getBoundingClientRect().x;
    private readonly absoluteInitialPosY = this.elem.getBoundingClientRect().y;
    private dndSiblingItems: readonly DragNDropItemDirective[] = [];
    private containerRelativeStartPos = {
        top: 0,
        left: 0,
    };
    private containerRelativeStartPosAfterSwitching = {
        top: 0,
        left: 0,
    };
    private startDragY = 0;
    private startDragX = 0;

    ngOnInit() {
        this.init.set(true);
        this.dndSiblingItems = this.getDndSiblingItems();
        this.transformInitialSetup(
            this.dndService.dndElemContainer() as HTMLElement,
        );
        this.subscribeToCoveredDndItem();
    }

    private subscribeToCoveredDndItem() {
        this.coveredDndItemToSwitch
            .asObservable()
            .pipe(
                distinctUntilChanged(),
                debounceTime(this.coverageTime()),
                takeUntilDestroyed(this.destroyRef),
            )
            .subscribe((target) => {
                if (target && this.isStartDrag()) {
                    this.switchStartPosition(target);
                }
            });
    }

    private getDndSiblingItems() {
        return this.dndService.dndItems().filter(
            // вместо этого сравнивать по id, надо создать сервис который будет генерить id каждому элементу от 0 и до последнего в контейнере
            ({ absoluteInitialPosX, absoluteInitialPosY }) =>
                !(
                    absoluteInitialPosX === this.absoluteInitialPosX &&
                    absoluteInitialPosY === this.absoluteInitialPosY
                ),
        );
    }

    @HostListener('window:mouseup')
    private onWindowMouseup() {
        if (this.isDraggedItemNow()) {
            this.setStartPosition();
            this.setContainerRelativeStartPosAfterSwitching();
            this.isDraggedItemNow.set(false);
        }
    }

    @HostListener('mousedown', ['$event'])
    private onMousedown(event: MouseEvent) {
        this.setDragStartState(event.x, event.y);
    }

    @HostListener('mousemove', ['$event'])
    private onMousemove(event: MouseEvent) {
        if (this.isStartDrag()) {
            const coveredSibling = this.getCoveredSibling();

            this.coveredDndItemToSwitch.next(coveredSibling);
            this.elemOffsetToPoint(event.x, event.y);
        }
    }

    @HostListener('mouseup')
    private onMouseup() {
        this.setStartPosition();
        this.setContainerRelativeStartPosAfterSwitching();
    }

    private transformInitialSetup(dndContainerElem: HTMLElement) {
        const dndContainerDomRect = dndContainerElem.getBoundingClientRect();
        const oldDndContainerHeight = dndContainerDomRect.height;
        const oldDndContainerWidth = dndContainerDomRect.width;

        this.setContainerRelativeStartPos(dndContainerDomRect);

        dndContainerElem.style.height = oldDndContainerHeight + 'px';
        dndContainerElem.style.width = oldDndContainerWidth + 'px';
    }

    private setElementPositionToAbsolute() {
        this.position.set({
            top: this.containerRelativeStartPos.top,
            left: this.containerRelativeStartPos.left,
        });

        window.setTimeout(() => (this.elem.style.position = 'absolute'));
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
        this.setElementPositionToAbsolute();
    }

    private switchStartPosition(dndItem: DragNDropItemDirective) {
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

        dndItem.setStartPosition();
    }

    private elemOffsetToPoint(x: number, y: number) {
        this.position.set({
            top: y + this.containerRelativeStartPos.top - this.startDragY,
            left: x + this.containerRelativeStartPos.left - this.startDragX,
        });
    }

    private getCoveredSibling() {
        return this.dndSiblingItems.find((item) =>
            isSufficientCovered(
                this.elem,
                item.elem,
                this.coveragePercentage(),
            ),
        );
    }

    private setDragStartState(x: number, y: number) {
        this.startDragY = y;
        this.startDragX = x;
        this.zIndex.set(999);
        this.isStartDrag.set(true);
        this.isDraggedItemNow.set(true);
    }

    private setContainerRelativeStartPosAfterSwitching() {
        this.containerRelativeStartPos = this.position();
    }

    setStartPosition() {
        this.position.set({
            top: this.containerRelativeStartPosAfterSwitching.top,
            left: this.containerRelativeStartPosAfterSwitching.left,
        });
        this.zIndex.set(1);
        this.isStartDrag.set(false);
    }
}
