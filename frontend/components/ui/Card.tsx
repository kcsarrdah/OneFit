import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ViewStyle, 
  TextStyle, 
  ViewProps,
  TextProps,
  StyleProp
} from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';

/**
 * @file Card.tsx
 * @description A set of components for creating card-based UI elements for React Native.
 * Converted from web version to maintain same API and functionality.
 *
 * Components Exported:
 *   - `Card`: The main container for the card.
 *   - `CardHeader`: Container for the card's header section.
 *   - `CardTitle`: Component for the title within the `CardHeader`.
 *   - `CardDescription`: Component for a description or subtitle within the `CardHeader`.
 *   - `CardContent`: Container for the main content of the card.
 *   - `CardFooter`: Container for the card's footer section.
 *
 * Usage:
 *   <Card>
 *     <CardHeader>
 *       <CardTitle>My Card Title</CardTitle>
 *       <CardDescription>A short description of the card.</CardDescription>
 *     </CardHeader>
 *     <CardContent>
 *       <Text>This is the main content of the card.</Text>
 *     </CardContent>
 *     <CardFooter>
 *       <Button>Action</Button>
 *     </CardFooter>
 *   </Card>
 */

interface CardProps extends ViewProps {
  style?: StyleProp<ViewStyle>; 
}

interface CardTextProps extends Omit<TextProps, 'style'> {
  children: React.ReactNode;
  style?: StyleProp<TextStyle>;
}

export const Card = React.forwardRef<View, CardProps>(
  ({ style, ...props }, ref) => {
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'light'];

    return (
      <View
        ref={ref}
        style={[
          styles.card,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
          },
          style
        ]}
        {...props}
      />
    );
  }
);
Card.displayName = 'Card';

export const CardHeader = React.forwardRef<View, CardProps>(
  ({ style, ...props }, ref) => (
    <View
      ref={ref}
      style={[styles.cardHeader, style]}
      {...props}
    />
  )
);
CardHeader.displayName = 'CardHeader';

export const CardTitle = React.forwardRef<Text, CardTextProps>(
  ({ style, children, ...props }, ref) => {
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'light'];

    return (
      <Text
        ref={ref}
        style={[
          styles.cardTitle,
          { color: colors.cardForeground },
          style
        ]}
        {...props}
      >
        {children}
      </Text>
    );
  }
);
CardTitle.displayName = 'CardTitle';

export const CardDescription = React.forwardRef<Text, CardTextProps>(
  ({ style, children, ...props }, ref) => {
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'light'];

    return (
      <Text
        ref={ref}
        style={[
          styles.cardDescription,
          { color: colors.mutedForeground },
          style
        ]}
        {...props}
      >
        {children}
      </Text>
    );
  }
);
CardDescription.displayName = 'CardDescription';

export const CardContent = React.forwardRef<View, CardProps>(
  ({ style, ...props }, ref) => (
    <View
      ref={ref}
      style={[styles.cardContent, style]}
      {...props}
    />
  )
);
CardContent.displayName = 'CardContent';

export const CardFooter = React.forwardRef<View, CardProps>(
  ({ style, ...props }, ref) => (
    <View
      ref={ref}
      style={[styles.cardFooter, style]}
      {...props}
    />
  )
);
CardFooter.displayName = 'CardFooter';

const styles = StyleSheet.create({
  card: {
    borderRadius: 8,
    borderWidth: 1,
    // Shadow for elevation
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  cardHeader: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 0,
    gap: 6, // equivalent to space-y-1.5
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: '600',
    lineHeight: 28,
    letterSpacing: -0.5,
  },
  cardDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  cardContent: {
    paddingHorizontal: 24,
    paddingVertical: 24,
    paddingTop: 0,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 24,
    paddingTop: 0,
  },
});