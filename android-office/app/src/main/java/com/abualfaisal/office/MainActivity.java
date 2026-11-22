package com.abualfaisal.office;

import android.app.Activity;
import android.os.Bundle;
import android.os.Build;
import android.content.Intent;
import android.net.Uri;
import android.graphics.Color;
import android.view.View;
import android.view.Gravity;
import android.view.ViewGroup;
import android.webkit.CookieManager;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceError;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.webkit.ValueCallback;
import android.widget.Button;
import android.widget.FrameLayout;
import android.widget.LinearLayout;
import android.widget.ProgressBar;
import android.widget.TextView;
import android.util.TypedValue;

public class MainActivity extends Activity {
    private static final String HOME = "https://abualfaisal-office.abualfaisaltravel.workers.dev/";
    private static final int FILE_REQUEST = 6412;
    private WebView web;
    private ProgressBar progress;
    private LinearLayout offlineView;
    private ValueCallback<Uri[]> uploadCallback;
    private boolean pageError = false;

    private int dp(float px) {
        return (int) (getResources().getDisplayMetrics().density * px + .5f);
    }
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        getWindow().setStatusBarColor(Color.rgb(21,26,57));
        getWindow().setNavigationBarColor(Color.rgb(21,26,57));
        getWindow().setSoftInputMode(android.view.WindowManager.LayoutParams.SOFT_INPUT_ADJUST_RESIZE);
        FrameLayout root = new FrameLayout(this);
        root.setBackgroundColor(Color.WHITE);
        web = new WebView(this);
        web.setBackgroundColor(Color.WHITE);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) web.setSafeBrowsingEnabled(true);
        WebSettings st = web.getSettings();
        st.setJavaScriptEnabled(true);
        st.setDomStorageEnabled(true);
        st.setLoadsImagesAutomatically(true);
        st.setSupportZoom(false);
        st.setBuiltInZoomControls(false);
        st.setDisplayZoomControls(false);
        st.setUseWideViewPort(true);
        st.setLoadWithOverviewMode(false);
        st.setAllowFileAccess(false);
        st.setAllowContentAccess(false);
        st.setJavaScriptCanOpenWindowsAutomatically(false);
        st.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        st.setCacheMode(WebSettings.LOAD_DEFAULT);
        CookieManager.getInstance().setAcceptCookie(true);
        CookieManager.getInstance().setAcceptThirdPartyCookies(web, true);
        web.setWebViewClient(new WebViewClient() {
            @Override
            public void onPageStarted(WebView view, String url, android.graphics.Bitmap favicon) {
                pageError = false;
            }
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                Uri uri = request.getUrl();
                String host = uri.getHost();
                if ("https".equalsIgnoreCase(uri.getScheme()) &&
                   ("abualfaisal-office.abualfaisaltravel.workers.dev".equalsIgnoreCase(host) ||
                    "spring-hall-6c50.cloudflareaccess.com".equalsIgnoreCase(host))) return false;
                openExternal(uri);
                return true;
            }
            @Override
            public void onPageFinished(WebView view, String url) {
                if (!pageError) offlineView.setVisibility(View.GONE);
                CookieManager.getInstance().flush();
            }
            @Override
            public void onReceivedError(WebView view, WebResourceRequest request, WebResourceError error) {
                if (request.isForMainFrame()) {
                    pageError = true;
                    offlineView.setVisibility(View.VISIBLE);
                }
            }
        });
        web.setWebChromeClient(new WebChromeClient() {
            @Override
            public void onProgressChanged(WebView view, int percent) {
                progress.setProgress(percent);
                progress.setVisibility(percent == 100 ? View.GONE : View.VISIBLE);
            }
            @Override
            public boolean onShowFileChooser(WebView view, ValueCallback<Uri[]> callback,
                                             FileChooserParams params) {
                if (uploadCallback != null) uploadCallback.onReceiveValue(null);
                uploadCallback = callback;
                try {
                    startActivityForResult(params.createIntent(), FILE_REQUEST);
                    return true;
                } catch (Exception e) {
                    uploadCallback = null;
                    return false;
                }
            }
        });
        root.addView(web, new FrameLayout.LayoutParams(-1, -1));
        progress = new ProgressBar(this, null, android.R.attr.progressBarStyleHorizontal);
        progress.setMax(100);
        progress.setProgressTintList(android.content.res.ColorStateList.valueOf(Color.rgb(199,163,84)));
        root.addView(progress, new FrameLayout.LayoutParams(-1, dp(3), Gravity.TOP));
        offlineView = new LinearLayout(this);
        offlineView.setOrientation(LinearLayout.VERTICAL);
        offlineView.setGravity(Gravity.CENTER);
        offlineView.setPadding(dp(24),dp(24),dp(24),dp(24));
        offlineView.setBackgroundColor(Color.WHITE);
        TextView message = new TextView(this);
        message.setText("تعذر الاتصال بمركز أبو الفيصل.\\nتحقق من الإنترنت ثم أعد المحاولة.");
        message.setTextSize(TypedValue.COMPLEX_UNIT_SP, 18);
        message.setTextColor(Color.rgb(21,26,57));
        message.setGravity(Gravity.CENTER);
        offlineView.addView(message, new LinearLayout.LayoutParams(-1, -2));
        Button retry = new Button(this);
        retry.setText("إعادة المحاولة");
        retry.setOnClickListener(v -> { offlineView.setVisibility(View.GONE); web.reload(); });
        LinearLayout.LayoutParams retryParams = new LinearLayout.LayoutParams(-2, -2);
        retryParams.topMargin = dp(18);
        offlineView.addView(retry, retryParams);
        FrameLayout.LayoutParams errParams = new FrameLayout.LayoutParams(-1, -1, Gravity.CENTER);
        root.addView(offlineView, errParams);
        offlineView.setVisibility(View.GONE);
        setContentView(root);
        if (savedInstanceState == null || web.restoreState(savedInstanceState) == null)
            web.loadUrl(HOME);
    }
    private void openExternal(Uri uri) {
        try {
            String scheme = uri.getScheme();
            if (scheme == null || !(scheme.equalsIgnoreCase("https") || scheme.equalsIgnoreCase("mailto") || scheme.equalsIgnoreCase("tel"))) return;
            Intent i = new Intent(Intent.ACTION_VIEW, uri);
            startActivity(i);
        } catch (Exception ignored) {}
    }
    @Override
    protected void onActivityResult(int request, int result, Intent data) {
        super.onActivityResult(request, result, data);
        if (request == FILE_REQUEST && uploadCallback != null) {
            uploadCallback.onReceiveValue(WebChromeClient.FileChooserParams.parseResult(result, data));
            uploadCallback = null;
        }
    }
    @Override
    public void onBackPressed() {
        if (web == null) { super.onBackPressed(); return; }
        String back = "(function(){var d=document.querySelector(\'dialog[open]\');if(d){d.close();return \'handled\'}var a=document.querySelector(\'#nav button.active\');if(a&&a.dataset.page!==\'overview\'){var home=document.querySelector(\'#nav button[data-page=\\\"overview\\\"]\');if(home){home.click();return \'handled\'}}return \'native\'})()";
        web.evaluateJavascript(back, value -> {
            if ("\"handled\"".equals(value)) return;
            if (web.canGoBack()) web.goBack();
            else MainActivity.super.onBackPressed();
        });
    }
    @Override
    protected void onSaveInstanceState(Bundle outState) {
        if (web != null) web.saveState(outState);
        super.onSaveInstanceState(outState);
    }
    @Override
    protected void onDestroy() {
        if (web != null) {
            CookieManager.getInstance().flush();
            web.destroy();
        }
        super.onDestroy();
    }
}
