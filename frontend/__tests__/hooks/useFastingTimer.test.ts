// __tests__/hooks/useFastingTimer.test.ts
import { renderHook, act } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFastingTimer } from '../../hooks/useFastingTimer';

const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

describe('useFastingTimer', () => {
  let mockOnComplete: jest.Mock;
  const goalDurationSeconds = 16 * 3600;

  beforeEach(() => {
    jest.clearAllMocks();
    mockOnComplete = jest.fn();
    
    mockAsyncStorage.getItem.mockResolvedValue(null);
    mockAsyncStorage.setItem.mockResolvedValue();
    mockAsyncStorage.removeItem.mockResolvedValue();
  });

  // ✅ Basic state tests (these should work)
  it('should initialize with correct default state', () => {
    const { result } = renderHook(() => 
      useFastingTimer({ goalDurationSeconds, onComplete: mockOnComplete })
    );

    expect(result.current.isActive).toBe(false);
    expect(result.current.elapsedSeconds).toBe(0);
    expect(result.current.startTime).toBe(null);
  });

  it('should start fast and update state', async () => {
    const { result } = renderHook(() => 
      useFastingTimer({ goalDurationSeconds, onComplete: mockOnComplete })
    );

    await act(async () => {
      result.current.startFast();
    });

    expect(result.current.isActive).toBe(true);
    expect(result.current.startTime).toBeTruthy();
  });

  it('should call onComplete when stopping fast', async () => {
    const { result } = renderHook(() => 
      useFastingTimer({ goalDurationSeconds, onComplete: mockOnComplete })
    );

    const startTime = Date.now();
    jest.spyOn(Date, 'now').mockReturnValue(startTime);

    await act(async () => {
      result.current.startFast();
    });

    const endTime = startTime + 3600000; // 1 hour later
    jest.spyOn(Date, 'now').mockReturnValue(endTime);

    await act(async () => {
      result.current.stopFast();
    });

    expect(mockOnComplete).toHaveBeenCalledWith({
      startTime,
      endTime,
      actualDurationSeconds: 3600,
      goalDurationSeconds,
    });
  });

  it('should reset timer state', async () => {
    const { result } = renderHook(() => 
      useFastingTimer({ goalDurationSeconds, onComplete: mockOnComplete })
    );

    await act(async () => {
      result.current.startFast();
    });

    await act(async () => {
      result.current.resetTimer();
    });

    expect(result.current.isActive).toBe(false);
    expect(result.current.elapsedSeconds).toBe(0);
    expect(result.current.startTime).toBe(null);
  });

  it('should not start if already active', async () => {
    const { result } = renderHook(() => 
      useFastingTimer({ goalDurationSeconds, onComplete: mockOnComplete })
    );

    await act(async () => {
      result.current.startFast();
    });

    const firstStartTime = result.current.startTime;

    await act(async () => {
      result.current.startFast();
    });

    expect(result.current.startTime).toBe(firstStartTime);
  });

  it('should calculate progress percentage correctly', () => {
    const { result } = renderHook(() => 
      useFastingTimer({ goalDurationSeconds: 100, onComplete: mockOnComplete })
    );

    expect(result.current.progressPercentage).toBe(0);
    expect(result.current.remainingSeconds).toBe(100);
  });

  it('should increment elapsed seconds over time', async () => {
    jest.useFakeTimers();
    
    const { result } = renderHook(() => 
      useFastingTimer({ goalDurationSeconds, onComplete: mockOnComplete })
    );

    const startTime = Date.now();
    jest.spyOn(Date, 'now').mockReturnValue(startTime);

    await act(async () => {
      result.current.startFast();
    });

    // Advance time by 10 seconds
    jest.spyOn(Date, 'now').mockReturnValue(startTime + 10000);
    
    act(() => {
      jest.advanceTimersByTime(1000); // Trigger the interval
    });

    expect(result.current.elapsedSeconds).toBe(10);

    // Advance time by another 5 seconds
    jest.spyOn(Date, 'now').mockReturnValue(startTime + 15000);
    
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(result.current.elapsedSeconds).toBe(15);

    jest.useRealTimers();
  });

  it('should auto-stop when goal duration is reached', async () => {
    jest.useFakeTimers();
    
    const shortGoal = 30; // 30 seconds for quick test
    const { result } = renderHook(() => 
      useFastingTimer({ goalDurationSeconds: shortGoal, onComplete: mockOnComplete })
    );

    const startTime = Date.now();
    jest.spyOn(Date, 'now').mockReturnValue(startTime);

    await act(async () => {
      result.current.startFast();
    });

    // Advance time to exactly the goal duration
    const endTime = startTime + (shortGoal * 1000);
    jest.spyOn(Date, 'now').mockReturnValue(endTime);
    
    act(() => {
      jest.advanceTimersByTime(1000); // Trigger the interval check
    });

    expect(result.current.isActive).toBe(false);
    expect(mockOnComplete).toHaveBeenCalledWith({
      startTime,
      endTime,
      actualDurationSeconds: shortGoal,
      goalDurationSeconds: shortGoal,
    });

    jest.useRealTimers();
  });

  it('should save and restore timer state from storage', async () => {
    const savedStartTime = Date.now() - 5000; // Started 5 seconds ago
    const savedState = {
      startTime: savedStartTime,
      goalDurationSeconds: goalDurationSeconds, // Must match current goal
    };
    
    mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(savedState));

    const { result } = renderHook(() => 
      useFastingTimer({ goalDurationSeconds, onComplete: mockOnComplete })
    );

    // Wait for the async effect to restore state
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 10));
    });

    expect(result.current.isActive).toBe(true);
    expect(result.current.startTime).toBe(savedStartTime);
    expect(result.current.elapsedSeconds).toBeGreaterThan(4); // Should be around 5 seconds

    // Test saving state when stopping
    await act(async () => {
      result.current.stopFast();
    });

    expect(mockAsyncStorage.removeItem).toHaveBeenCalledWith('fastingTimerState');
  });

    it('should not break when stopping an inactive timer', async () => {
        const { result } = renderHook(() => 
          useFastingTimer({ goalDurationSeconds, onComplete: mockOnComplete })
        );
    
        // Timer is not active, try to stop it
        await act(async () => {
          result.current.stopFast();
        });
    
        // Should remain in inactive state without errors
        expect(result.current.isActive).toBe(false);
        expect(result.current.elapsedSeconds).toBe(0);
        expect(result.current.startTime).toBe(null);
        expect(mockOnComplete).not.toHaveBeenCalled();
    
        // Should still be able to start normally after failed stop
        await act(async () => {
          result.current.startFast();
        });
    
        expect(result.current.isActive).toBe(true);
      });

});