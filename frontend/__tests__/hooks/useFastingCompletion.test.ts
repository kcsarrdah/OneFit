// __tests__/hooks/useFastCompletion.test.ts
import { renderHook, act } from '@testing-library/react-native';
import { useFastCompletion } from '../../hooks/useFastCompletion';

// Mock fetch globally
global.fetch = jest.fn();

// Mock useToast
jest.mock('../../hooks/useToast', () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}));

const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

describe('useFastCompletion', () => {
  const mockFastData = {
    startTime: Date.now() - 3600000, // 1 hour ago
    endTime: Date.now(),
    actualDurationSeconds: 3600,
    goalDurationSeconds: 16 * 3600,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockClear();
  });

  // ✅ Initial state
  it('should initialize with correct default state', () => {
    const { result } = renderHook(() => useFastCompletion());

    expect(result.current.showModal).toBe(false);
    expect(result.current.completedFast).toBe(null);
    expect(result.current.notes).toBe('');
    expect(result.current.isLoading).toBe(false);
  });

  // ✅ openModal functionality
  it('should open modal with fast data', () => {
    const { result } = renderHook(() => useFastCompletion());

    act(() => {
      result.current.openModal(mockFastData);
    });

    expect(result.current.showModal).toBe(true);
    expect(result.current.completedFast).toEqual(mockFastData);
    expect(result.current.notes).toBe('');
  });

  // ✅ closeModal functionality  
  it('should close modal and clear state', () => {
    const { result } = renderHook(() => useFastCompletion());

    // Open modal first
    act(() => {
      result.current.openModal(mockFastData);
      result.current.setNotes('test notes');
    });

    // Close modal
    act(() => {
      result.current.closeModal();
    });

    expect(result.current.showModal).toBe(false);
    expect(result.current.completedFast).toBe(null);
    expect(result.current.notes).toBe('');
    expect(result.current.isLoading).toBe(false);
  });

  // ✅ setNotes functionality
  it('should update notes correctly', () => {
    const { result } = renderHook(() => useFastCompletion());

    act(() => {
      result.current.setNotes('My fast notes');
    });

    expect(result.current.notes).toBe('My fast notes');
  });

  // ✅ saveFast success
  it('should save fast successfully', async () => {
    const { result } = renderHook(() => useFastCompletion());

    // Mock successful API response
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    } as Response);

    // Open modal and add notes
    act(() => {
      result.current.openModal(mockFastData);
      result.current.setNotes('Great fast!');
    });

    // Save fast
    await act(async () => {
      await result.current.saveFast();
    });

    // Check API call
    expect(mockFetch).toHaveBeenCalledWith('http://localhost:3000/api/fasts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...mockFastData,
        notes: 'Great fast!',
      }),
      signal: expect.any(AbortSignal),
    });

    // Modal should be closed
    expect(result.current.showModal).toBe(false);
    expect(result.current.completedFast).toBe(null);
  });

  // ✅ saveFast API error
  it('should handle API error when saving fast', async () => {
    const { result } = renderHook(() => useFastCompletion());

    // Mock API error
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
    } as Response);

    // Open modal
    act(() => {
      result.current.openModal(mockFastData);
    });

    // Save fast
    await act(async () => {
      await result.current.saveFast();
    });

    // Modal should still be open
    expect(result.current.showModal).toBe(true);
    expect(result.current.completedFast).toEqual(mockFastData);
    expect(result.current.isLoading).toBe(false);
  });

  // ✅ saveFast network error
  it('should handle network error when saving fast', async () => {
    const { result } = renderHook(() => useFastCompletion());

    // Mock network error
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    // Open modal
    act(() => {
      result.current.openModal(mockFastData);
    });

    // Save fast
    await act(async () => {
      await result.current.saveFast();
    });

    // Modal should still be open
    expect(result.current.showModal).toBe(true);
    expect(result.current.isLoading).toBe(false);
  });

  // ✅ saveFast with no completed fast
  it('should do nothing if no completed fast', async () => {
    const { result } = renderHook(() => useFastCompletion());

    await act(async () => {
      await result.current.saveFast();
    });

    expect(mockFetch).not.toHaveBeenCalled();
  });

  // ✅ discardFast functionality
  it('should discard fast and close modal', () => {
    const { result } = renderHook(() => useFastCompletion());

    // Open modal first
    act(() => {
      result.current.openModal(mockFastData);
    });

    // Discard fast
    act(() => {
      result.current.discardFast();
    });

    expect(result.current.showModal).toBe(false);
    expect(result.current.completedFast).toBe(null);
    expect(result.current.notes).toBe('');
  });

  // ✅ Loading state during save
  it('should show loading state while saving', async () => {
    const { result } = renderHook(() => useFastCompletion());

    // Mock delayed response
    let resolvePromise: (value: any) => void;
    const delayedPromise = new Promise(resolve => {
      resolvePromise = resolve;
    });
    mockFetch.mockReturnValueOnce(delayedPromise as any);

    // Open modal
    act(() => {
      result.current.openModal(mockFastData);
    });

    // Start saving (don't await yet)
    act(() => {
      result.current.saveFast();
    });

    // Should be loading
    expect(result.current.isLoading).toBe(true);

    // Resolve the promise
    await act(async () => {
      resolvePromise!({
        ok: true,
        json: async () => ({ success: true }),
      });
    });

    // Should not be loading anymore
    expect(result.current.isLoading).toBe(false);
  });
});