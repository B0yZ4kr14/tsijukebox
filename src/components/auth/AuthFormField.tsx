import { forwardRef } from 'react';
import { Control, Controller, FieldValues, Path } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AuthFormFieldProps<T extends FieldValues> {
  name: Path<T>;
  label: string;
  type: 'email' | 'password' | 'text';
  icon: LucideIcon;
  placeholder: string;
  control: Control<T>;
  autoComplete?: string;
  disabled?: boolean;
}

function AuthFormFieldInner<T extends FieldValues>(
  {
    name,
    label,
    type,
    icon: Icon,
    placeholder,
    control,
    autoComplete,
    disabled,
  }: AuthFormFieldProps<T>,
  _ref: React.Ref<HTMLInputElement>
) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <div className="space-y-2">
          <Label htmlFor={name} className="text-label-yellow">
            {label}
          </Label>
          <div className="relative">
            <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 icon-neon-blue" />
            <Input
              id={name}
              type={type}
              placeholder={placeholder}
              autoComplete={autoComplete}
              disabled={disabled}
              className={cn(
                'pl-10 bg-kiosk-surface border-kiosk-border text-kiosk-text',
                error && 'border-red-500 focus-visible:ring-red-500'
              )}
              {...field}
            />
          </div>
          {error && (
            <p className="text-sm text-red-400">{error.message}</p>
          )}
        </div>
      )}
    />
  );
}

// Export with generic support using type assertion
export const AuthFormField = forwardRef(AuthFormFieldInner) as <T extends FieldValues>(
  props: AuthFormFieldProps<T> & { ref?: React.Ref<HTMLInputElement> }
) => React.ReactElement;
