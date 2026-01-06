# Card System

## Overview
Reusable card component system for consistent UI across TSiJUKEBOX.

## Components

### Card
Base card container component.

### CardHeader
Card header with title and optional actions.

### CardContent
Main card content area.

### CardFooter
Card footer for actions and metadata.

## Usage

```tsx
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';

function TrackCard({ track }) {
  return (
    <Card>
      <CardHeader>
        <h3>{track.name}</h3>
      </CardHeader>
      <CardContent>
        <p>{track.artist}</p>
      </CardContent>
      <CardFooter>
        <button>Play</button>
      </CardFooter>
    </Card>
  );
}
```

## Variants
- Default card
- Elevated card
- Outlined card
- Interactive card

## Implementation
Based on Radix UI and Tailwind CSS.

**Location**: `src/components/ui/card.tsx`

## See Also
- [Design System](/docs/DESIGN_SYSTEM.md)
- [Components](/docs/COMPONENTS.md)
