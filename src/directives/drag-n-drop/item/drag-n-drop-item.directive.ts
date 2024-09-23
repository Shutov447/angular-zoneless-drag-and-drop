import {
    computed,
    Directive,
    effect,
    ElementRef,
    HostListener,
    inject,
    OnInit,
    signal,
} from '@angular/core';
import { DragNDropService } from '../service/drag-n-drop.service';
import { isSufficientCovered } from '../lib';

@Directive({
    selector: '[appDragNDropItem]',
})
export class DragNDropItemDirective implements OnInit {
    private readonly eRef: ElementRef<HTMLElement> = inject(ElementRef);
    private readonly dndService = inject(DragNDropService);
    private readonly dndSiblingItems = computed(() =>
        this.init()
            ? this.dndService
                  .dndItems()
                  ?.filter(
                      ({ startPosY, startPosX }) =>
                          !(
                              startPosX === this.startPosX &&
                              startPosY === this.startPosY
                          )
                  )
            : []
    );
    private readonly init = signal(false);
    private readonly isStartDragEffect = effect(() => {
        this.eRef.nativeElement.style.cursor = this.isStartDrag()
            ? 'grabbing'
            : 'grab';
    });

    private isStartDrag = signal(false);
    private startTop = 0;
    private startLeft = 0;
    private startDragY = 0;
    private startDragX = 0;
    // private ownPosY = 0;
    // private ownPosX = 0;
    private startPosY = 0;
    private startPosX = 0;
    private ownHeight = 0;
    private ownWidth = 0;
    private top = 0;
    private left = 0;

    ngOnInit() {
        const initialDOMRect = this.eRef.nativeElement.getBoundingClientRect();
        console.log(initialDOMRect);
        // console.log(
        //     this.eRef.nativeElement.offsetTop,
        //     this.eRef.nativeElement.offsetLeft
        // );

        this.startPosY = initialDOMRect.y;
        this.startPosX = initialDOMRect.x;
        this.ownHeight = initialDOMRect.height;
        this.ownWidth = initialDOMRect.width;

        // this.startTop =
        //     this.initialPosY -
        //     this.ownHeight -
        //     parseFloat(getComputedStyle(this.eRef.nativeElement).marginTop);
        // this.startLeft =
        //     this.initialPosX -
        //     this.ownWidth -
        //     parseFloat(getComputedStyle(this.eRef.nativeElement).marginLeft);
        // console.log(this.startTop, this.startLeft);
        console.log(this.startPosY, this.startPosX);

        // window.setTimeout(() => this.setStartPosition(), 1000);
        // this.setStartPosition();

        this.init.set(true);
    }

    @HostListener('mousedown', ['$event']) onMousedown(event: MouseEvent) {
        this.startDragY = event.y;
        this.startDragX = event.x;
        // console.log('mousedown', event.y, event.x);
        this.eRef.nativeElement.style.zIndex = '999';
        this.isStartDrag.set(true);
    }

    @HostListener('window:mouseup')
    @HostListener('mouseup')
    private onMouseup() {
        // console.log('onMouseup 1', this.startTop, this.startLeft);
        this.setStartPosition();
        this.top = parseFloat(getComputedStyle(this.eRef.nativeElement).top);
        this.left = parseFloat(getComputedStyle(this.eRef.nativeElement).left);
        console.log(this.top, this.left);
        // console.log('onMouseup 2', this.startTop, this.startLeft);
    }

    // // TODO: сделать так, чтобы события не всплывали
    @HostListener('mousemove', ['$event']) private onMousemove(
        event: MouseEvent
    ) {
        if (this.isStartDrag()) {
            const sibling = this.dndSiblingItems()?.find((item) =>
                isSufficientCovered(
                    this.eRef.nativeElement,
                    item.eRef.nativeElement,
                    50
                )
            );

            if (sibling) {
                this.switchStartPosition(sibling);

                console.log('switching');
                return;
            }

            // console.log('default', event.y, event.x);
            // console.log('mousemove', this.startDragY, this.startDragX);

            const currentDragPointY = event.y - this.startDragY;
            const currentDragPointX = event.x - this.startDragX;
            // console.log('currentDragPointY', currentDragPointY);
            // console.log('currentDragPointX', currentDragPointX);

            // так как после switchStartPosition я изменил top, то тут он не ноль и надо это учитывать
            this.eRef.nativeElement.style.top =
                currentDragPointY + this.top + 'px';
            this.eRef.nativeElement.style.left =
                currentDragPointX + this.left + 'px';
        }
    }

    setStartPosition() {
        // this.eRef.nativeElement.style.top = this.startTop + 'px';
        // this.eRef.nativeElement.style.left = this.startLeft + 'px';
        this.eRef.nativeElement.style.top = this.startTop + 'px';
        this.eRef.nativeElement.style.left = this.startLeft + 'px';
        this.eRef.nativeElement.style.zIndex = '0';
        this.isStartDrag.set(false);
    }

