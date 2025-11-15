# Effects

## example-flip

A 3D flip animation that rotates elements along the Y-axis.

### Specifications

- **Duration:** 0.4s
- **Easing:** cubic-bezier(0.68, -0.55, 0.265, 1.55)
- **Transform:** rotateY(180deg)
- **Compatible Models:** example-box

### CSS Implementation

```css
.example-box.h-example-flip {
  transition: transform 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  transform-style: preserve-3d;
}

.example-box.h-example-flip:hover {
  transform: rotateY(180deg);
}
```

### Browser Support

- Chrome 60+
- Firefox 60+
- Safari 12+
- Edge 79+

## Future Effects

- example-bounce
- example-slide
- example-morph