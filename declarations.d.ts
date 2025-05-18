// declarations.d.ts

// Quan trọng: Import các module bạn sẽ mở rộng ở đây.
// Điều này giúp TypeScript liên kết đúng các khai báo mở rộng của bạn.
import 'react-native-video';
import 'react-native-vector-icons/Icon'; // Cần thiết vì bạn sử dụng IconProps từ đây

declare module 'react-native-vector-icons/Ionicons' {
  // Import này nằm trong phạm vi của module 'react-native-vector-icons/Ionicons' là ổn
  import {IconProps} from 'react-native-vector-icons/Icon';
  const Ionicons: React.ComponentType<IconProps>;
  export default Ionicons;
}

declare module 'react-native-video' {
  // VideoProperties là interface chuẩn chứa các props của component Video.
  // Chúng ta sẽ bổ sung thuộc tính audioOnly vào đây.
  export interface VideoProperties {
    audioOnly?: boolean;
  }
  // Nếu bạn cần bổ sung các props khác trong tương lai, bạn cũng có thể thêm vào đây.
}
