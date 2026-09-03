/**
 * Fixed-column grid.
 *
 * `flexBasis: '48%'` with a gap is the obvious way to write a two-up grid in
 * React Native and it is subtly wrong — the percentage and the gap compete, so
 * the row ends a few points short of the gutter and the columns drift narrower
 * as the gap grows. Negative margin plus per-cell padding gives exact columns
 * and an exact gutter, vertically as well as horizontally.
 */
import { Children, ReactNode } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';

type Props = {
  children: ReactNode;
  columns: number;
  /** Space between cells, both axes. */
  gap: number;
  style?: ViewStyle;
};

export function Grid({ children, columns, gap, style }: Props) {
  const half = gap / 2;
  return (
    <View style={[styles.row, { marginHorizontal: -half, marginVertical: -half }, style]}>
      {Children.map(children, (child) => (
        <View style={{ width: `${100 / columns}%`, padding: half }}>{child}</View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap' },
});
