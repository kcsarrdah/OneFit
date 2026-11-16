import { renderHook, act } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useHydration } from '@/features/water/hooks/useHydration';
import { WATER_STORAGE_KEYS as KEYS } from '@/features/water/constants';
import { dayKey } from '@/features/water/lib/hydration';

const settle = () => act(async () => {
  await new Promise((resolve) => setTimeout(resolve, 10));
});

describe('useHydration', () => {
  beforeEach(async () => {
    jest.useRealTimers();
    await AsyncStorage.clear();
  });

  it("restores today's intake", async () => {
    await AsyncStorage.multiSet([
      [KEYS.currentIntake, '750'],
      [KEYS.intakeDate, dayKey()],
      [KEYS.dayKeys, 'local'],
    ]);
    const { result } = renderHook(() => useHydration());
    await settle();
    expect(result.current.intake).toBe(750);
  });

  it('starts from 0 when the stored intake is from another day', async () => {
    await AsyncStorage.multiSet([
      [KEYS.currentIntake, '750'],
      [KEYS.intakeDate, '2020-01-01'],
      [KEYS.dayKeys, 'local'],
    ]);
    const { result } = renderHook(() => useHydration());
    await settle();
    expect(result.current.intake).toBe(0);
  });

  it('marks the day keys as migrated', async () => {
    renderHook(() => useHydration());
    await settle();
    expect(await AsyncStorage.getItem(KEYS.dayKeys)).toBe('local');
  });

  it('starts a new day when logging after midnight with the app still open', async () => {
    const lateNight = new Date(2026, 10, 12, 23, 50);
    jest.useFakeTimers({ now: lateNight, doNotFake: ['setTimeout', 'setInterval', 'clearInterval'] });

    const { result } = renderHook(() => useHydration());
    await settle();
    act(() => result.current.logWater());
    act(() => result.current.logWater());
    expect(result.current.intake).toBe(500);

    jest.setSystemTime(new Date(2026, 10, 13, 0, 10));
    act(() => result.current.logWater());
    expect(result.current.intake).toBe(250);

    await settle();
    expect(await AsyncStorage.getItem(KEYS.intakeDate)).toBe('2026-11-13');
    const history = JSON.parse((await AsyncStorage.getItem(KEYS.history)) ?? '[]');
    expect(history.find((h: { date: string }) => h.date === '2026-11-12')?.intake).toBe(500);
    expect(history.find((h: { date: string }) => h.date === '2026-11-13')?.intake).toBe(250);
  });
});
