// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolWeight, SymbolViewProps } from 'expo-symbols';
import { ComponentProps } from 'react';
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';

type IconMapping = Record<SymbolViewProps['name'], ComponentProps<typeof MaterialIcons>['name']>;
type IconSymbolName = keyof typeof MAPPING;

/**
 * Add your SF Symbols to Material Icons mappings here.
 * - see Material Icons in the [Icons Directory](https://icons.expo.fyi).
 * - see SF Symbols in the [SF Symbols](https://developer.apple.com/sf-symbols/) app.
 */
const MAPPING = {
  'house.fill': 'home',
  'paperplane.fill': 'send',
  'chevron.left.forwardslash.chevron.right': 'code',
  'chevron.right': 'chevron-right',
  'sun.max': 'wb-sunny',
  'moon': 'nightlight-round',
  'bolt.fill': 'flash-on',
  'drop.fill': 'water-drop',
  'heart.fill': 'favorite',
  'fork.knife': 'restaurant',
  'figure.run': 'directions-run',
  'chevron.down': 'keyboard-arrow-down',
  'chevron.up': 'keyboard-arrow-up', 
  'flame.fill': 'local-fire-department',
  'arrow.2.circlepath': 'refresh',
  'shield.fill': 'shield',
  'gearshape': 'settings',
  'play.fill': 'play-arrow',
  'stop.fill': 'stop',
  'arrow.counterclockwise': 'refresh',
  'chart.bar.fill': 'bar-chart',
  'clock.fill': 'access-time',
  'gearshape.fill': 'settings',
  'rectangle.grid.1x2.fill': 'dashboard',
  'target': 'my-location',
  'timer': 'timer',
  'calendar': 'calendar-today',
  'chart.line.uptrend.xyaxis': 'trending-up',
  'lightbulb.fill': 'lightbulb',
  'plus.circle.fill': 'add-circle',
  'bell.fill': 'notifications',
  'list.bullet': 'list',
  'dumbbell.fill': 'fitness-center',
  'calendar.badge.plus': 'event',
  'trophy.fill': 'emoji-events',
  'square.grid.2x2.fill': 'apps',
  'folder.fill': 'folder',
  'book.fill': 'menu-book',
  'magnifyingglass': 'search',
  'list.bullet.rectangle': 'receipt',
  'chart.pie.fill': 'pie-chart',
  'star.fill': 'star',
  'person.3.fill': 'group',
  'flag.fill': 'flag',
} as const satisfies Record<string, string>;

/**
 * An icon component that uses native SF Symbols on iOS, and Material Icons on Android and web.
 * This ensures a consistent look across platforms, and optimal resource usage.
 * Icon `name`s are based on SF Symbols and require manual mapping to Material Icons.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  return <MaterialIcons color={color} size={size} name={MAPPING[name]} style={style} />;
}
