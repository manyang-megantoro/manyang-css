# Usage

## Basic Usage

### Single Element

```html
<div class="manyang-example-box manyang-h-example-flip">
    Hover for flip effect
</div>
```

### Multiple Elements

```html
<div class="flip-gallery">
    <div class="manyang-example-box manyang-h-example-flip">Card 1</div>
    <div class="manyang-example-box manyang-h-example-flip">Card 2</div>
    <div class="manyang-example-box manyang-h-example-flip">Card 3</div>
</div>
```

## Advanced Usage

### Custom Styling

```css
.custom-flip-box {
    background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
    border-radius: 15px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.2);
}
```

### JavaScript Integration

```javascript
// Programmatic control
element.classList.add('manyang-h-example-flip');
element.classList.remove('manyang-h-example-flip');
```

### Framework Integration

#### React

```jsx
function FlipBox({ children }) {
    return (
        <div className="manyang-example-box manyang-h-example-flip">
            {children}
        </div>
    );
}
```

#### Vue

```vue
<template>
    <div class="manyang-example-box manyang-h-example-flip">
        <slot></slot>
    </div>
</template>
```

## Best Practices

- Always include the model class before the effect class
- Test animations on different devices
- Consider reduced motion preferences
- Use hardware acceleration when possible