import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDebounce } from '../useDebounce';

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should return initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('initial', 500));
    expect(result.current).toBe('initial');
  });

  it('should not update value before delay', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 500 } }
    );

    rerender({ value: 'updated', delay: 500 });

    // Value should still be initial before delay
    expect(result.current).toBe('initial');

    // Advance time but not enough
    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current).toBe('initial');
  });

  it('should update value after delay', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 500 } }
    );

    rerender({ value: 'updated', delay: 500 });

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(result.current).toBe('updated');
  });

  it('should reset timer on rapid value changes', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'first', delay: 500 } }
    );

    // First update
    rerender({ value: 'second', delay: 500 });
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(result.current).toBe('first');

    // Second update before delay - should reset timer
    rerender({ value: 'third', delay: 500 });
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(result.current).toBe('first');

    // Complete the delay
    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(result.current).toBe('third');
  });

  it('should work with different types', () => {
    // Number type
    const { result: numberResult, rerender: rerenderNumber } = renderHook(
      ({ value }) => useDebounce(value, 100),
      { initialProps: { value: 0 } }
    );

    rerenderNumber({ value: 42 });
    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(numberResult.current).toBe(42);

    // Object type
    const { result: objectResult, rerender: rerenderObject } = renderHook(
      ({ value }) => useDebounce(value, 100),
      { initialProps: { value: { name: 'test' } } }
    );

    const newValue = { name: 'updated' };
    rerenderObject({ value: newValue });
    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(objectResult.current).toEqual({ name: 'updated' });
  });

  it('should handle delay changes', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 500 } }
    );

    rerender({ value: 'updated', delay: 200 });

    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(result.current).toBe('updated');
  });
});
