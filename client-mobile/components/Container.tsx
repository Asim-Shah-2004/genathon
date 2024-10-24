import { View } from 'react-native';

export const Container = ({ children }: { children: React.ReactNode }) => {
  return <View className={styles.container}>{children}</View>;
};

const styles = {
  container: 'flex flex-1 bg-[#121212]',
};
