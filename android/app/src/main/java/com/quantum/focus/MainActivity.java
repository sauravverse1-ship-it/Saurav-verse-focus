package com.quantum.focus;

import android.os.Bundle;
import android.view.View;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // Enable Android Immersive Full-Screen Mode
        makeFullScreen();
    }

    @Override
    public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);
        if (hasFocus) {
            makeFullScreen();
        }
    }

    private void makeFullScreen() {
        try {
            if (getWindow() != null) {
                if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.R) {
                    android.view.WindowInsetsController controller = getWindow().getInsetsController();
                    if (controller != null) {
                        controller.hide(android.view.WindowInsets.Type.statusBars() | android.view.WindowInsets.Type.navigationBars());
                        controller.setSystemBarsBehavior(android.view.WindowInsetsController.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE);
                    }
                } else {
                    int uiOptions = View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                                  | View.SYSTEM_UI_FLAG_FULLSCREEN
                                  | View.SYSTEM_UI_FLAG_LAYOUT_STABLE
                                  | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
                                  | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
                                  | View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY;
                    getWindow().getDecorView().setSystemUiVisibility(uiOptions);
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
