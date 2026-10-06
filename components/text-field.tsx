import { useId, type ComponentProps } from 'react';
import { cn } from '@/lib/utils';

type Props = ComponentProps<'input'> & {
  /** Visible label, tied to the input. Required: a placeholder is not a label. */
  label: string;
  /** Shown under the input in Glitch red; marks the input invalid. Wins over hint. */
  error?: string;
  hint?: string;
};

/** Sunken pixel text input for auth, profile and search. Styles: text-field.css. */
export function TextField({
  label,
  error,
  hint,
  id,
  className,
  type = 'text',
  'aria-describedby': describedBy,
  ...rest
}: Props) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const message = error ?? hint;
  const messageId = message ? `${inputId}-message` : undefined;
  // A caller's note (aria-describedby) is read first, then the hint or error.
  const describedByIds = [describedBy, messageId].filter(Boolean).join(' ') || undefined;

  return (
    <div className={cn('text-field', className)}>
      <label htmlFor={inputId} className="text-field-label">
        {label}
      </label>
      <input
        id={inputId}
        type={type}
        className="text-field-input"
        aria-invalid={error ? true : undefined}
        {...rest}
        aria-describedby={describedByIds}
      />
      {message && (
        <span
          id={messageId}
          className="text-field-message"
          data-error={error ? true : undefined}
          role={error ? 'alert' : undefined}
        >
          {message}
        </span>
      )}
    </div>
  );
}
