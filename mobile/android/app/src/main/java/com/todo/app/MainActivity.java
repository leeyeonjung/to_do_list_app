package com.todo.app;

import android.os.Build;
import android.os.Bundle;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import com.getcapacitor.Bridge;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
    }
    
    @Override
    public void onStart() {
        super.onStart();
        
        // Bridge가 초기화된 후 WebView 설정
        Bridge bridge = this.getBridge();
        if (bridge != null) {
            WebView webView = bridge.getWebView();
            if (webView != null) {
                WebSettings webSettings = webView.getSettings();
                
                // JavaScript 활성화
                webSettings.setJavaScriptEnabled(true);
                
                // DOM Storage 활성화
                webSettings.setDomStorageEnabled(true);
                
                // 미디어 재생 설정
                webSettings.setMediaPlaybackRequiresUserGesture(false);
                
                // 캐시 모드 설정
                webSettings.setCacheMode(WebSettings.LOAD_DEFAULT);
                
                // 텍스트 줌 설정
                webSettings.setTextZoom(100);
                
                // 외부 브라우저로 이동 방지 - 모든 URL을 WebView 내부에서 로드
                webView.setWebViewClient(new WebViewClient() {
                    @Override
                    public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                        // Android 7.0 (API 24) 이상
                        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
                            view.loadUrl(request.getUrl().toString());
                            return true;
                        }
                        return false;
                    }
                    
                    @Override
                    @SuppressWarnings("deprecation")
                    public boolean shouldOverrideUrlLoading(WebView view, String url) {
                        // Android 7.0 미만
                        view.loadUrl(url);
                        return true;
                    }
                });
            }
        }
    }
}
