// import React, {useEffect, useState} from 'react';
// import {
//   SafeAreaView,
//   StyleSheet,
//   Text,
//   View,
//   Button,
//   Alert,
//   Image,
//   ActivityIndicator,
//   ScrollView,
// } from 'react-native';
// import {
//   GoogleSignin,
//   statusCodes,
//   SignInResponse,
//   SignInSilentlyResponse,
// } from '@react-native-google-signin/google-signin';
// import authService, {BackendUserResponse} from '../../services/authService';
// // Định nghĩa kiểu dựa trên cấu trúc log thực tế
// interface LoggedInUser {
//   photo: string;
//   givenName?: string; // Có thể có hoặc không
//   familyName?: string; // Có thể có hoặc không
//   email: string;
//   name: string;
//   id: string;
// }

// interface SuccessDataPayload {
//   scopes: string[];
//   serverAuthCode: string | null; // serverAuthCode có thể là null
//   idToken: string | null; // idToken có thể là null (dù hiếm khi thành công)
//   user: LoggedInUser;
// }

// interface ActualSuccessResponse {
//   type: 'success';
//   data: SuccessDataPayload;
// }

// // Các kiểu phản hồi khác có thể có (dựa trên lỗi và log)
// interface CancelledResponse {
//   type: 'cancelled';
// }

// interface NoSavedCredentialFoundResponse {
//   type: 'noSavedCredentialFound';
// }

// // Kiểu cho state userInfo sẽ là đối tượng user lấy từ log
// const App = () => {
//   const [userInfo, setUserInfo] = useState<BackendUserResponse | null>(null);
//   const [error, setError] = useState<any | {code: string} | null>(null);
//   const [isSigningIn, setIsSigningIn] = useState(false);

//   useEffect(() => {
//     const WEB_CLIENT_ID =
//       '103578990825-bhgslc4ps9g5pfksvbnk274vb2uce3ok.apps.googleusercontent.com';

//     GoogleSignin.configure({
//       webClientId: WEB_CLIENT_ID,
//       offlineAccess: false, // offlineAccess: true có thể yêu cầu serverAuthCode
//       // Nếu không cần serverAuthCode, bạn có thể đặt là false
//       // hoặc bỏ qua nếu không cần idToken cho backend và chỉ cần thông tin user cơ bản
//     });
//     checkCurrentUser();
//   }, []);
//   const handleGoogleLoginData = async (googleData: SuccessDataPayload) => {
//     if (googleData.idToken) {
//       setIsSigningIn(true); // Bắt đầu quá trình gọi backend
//       setError(null);
//       try {
//         console.log(
//           '[App.tsx] Lấy được idToken từ Google:',
//           googleData.idToken,
//         );
//         Alert.alert('Đang xác thực với server...', 'Vui lòng chờ');

//         // Gọi backend để xác thực token và lấy thông tin người dùng của hệ thống
//         const backendUser = await authService.verifyGoogleToken(
//           googleData.idToken,
//         );

//         if (backendUser && backendUser.email) {
//           setUserInfo(backendUser); // Lưu thông tin người dùng từ backend vào state
//           Alert.alert(
//             'Xác thực thành công!',
//             `Xin chào ${backendUser.name || backendUser.email}`,
//           );
//         } else {
//           // Trường hợp backend không trả về dữ liệu user mong đợi
//           console.error(
//             '[App.tsx] Phản hồi từ backend không hợp lệ:',
//             backendUser,
//           );
//           Alert.alert(
//             'Lỗi từ Server',
//             backendUser?.message ||
//               'Không nhận được thông tin người dùng hợp lệ.',
//           );
//           setUserInfo(null);
//         }
//       } catch (backendError: any) {
//         console.error('[App.tsx] Lỗi khi xác thực với backend:', backendError);
//         Alert.alert(
//           'Lỗi xác thực Backend',
//           backendError.message || 'Không thể xác thực với server.',
//         );
//         setUserInfo(null); // Xóa thông tin user nếu backend báo lỗi
//       } finally {
//         setIsSigningIn(false); // Kết thúc quá trình gọi backend
//       }
//     } else {
//       Alert.alert('Lỗi Google Sign-In', 'Không nhận được idToken từ Google.');
//       console.log(
//         '[App.tsx] Không có idToken trong dữ liệu Google:',
//         googleData,
//       );
//       setIsSigningIn(false); // Đảm bảo reset cờ isSigningIn
//     }
//   };
//   // Hàm xử lý chung cho đăng nhập thành công
//   const handleSuccessfulSignIn = (successResponse: ActualSuccessResponse) => {
//     console.log(
//       '===== DỮ LIỆU ĐĂNG NHẬP GOOGLE THÀNH CÔNG ĐẦY ĐỦ (handleSuccessfulSignIn) =====',
//     );
//     console.log(JSON.stringify(successResponse, null, 2));
//     console.log(
//       '===================================================================',
//     );