    switchStartPosition(dndItem: DragNDropItemDirective) {
        console.log(dndItem.eRef.nativeElement.getBoundingClientRect());
        const { y, x } = dndItem.eRef.nativeElement.getBoundingClientRect();
        console.log('draggable', this.startPosY, this.startPosX);
        console.log('covered', y, x);
        // const oldDndItemStartTop = dndItem.startTop;
        // const oldDndItemStartLeft = dndItem.startLeft;
        // const oldCurrentStartTop = this.startTop;
        // const oldCurrentStartLeft = this.startLeft;

        // dndItem.startTop =
        //     this.startPosY -
        //     y +
        //     parseFloat(getComputedStyle(dndItem.eRef.nativeElement).top);
        // dndItem.startLeft =
        //     this.startPosX -
        //     x +
        //     parseFloat(getComputedStyle(dndItem.eRef.nativeElement).left);
        // dndItem.setStartPosition();
        dndItem.startTop = this.startPosY - y;
        dndItem.startLeft = this.startPosX - x;
        dndItem.setStartPosition();
        // dndItem.eRef.nativeElement.style.top = this.startPosY - y + 'px';
        // dndItem.eRef.nativeElement.style.left = this.startPosX - x + 'px';

        // 2 строчки ниже работаю
        this.startTop = y - this.startPosY;
        this.startLeft = x - this.startPosX;

        // // [this.startTop, this.startLeft] = [
        // //     oldDndItemStartTop,
        // //     oldDndItemStartLeft,
        // // ];
        // this.startTop = oldDndItemStartTop;
        // this.startLeft = oldDndItemStartLeft;
        // this.eRef.nativeElement.style.top = oldDndItemStartTop + 'px';
        // this.eRef.nativeElement.style.left = oldDndItemStartLeft + 'px';

        // this.isStartDrag.set(false);
    }

    ////////////////////////////////
    // private readonly eRef: ElementRef<HTMLElement> = inject(ElementRef);
    // private readonly dndService = inject(DragNDropService);
    // private readonly dndSiblingItems = computed(() =>
    //     this.init()
    //         ? this.dndService
    //               .dndItems()
    //               ?.filter(
    //                   ({ ownPosX, ownPosY }) =>
    //                       !(
    //                           ownPosX === this.ownPosX &&
    //                           ownPosY === this.ownPosY
    //                       )
    //               )
    //         : []
    // );
    // private readonly init = signal(false);
    // private readonly isStartDragEffect = effect(() => {
    //     this.eRef.nativeElement.style.cursor = this.isStartDrag()
    //         ? 'grabbing'
    //         : 'grab';
    // });

    // private isStartDrag = signal(false);
    // private initialTop = 0;
    // private initialLeft = 0;
    // private startDragY = 0;
    // private startDragX = 0;
    // private ownPosY = 0;
    // private ownPosX = 0;

    // ngOnInit() {
    //     const initialDOMRect = this.eRef.nativeElement.getBoundingClientRect();

    //     this.initialTop = this.eRef.nativeElement.clientTop;
    //     this.initialLeft = this.eRef.nativeElement.clientLeft;
    //     this.ownPosY = initialDOMRect.y;
    //     this.ownPosX = initialDOMRect.x;
    //     console.log(initialDOMRect.y, initialDOMRect.x);

    //     this.init.set(true);
    // }

    // @HostListener('mousedown', ['$event']) onMousedown(event: MouseEvent) {
    //     this.startDragY = event.y;
    //     this.startDragX = event.x;
    //     this.eRef.nativeElement.style.zIndex = '999';
    //     this.isStartDrag.set(true);
    // }

    // @HostListener('window:mouseup')
    // @HostListener('mouseup')
    // private onMouseup() {
    //     this.setStartPosition();
    // }

    // // TODO: сделать так, чтобы события не всплывали
    // @HostListener('mousemove', ['$event']) private onMousemove(
    //     event: MouseEvent
    // ) {
    //     if (this.isStartDrag()) {
    //         const sibling = this.dndSiblingItems()?.find((item) =>
    //             isSufficientCovered(
    //                 this.eRef.nativeElement,
    //                 item.eRef.nativeElement,
    //                 50
    //             )
    //         );

    //         if (sibling) {
    //             this.switchStartPosition(sibling);

    //             console.log('switching');
    //             return;
    //         }

    //         this.eRef.nativeElement.style.top =
    //             event.y - this.startDragY + 'px';
    //         this.eRef.nativeElement.style.left =
    //             event.x - this.startDragX + 'px';
    //     }
    // }

    // setStartPosition() {
    //     this.eRef.nativeElement.style.top = this.initialTop + 'px';
    //     this.eRef.nativeElement.style.left = this.initialLeft + 'px';
    //     this.eRef.nativeElement.style.zIndex = '0';
    //     this.isStartDrag.set(false);
    // }

    // switchStartPosition(dndItem: DragNDropItemDirective) {
    //     dndItem.initialTop = this.ownPosY - dndItem.ownPosY;
    //     dndItem.initialLeft = this.ownPosX - dndItem.ownPosX;
    //     console.log(this.initialTop, this.initialLeft);
    //     this.initialTop = dndItem.ownPosY - this.ownPosY;
    //     this.initialLeft = dndItem.ownPosX - this.ownPosX;
    //     console.log(this.initialTop, this.initialLeft);

    //     dndItem.eRef.nativeElement.style.top =
    //         this.ownPosY - dndItem.ownPosY + 'px';
    //     dndItem.eRef.nativeElement.style.left =
    //         this.ownPosX - dndItem.ownPosX + 'px';
    // }
}
