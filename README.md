# AngularZonelessDragNDrop

## `Warning: Simple non-production drag-and-drop implementation`

### How to use:

**1.** Import the DragNDropModule into your component/module class:

```ts
@Component({
    imports: [DragNDropModule],
})
```

**2.** In the component view, apply appDragNDropItem to the item to be dragged. And place them in the container on which the appDragNDropContainer will be applied.

```html
<div appDragNDropContainer>
    <div appDragNDropItem></div>
    <div appDragNDropItem></div>
    <div appDragNDropItem></div>
</div>
```

**3.** You can override some default settings.  
These settings will be applied to each appDragNDropItem inside the appDragNDropContainer.

```html
<div
    appDragNDropContainer
    [coveragePercentage]="50"
    [coverageTime]="250"
    [transitions]="[
        ['top', 300, 'ease-out'],
        ['left', 300, 'ease-out'],
    ]"
></div>
```
