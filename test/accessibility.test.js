// This file contains tests to ensure the accessibility of the hover effects.

describe('Accessibility Tests for Manyang CSS Hover', () => {
    it('should have no accessibility violations', async () => {
        const { violations } = await axe.run();
        expect(violations.length).toBe(0);
    });

    it('should have appropriate ARIA roles', () => {
        const elements = document.querySelectorAll('[data-hover]');
        elements.forEach(element => {
            expect(element.getAttribute('role')).toBe('button');
        });
    });

    it('should be keyboard accessible', () => {
        const elements = document.querySelectorAll('[data-hover]');
        elements.forEach(element => {
            element.focus();
            expect(document.activeElement).toBe(element);
        });
    });
});