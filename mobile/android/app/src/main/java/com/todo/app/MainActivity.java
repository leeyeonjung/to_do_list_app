package com.todo.app;

import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import androidx.activity.OnBackPressedCallback;

import com.getcapacitor.Bridge;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Deep link 처리 (앱이 이미 실행 중일 때)
        handleIntent(getIntent());

        // Bridge가 초기화된 후 WebView 설정
        Bridge bridge = this.getBridge();
        if (bridge != null) {
            WebView webView = bridge.getWebView();
            if (webView != null) {
                configureWebView(webView);
                setupBackPressHandling(webView);
            }
        }
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        setIntent(intent);
        handleIntent(intent);
    }

    /**
     * Deep link 처리: todolist://auth/callback?token=xxx
     * 카카오톡 Intent 처리: kakao{APP_KEY}://oauth?code=xxx
     */
    private void handleIntent(Intent intent) {
        if (intent == null) return;

        Uri data = intent.getData();
        if (data == null) return;

        String scheme = data.getScheme();
        
        // 우리 앱의 딥링크 처리
        if ("todolist".equals(scheme) && "auth".equals(data.getHost())) {
            String path = data.getPath();
            if (path != null && path.startsWith("/callback")) {
                // JavaScript로 토큰 전달
                String token = data.getQueryParameter("token");
                if (token != null) {
                    // WebView가 준비될 때까지 대기 후 처리
                    deliverTokenToWebView(token);
                }
            }
        }
        // 카카오톡 Intent 처리 (kakao{APP_KEY}://oauth?code=xxx)
        else if ("kakao".equals(scheme)) {
            // 카카오톡에서 로그인 후 돌아온 경우
            // URL을 WebView로 전달하여 처리
            String url = data.toString();
            deliverKakaoCallbackToWebView(url);
        }
    }

    /**
     * WebView가 준비될 때까지 대기 후 토큰 전달
     */
    private void deliverTokenToWebView(String token) {
        Bridge bridge = this.getBridge();
        if (bridge != null) {
            WebView webView = bridge.getWebView();
            if (webView != null) {
                // WebView가 준비되었으면 즉시 실행
                executeTokenDelivery(webView, token);
            } else {
                // WebView가 아직 준비되지 않았으면 지연 실행
                webView.postDelayed(() -> {
                    WebView wv = bridge.getWebView();
                    if (wv != null) {
                        executeTokenDelivery(wv, token);
                    }
                }, 500);
            }
        } else {
            // Bridge가 아직 준비되지 않았으면 지연 실행
            new android.os.Handler(android.os.Looper.getMainLooper()).postDelayed(() -> {
                Bridge b = this.getBridge();
                if (b != null) {
                    WebView wv = b.getWebView();
                    if (wv != null) {
                        executeTokenDelivery(wv, token);
                    }
                }
            }, 1000);
        }
    }

    /**
     * JavaScript로 토큰 전달 및 메인 페이지로 리다이렉트
     */
    private void executeTokenDelivery(WebView webView, String token) {
        // 토큰을 이스케이프 처리
        String escapedToken = token.replace("'", "\\'").replace("\"", "\\\"");
        
        // JavaScript 함수 호출하여 토큰 전달 및 메인 페이지로 리다이렉트
        // React 앱이 로드될 때까지 재시도하는 로직 추가
        String js = String.format(
            "(function() {" +
            "  var token = '%s';" +
            "  var maxRetries = 10;" +
            "  var retryCount = 0;" +
            "  function tryDeliverToken() {" +
            "    if (window.handleAuthCallback && typeof window.handleAuthCallback === 'function') {" +
            "      console.log('Delivering token to handleAuthCallback');" +
            "      window.handleAuthCallback(token);" +
            "      // 페이지 리다이렉트는 handleAuthCallback 내부에서 처리됨" +
            "      return true;" +
            "    } else if (retryCount < maxRetries) {" +
            "      retryCount++;" +
            "      console.log('Waiting for React app to load, retry ' + retryCount);" +
            "      setTimeout(tryDeliverToken, 200);" +
            "      return false;" +
            "    } else {" +
            "      console.error('Failed to deliver token: handleAuthCallback not found after retries');" +
            "      // Fallback: localStorage에 토큰 저장하고 페이지 새로고침" +
            "      localStorage.setItem('token', token);" +
            "      window.location.href = '/';" +
            "      return false;" +
            "    }" +
            "  }" +
            "  tryDeliverToken();" +
            "})();",
            escapedToken
        );
        
        webView.post(() -> webView.evaluateJavascript(js, null));
    }

    /**
     * 카카오톡 콜백 URL을 WebView로 전달
     * 카카오톡에서 로그인 후 kakao{APP_KEY}://oauth?code=xxx 형태로 리다이렉트됨
     * 이 URL을 우리 서버의 콜백 URL로 변환하여 WebView에서 처리
     */
    private void deliverKakaoCallbackToWebView(String kakaoUrl) {
        // 카카오톡 URL에서 code 파라미터 추출
        Uri uri = Uri.parse(kakaoUrl);
        String code = uri.getQueryParameter("code");
        String error = uri.getQueryParameter("error");
        
        if (code != null) {
            // 우리 서버의 콜백 URL로 변환
            // 카카오톡에서 받은 code를 우리 서버로 전달
            String callbackUrl = "http://13.124.138.204/api/auth/kakao/callback?code=" + code;
            
            // WebView가 준비될 때까지 대기 후 처리
            deliverUrlToWebView(callbackUrl);
        } else if (error != null) {
            // 에러 처리
            String errorDescription = uri.getQueryParameter("error_description");
            String errorMsg = "카카오 로그인 실패: " + (errorDescription != null ? errorDescription : error);
            
            deliverErrorToWebView(errorMsg);
        }
    }

    /**
     * URL을 WebView로 전달
     */
    private void deliverUrlToWebView(String url) {
        Bridge bridge = this.getBridge();
        if (bridge != null) {
            WebView webView = bridge.getWebView();
            if (webView != null) {
                // WebView에서 URL 로드
                webView.post(() -> webView.loadUrl(url));
            } else {
                // WebView가 아직 준비되지 않았으면 지연 실행
                new android.os.Handler(android.os.Looper.getMainLooper()).postDelayed(() -> {
                    Bridge b = this.getBridge();
                    if (b != null) {
                        WebView wv = b.getWebView();
                        if (wv != null) {
                            wv.post(() -> wv.loadUrl(url));
                        }
                    }
                }, 500);
            }
        } else {
            // Bridge가 아직 준비되지 않았으면 지연 실행
            new android.os.Handler(android.os.Looper.getMainLooper()).postDelayed(() -> {
                Bridge b = this.getBridge();
                if (b != null) {
                    WebView wv = b.getWebView();
                    if (wv != null) {
                        wv.post(() -> wv.loadUrl(url));
                    }
                }
            }, 1000);
        }
    }

    /**
     * 에러 메시지를 WebView로 전달
     */
    private void deliverErrorToWebView(String errorMsg) {
        Bridge bridge = this.getBridge();
        if (bridge != null) {
            WebView webView = bridge.getWebView();
            if (webView != null) {
                String js = String.format(
                    "console.error('%s');",
                    errorMsg.replace("'", "\\'").replace("\"", "\\\"")
                );
                webView.post(() -> webView.evaluateJavascript(js, null));
            }
        }
    }

    /**
     * WebView 설정: JS, DOM Storage, 캐시, 텍스트 줌, 내부 로딩 등
     * 참고: https://developer.android.com/develop/ui/views/layout/webapps/webview?hl=ko#groovy
     */
    private void configureWebView(WebView webView) {
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

        // URL 로딩 제어: 우리 서비스는 WebView 내부에서, 소셜 로그인은 외부 브라우저로
        webView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
                    Uri uri = request.getUrl();
                    String url = uri.toString();
                    return handleUrlLoading(view, url);
                }
                return false;
            }

            @Override
            @SuppressWarnings("deprecation")
            public boolean shouldOverrideUrlLoading(WebView view, String url) {
                return handleUrlLoading(view, url);
            }
        });
    }

    /**
     * URL 로딩 처리: 우리 서비스는 WebView 내부에서, 소셜 로그인은 외부 브라우저로
     */
    private boolean handleUrlLoading(WebView view, String url) {
        // 카카오톡 scheme 처리 (kakao{APP_KEY}://oauth)
        if (url.startsWith("kakao")) {
            // 카카오톡 Intent로 처리
            Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
            try {
                startActivity(intent);
                return true; // 우리가 처리함
            } catch (Exception e) {
                // 카카오톡 앱이 설치되지 않은 경우 브라우저로 처리
                // 카카오 로그인 URL로 변환하여 처리
                if (url.contains("://oauth")) {
                    // 카카오톡 URL을 일반 카카오 로그인 URL로 변환
                    Uri uri = Uri.parse(url);
                    String code = uri.getQueryParameter("code");
                    if (code != null) {
                        // 우리 서버의 콜백 URL로 변환
                        String callbackUrl = "http://13.124.138.204/api/auth/kakao/callback?code=" + code;
                        view.loadUrl(callbackUrl);
                        return true;
                    }
                }
                return false;
            }
        }
        
        // 카카오/네이버 로그인 URL은 외부 브라우저로 열기
        if (url.startsWith("https://accounts.kakao.com/") ||
            url.startsWith("https://kauth.kakao.com/") ||
            url.startsWith("https://nid.naver.com/")) {
            Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
            startActivity(intent);
            return true; // 우리가 처리함
        }

        // 우리 서비스 도메인은 WebView 내부에서 로드
        if (url.startsWith("http://13.124.138.204") || 
            url.startsWith("https://13.124.138.204") ||
            url.startsWith("http://localhost") ||
            url.startsWith("https://localhost")) {
            view.loadUrl(url);
            return true; // 우리가 처리함
        }

        // 기타 URL도 WebView 내부에서 로드
        view.loadUrl(url);
        return true;
    }

    /**
     * WebView 뒤로가기 처리: WebView의 history가 있으면 goBack(), 아니면 기본 동작
     */
    private void setupBackPressHandling(WebView webView) {
        getOnBackPressedDispatcher().addCallback(this, new OnBackPressedCallback(true) {
            @Override
            public void handleOnBackPressed() {
                if (webView.canGoBack()) {
                    webView.goBack();
                } else {
                    // 더 이상 history가 없으면 기본 뒤로가기 동작
                    setEnabled(false);
                    getOnBackPressedDispatcher().onBackPressed();
                }
            }
        });
    }
}