//     if (successResponse.data && successResponse.data.user) {
//       // Gọi hàm mới để xử lý việc gửi token lên backend
//       handleGoogleLoginData(successResponse.data);
//     } else {
//       console.error(
//         'Dữ liệu user không tìm thấy trong phản hồi thành công:',
//         successResponse,
//       );
//       Alert.alert(
//         'Lỗi dữ liệu Google',
//         'Không nhận được thông tin người dùng đầy đủ từ Google.',
//       );
//       setUserInfo(null);
//     }
//   };

//   const checkCurrentUser = async () => {
//     if (isSigningIn) return; // Tránh chạy nếu đang có thao tác đăng nhập khác
//     setIsSigningIn(true); // Cho biết đang kiểm tra
//     try {
//       // Sử dụng kiểu SignInSilentlyResponse từ thư viện
//       const response: SignInSilentlyResponse =
//         await GoogleSignin.signInSilently();

//       console.log('===== PHẢN HỒI TỪ signInSilently (checkCurrentUser) =====');
//       console.log(JSON.stringify(response, null, 2));
//       console.log('=========================================================');

//       if (response.type === 'success') {
//         // Lúc này, TypeScript nên hiểu response là kiểu ActualSuccessResponse (hoặc tương đương từ thư viện)
//         handleSuccessfulSignIn(response as ActualSuccessResponse); // Ép kiểu nếu TS chưa tự hiểu
//       } else if (response.type === 'noSavedCredentialFound') {
//         console.log('Silent sign in: No saved credential found.');
//         setUserInfo(null);
//       } else {
//         console.log(
//           'Silent sign in: Response type not handled or not success.',
//           response,
//         );
//         setUserInfo(null);
//       }
//     } catch (err: any) {
//       // statusCodes.SIGN_IN_REQUIRED thường được ném ra khi signInSilently không tìm thấy user
//       if (err.code === statusCodes.SIGN_IN_REQUIRED) {
//         console.log(
//           'Silent sign in: User not signed in or session expired (SIGN_IN_REQUIRED).',
//         );
//       } else {
//         console.error('Error during silent sign in:', err);
//       }
//       setUserInfo(null);
//     } finally {
//       setIsSigningIn(false);
//     }
//   };

//   const signIn = async () => {
//     if (isSigningIn) return;
//     setIsSigningIn(true);
//     setError(null);
//     try {
//       await GoogleSignin.hasPlayServices({showPlayServicesUpdateDialog: true});
//       // Sử dụng kiểu SignInResponse từ thư viện
//       const response: SignInResponse = await GoogleSignin.signIn();

//       console.log(
//         '===== PHẢN HỒI TỪ GoogleSignin.signIn() (signIn function) =====',
//       );
//       console.log(JSON.stringify(response, null, 2));
//       console.log(
//         '==============================================================',
//       );

