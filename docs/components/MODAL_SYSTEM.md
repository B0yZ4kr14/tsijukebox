# Modal System

## Overview
Modal dialog system for user interactions and content display.

## Components

### Dialog
Base modal dialog component.

### DialogTrigger
Button or element that opens the dialog.

### DialogContent
Modal content container.

### DialogHeader/DialogFooter
Modal sections for title and actions.

## Usage

```tsx
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter
} from '@/components/ui/dialog';

function SettingsModal() {
  return (
    <Dialog>
      <DialogTrigger>
        <button>Open Settings</button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <h2>Settings</h2>
        </DialogHeader>
        <div>
          {/* Settings content */}
        </div>
        <DialogFooter>
          <button>Cancel</button>
          <button>Save</button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

## Features
- Focus trapping
- Keyboard navigation
- Backdrop click to close
- Accessible (ARIA)
- Responsive sizing

## Variants
- Standard modal
- Alert dialog
- Confirmation dialog
- Form dialog

## Implementation
Based on Radix UI Dialog primitive.

**Location**: `src/components/ui/dialog.tsx`

## See Also
- [Design System](/docs/DESIGN_SYSTEM.md)
- [Accessibility](/docs/ACCESSIBILITY.md)
