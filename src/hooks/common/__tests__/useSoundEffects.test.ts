import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSoundEffects } from '../useSoundEffects';

describe('useSoundEffects', () => {
  let mockOscillator: {
    type: OscillatorType;
    frequency: { setValueAtTime: ReturnType<typeof vi.fn>; exponentialRampToValueAtTime: ReturnType<typeof vi.fn> };
    connect: ReturnType<typeof vi.fn>;
    start: ReturnType<typeof vi.fn>;
    stop: ReturnType<typeof vi.fn>;
  };

  let mockGainNode: {
    gain: { setValueAtTime: ReturnType<typeof vi.fn>; exponentialRampToValueAtTime: ReturnType<typeof vi.fn> };
    connect: ReturnType<typeof vi.fn>;
  };

  let mockAudioContext: {
    state: AudioContextState;
    currentTime: number;
    destination: AudioDestinationNode;
    createOscillator: ReturnType<typeof vi.fn>;
    createGain: ReturnType<typeof vi.fn>;
    resume: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    mockOscillator = {
      type: 'sine',
      frequency: {
        setValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn(),
      },
      connect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
    };

    mockGainNode = {
      gain: {
        setValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn(),
      },
      connect: vi.fn(),
    };

    mockAudioContext = {
      state: 'running',
      currentTime: 0,
      destination: {} as AudioDestinationNode,
      createOscillator: vi.fn(() => mockOscillator),
      createGain: vi.fn(() => mockGainNode),
      resume: vi.fn().mockResolvedValue(undefined),
    };

    // @ts-expect-error - mocking AudioContext
    window.AudioContext = vi.fn(() => mockAudioContext);
    // @ts-expect-error - mocking webkitAudioContext
    window.webkitAudioContext = vi.fn(() => mockAudioContext);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should create AudioContext on first use', () => {
    const { result } = renderHook(() => useSoundEffects());

    act(() => {
      result.current.playSound('click');
    });

    expect(window.AudioContext).toHaveBeenCalled();
  });

  it('should reuse AudioContext on subsequent calls', () => {
    const { result } = renderHook(() => useSoundEffects());

    act(() => {
      result.current.playSound('click');
      result.current.playSound('open');
    });

    expect(window.AudioContext).toHaveBeenCalledTimes(1);
  });

  it('should play click sound', () => {
    const { result } = renderHook(() => useSoundEffects());

    act(() => {
      result.current.playSound('click');
    });

    expect(mockAudioContext.createOscillator).toHaveBeenCalled();
    expect(mockAudioContext.createGain).toHaveBeenCalled();
    expect(mockOscillator.type).toBe('sine');
    expect(mockOscillator.frequency.setValueAtTime).toHaveBeenCalledWith(800, 0);
    expect(mockOscillator.start).toHaveBeenCalled();
    expect(mockOscillator.stop).toHaveBeenCalled();
  });

  it('should play open sound', () => {
    const { result } = renderHook(() => useSoundEffects());

    act(() => {
      result.current.playSound('open');
    });

    expect(mockOscillator.frequency.setValueAtTime).toHaveBeenCalledWith(300, 0);
    expect(mockOscillator.frequency.exponentialRampToValueAtTime).toHaveBeenCalledWith(600, 0.1);
  });

  it('should play close sound', () => {
    const { result } = renderHook(() => useSoundEffects());

    act(() => {
      result.current.playSound('close');
    });

    expect(mockOscillator.frequency.setValueAtTime).toHaveBeenCalledWith(500, 0);
    expect(mockOscillator.frequency.exponentialRampToValueAtTime).toHaveBeenCalledWith(200, 0.08);
  });

  it('should play success sound', () => {
    const { result } = renderHook(() => useSoundEffects());

    act(() => {
      result.current.playSound('success');
    });

    expect(mockOscillator.frequency.setValueAtTime).toHaveBeenCalledWith(400, 0);
    expect(mockOscillator.frequency.setValueAtTime).toHaveBeenCalledWith(600, 0.08);
  });

  it('should play error sound', () => {
    const { result } = renderHook(() => useSoundEffects());

    act(() => {
      result.current.playSound('error');
    });

    expect(mockOscillator.type).toBe('square');
    expect(mockOscillator.frequency.setValueAtTime).toHaveBeenCalledWith(200, 0);
    expect(mockOscillator.frequency.setValueAtTime).toHaveBeenCalledWith(150, 0.1);
  });

  it('should resume suspended context', () => {
    mockAudioContext.state = 'suspended';
    
    const { result } = renderHook(() => useSoundEffects());

    act(() => {
      result.current.playSound('click');
    });

    expect(mockAudioContext.resume).toHaveBeenCalled();
  });

  it('should not resume running context', () => {
    mockAudioContext.state = 'running';
    
    const { result } = renderHook(() => useSoundEffects());

    act(() => {
      result.current.playSound('click');
    });

    expect(mockAudioContext.resume).not.toHaveBeenCalled();
  });

  it('should return playSound function', () => {
    const { result } = renderHook(() => useSoundEffects());

    expect(typeof result.current.playSound).toBe('function');
  });
});
