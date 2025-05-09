package com.sakuranihongo

import android.os.Bundle
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
// Bạn có thể bỏ import này nếu không dùng trực tiếp nữa
// import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled 
import com.facebook.react.defaults.DefaultReactActivityDelegate
import org.devio.rn.splashscreen.SplashScreen

class MainActivity : ReactActivity() {

    override fun getMainComponentName(): String = "Sakuranihongo"

    // SỬA ĐỔI PHẦN NÀY
    override fun createReactActivityDelegate(): ReactActivityDelegate {
        val fabricEnabledLocally = false // <<-- Đặt tường minh là false ở đây
        return DefaultReactActivityDelegate(
            this,
            mainComponentName,
            fabricEnabledLocally // <<-- Sử dụng biến cục bộ này
        )
    }
    // KẾT THÚC PHẦN SỬA ĐỔI

    override fun onCreate(savedInstanceState: Bundle?) {
        SplashScreen.show(this, true)
        super.onCreate(savedInstanceState)
    }
}