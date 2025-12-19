import * as React from 'react';
import * as SwitchPrimitives from '@radix-ui/react-switch';
import { cn } from '@/lib/utils';

interface PermissionToggleProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label: string;
  description?: string;
  disabled?: boolean;
  className?: string;
  'data-testid'?: string;
}

/**
 * Permission Toggle Component with Neon Green/Red effect
 * Used for managing user permissions with visual feedback
 */
export function PermissionToggle({
  checked,
  onCheckedChange,
  label,
  description,
  disabled = false,
  className,
  'data-testid': testId,
}: PermissionToggleProps) {
  return (
    <div 
      className={cn(
        'flex items-center justify-between py-2 px-1 rounded-lg transition-colors',
        'hover:bg-kiosk-surface/30',
        className
      )}
      data-testid={testId || 'permission-toggle'}
    >
      <div className="flex flex-col gap-0.5">
        <label 
          className="text-sm font-medium text-kiosk-text cursor-pointer"
          htmlFor={`toggle-${label.replace(/\s+/g, '-').toLowerCase()}`}
        >
          {label}
        </label>
        {description && (
          <span className="text-xs text-muted-foreground">{description}</span>
        )}
      </div>
      
      <SwitchPrimitives.Root
        id={`toggle-${label.replace(/\s+/g, '-').toLowerCase()}`}
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
        className={cn(
          'peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full',
          'border-2 transition-all duration-300 ease-in-out',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          'disabled:cursor-not-allowed disabled:opacity-50',
          checked ? 'permission-toggle-on' : 'permission-toggle-off'
        )}
        aria-label={`${label}: ${checked ? 'Ativado' : 'Desativado'}`}
      >
        <SwitchPrimitives.Thumb
          className={cn(
            'pointer-events-none block h-5 w-5 rounded-full shadow-lg ring-0',
            'transition-all duration-300 ease-in-out',
            'data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0',
            checked 
              ? 'bg-white shadow-[0_0_10px_rgba(0,255,65,0.8)]' 
              : 'bg-white shadow-[0_0_10px_rgba(255,0,64,0.8)]'
          )}
        />
      </SwitchPrimitives.Root>
    </div>
  );
}

/**
 * Permission Toggle Group - renders multiple toggles
 */
interface PermissionToggleGroupProps {
  permissions: {
    key: string;
    label: string;
    description?: string;
    checked: boolean;
  }[];
  onPermissionChange: (key: string, value: boolean) => void;
  disabled?: boolean;
  className?: string;
}

export function PermissionToggleGroup({
  permissions,
  onPermissionChange,
  disabled = false,
  className,
}: PermissionToggleGroupProps) {
  return (
    <div className={cn('space-y-1', className)}>
      {permissions.map((permission) => (
        <PermissionToggle
          key={permission.key}
          checked={permission.checked}
          onCheckedChange={(value) => onPermissionChange(permission.key, value)}
          label={permission.label}
          description={permission.description}
          disabled={disabled}
          data-testid={`permission-toggle-${permission.key}`}
        />
      ))}
    </div>
  );
}