//       if (response.type === 'success') {
//         handleSuccessfulSignIn(response as ActualSuccessResponse); // Ép kiểu nếu TS chưa tự hiểu
//       } else if (response.type === 'cancelled') {
//         Alert.alert('Đã hủy', 'Bạn đã hủy quá trình đăng nhập.');
//         setUserInfo(null);
//       } else {
//         console.warn(
//           'Phản hồi đăng nhập không như mong đợi hoặc không thành công:',
//           response,
//         );
//         Alert.alert(
//           'Lỗi đăng nhập',
//           'Phản hồi không được xử lý. Kiểm tra console.',
//         );
//         setUserInfo(null);
//       }
//     } catch (err: any) {
//       console.error(
//         'Google Sign-In Error (trong catch):',
//         err,
//         'Code:',
//         err.code,
//       );
//       // Các mã lỗi khác từ statusCodes
//       if (err.code === statusCodes.IN_PROGRESS) {
//         Alert.alert(
//           'Đang xử lý',
//           'Đang có một quá trình đăng nhập khác diễn ra.',
//         );
//       } else if (err.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
//         Alert.alert(
//           'Lỗi dịch vụ',
//           'Google Play Services không khả dụng. Vui lòng cập nhật.',
//         );
//       } else if (err.code !== statusCodes.SIGN_IN_CANCELLED) {
//         // SIGN_IN_CANCELLED đã được xử lý bởi response.type
//         Alert.alert(
//           'Lỗi đăng nhập',
//           `Lỗi không xác định. (Code: ${err.code || 'N/A'})`,
//         );
//       }
//       setError(err);
//       setUserInfo(null);
//     } finally {
//       setIsSigningIn(false);
//     }
//   };

//   const signOut = async () => {
//     try {
//       await GoogleSignin.revokeAccess();
//       await GoogleSignin.signOut();
//       setUserInfo(null);
//       setError(null);
//       Alert.alert('Đã đăng xuất', 'Bạn đã đăng xuất thành công khỏi Google.');
//     } catch (err: any) {
//       console.error('Sign-out Error:', err);
//       Alert.alert('Lỗi đăng xuất', 'Đã có lỗi xảy ra khi cố gắng đăng xuất.');
//     }
//   };

//   return (
//     <SafeAreaView style={styles.container}>
//       <ScrollView contentContainerStyle={styles.scrollContent}>
//         <Text style={styles.header}>Kiểm tra Đăng nhập Google</Text>
//         {isSigningIn && (
//           <ActivityIndicator
//             size="large"
//             color="#0000ff"
//             style={styles.loader}
//           />
//         )}
//         {!userInfo && !isSigningIn && (
//           <Button
//             title="Đăng nhập bằng Google"
//             onPress={signIn}
//             disabled={isSigningIn}
//             color="#4285F4"
//           />
//         )}
//         {userInfo && (
//           <View style={styles.userInfoContainer}>
//             <Text style={styles.greeting}>
//               Đăng nhập thành công (từ Backend)!
//             </Text>
//             <Text style={styles.infoText}>Tên: {userInfo.name || 'N/A'}</Text>
//             <Text style={styles.infoText}>Email: {userInfo.email}</Text>
//             {/* Bỏ qua các trường photo, id, givenName, familyName trong lúc này */}
//             <View style={styles.buttonSpacing} />
//             <Button title="Đăng xuất" onPress={signOut} color="#d9534f" />
//           </View>
//         )}
//         {error && !isSigningIn && (
//           <Text style={styles.errorText}>
//             Lỗi: {(error as any).message || `Mã lỗi: ${(error as any).code}`}
//           </Text>
//         )}
//       </ScrollView>
//     </SafeAreaView>
//   );
// };

// // Styles giữ nguyên
// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#f0f0f0',
//   },
//   scrollContent: {
//     flexGrow: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: 20,
//   },
//   header: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     marginBottom: 20,
//     textAlign: 'center',
//   },
//   loader: {
//     marginVertical: 20,
//   },
//   userInfoContainer: {
//     alignItems: 'center',
//     padding: 15,
//     backgroundColor: '#fff',
//     borderRadius: 10,
//     shadowColor: '#000',
//     shadowOffset: {width: 0, height: 2},
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 3,
//     width: '95%',
//     marginTop: 20,
//     marginBottom: 20,
//   },
//   greeting: {
//     fontSize: 20,
//     fontWeight: '600',
//     marginBottom: 10,
//   },
//   profileImage: {
//     width: 80,
//     height: 80,
//     borderRadius: 40,
//     marginBottom: 10,
//     borderWidth: 2,
//     borderColor: '#ddd',
//   },
//   infoText: {
//     fontSize: 14,
//     marginBottom: 5,
//     textAlign: 'left',
//     width: '100%',
//   },
//   buttonSpacing: {
//     height: 15,
//   },
//   errorText: {
//     marginTop: 15,
//     color: 'red',
//     textAlign: 'center',
//     paddingHorizontal: 10,
//   },
// });

// export default App;
