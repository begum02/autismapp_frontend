import * as React from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import { IconButton } from 'react-native-paper';

type Props = {
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  iconSize?: number;
  iconColor?: string;
  containerColor?: string;
};

const PlusButton = ({
  onPress,
  style,
  iconSize = 32,
  iconColor = '#FFFFFF',
  containerColor = '#AAAFCA',
}: Props) => (
  <IconButton
    icon="plus"
    iconColor={iconColor}
    containerColor={containerColor}
    size={iconSize}
    onPress={onPress}
    style={style}
  />
);

export default PlusButton;