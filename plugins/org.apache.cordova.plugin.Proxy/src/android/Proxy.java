package org.apache.cordova.plugin;

import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.CallbackContext;

import android.os.Build;
import android.os.Parcelable;
import android.util.ArrayMap;
import android.util.Log;
import android.webkit.WebView;
import android.content.Intent;
import android.content.Context;
import android.annotation.SuppressLint;

import java.io.IOException;
import java.io.StringWriter;
import java.io.PrintWriter;

import java.net.Socket;
import java.net.UnknownHostException;
import java.net.SocketTimeoutException;

import java.lang.reflect.Field;
import java.lang.reflect.Method;
import java.lang.reflect.Constructor;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.littleshoot.proxy.impl.DefaultHttpProxyServer;
import org.littleshoot.proxy.HttpProxyServer;
/**
 * This class echoes a string called from JavaScript.
 */
public class Proxy extends CordovaPlugin {
    //public Proxy(){
    private String LOG_TAG = "abread.proxyfier";
    @Override
    public boolean execute(String action, final JSONArray args, final CallbackContext callbackContext) throws JSONException {
        cordova.getThreadPool().execute(new Runnable() {
            public void run() {
                System.out.println("Hello from proxy");
                HttpProxyServer server =
                    DefaultHttpProxyServer.bootstrap()
                        .withPort(8080)
                        .start();
            }
            });
        WebView androidWebView = (WebView)webView.getEngine().getView();
        setProxy(androidWebView, "127.0.0.1", 8080, "android.app.Application");
        callbackContext.success("['Success']");
        return true;
    }
	public boolean setProxy(WebView webview, String host, int port, String applicationClassName) {
		// ICS: 4.0
		if (Build.VERSION.SDK_INT <= 15) {
			return setProxyICS(webview, host, port);
		}
		// 4.1-4.3 (JB)
		else if (Build.VERSION.SDK_INT <= 18) {
			return setProxyJB(webview, host, port);
		}
		// 4.4 (KK) & 5.0 (Lollipop)
		else {
			return setProxyKKPlus(webview, host, port, applicationClassName);
		}
	}

	@SuppressWarnings("all")
	private boolean setProxyICS(WebView webview, String host, int port) {
		try
		{
			Log.d(LOG_TAG, "Setting proxy with 4.0 API.");

			Class jwcjb = Class.forName("android.webkit.JWebCoreJavaBridge");
			Class params[] = new Class[1];
			params[0] = Class.forName("android.net.ProxyProperties");
			Method updateProxyInstance = jwcjb.getDeclaredMethod("updateProxy", params);

			Class wv = Class.forName("android.webkit.WebView");
			Field mWebViewCoreField = wv.getDeclaredField("mWebViewCore");
			Object mWebViewCoreFieldInstance = getFieldValueSafely(mWebViewCoreField, webview);

			Class wvc = Class.forName("android.webkit.WebViewCore");
			Field mBrowserFrameField = wvc.getDeclaredField("mBrowserFrame");
			Object mBrowserFrame = getFieldValueSafely(mBrowserFrameField, mWebViewCoreFieldInstance);

			Class bf = Class.forName("android.webkit.BrowserFrame");
			Field sJavaBridgeField = bf.getDeclaredField("sJavaBridge");
			Object sJavaBridge = getFieldValueSafely(sJavaBridgeField, mBrowserFrame);

			Class ppclass = Class.forName("android.net.ProxyProperties");
			Class pparams[] = new Class[3];
			pparams[0] = String.class;
			pparams[1] = int.class;
			pparams[2] = String.class;
			Constructor ppcont = ppclass.getConstructor(pparams);

			updateProxyInstance.invoke(sJavaBridge, ppcont.newInstance(host, port, null));

			Log.d(LOG_TAG, "Setting proxy with 4.0 API successful!");
			return true;
		}
		catch (Exception ex)
		{
			Log.e(LOG_TAG, "failed to set HTTP proxy: " + ex);
			return false;
		}
	}

	/**
	 * Set Proxy for Android 4.1 - 4.3.
	 */
	@SuppressWarnings("all")
	private boolean setProxyJB(WebView webview, String host, int port) {
		Log.d(LOG_TAG, "Setting proxy with 4.1 - 4.3 API.");

		try {
			Class wvcClass = Class.forName("android.webkit.WebViewClassic");
			Class wvParams[] = new Class[1];
			wvParams[0] = Class.forName("android.webkit.WebView");
			Method fromWebView = wvcClass.getDeclaredMethod("fromWebView", wvParams);
			Object webViewClassic = fromWebView.invoke(null, webview);

			Class wv = Class.forName("android.webkit.WebViewClassic");
			Field mWebViewCoreField = wv.getDeclaredField("mWebViewCore");
			Object mWebViewCoreFieldInstance = getFieldValueSafely(mWebViewCoreField, webViewClassic);

			Class wvc = Class.forName("android.webkit.WebViewCore");
			Field mBrowserFrameField = wvc.getDeclaredField("mBrowserFrame");
			Object mBrowserFrame = getFieldValueSafely(mBrowserFrameField, mWebViewCoreFieldInstance);

			Class bf = Class.forName("android.webkit.BrowserFrame");
			Field sJavaBridgeField = bf.getDeclaredField("sJavaBridge");
			Object sJavaBridge = getFieldValueSafely(sJavaBridgeField, mBrowserFrame);

			Class ppclass = Class.forName("android.net.ProxyProperties");
			Class pparams[] = new Class[3];
			pparams[0] = String.class;
			pparams[1] = int.class;
			pparams[2] = String.class;
			Constructor ppcont = ppclass.getConstructor(pparams);

			Class jwcjb = Class.forName("android.webkit.JWebCoreJavaBridge");
			Class params[] = new Class[1];
			params[0] = Class.forName("android.net.ProxyProperties");
			Method updateProxyInstance = jwcjb.getDeclaredMethod("updateProxy", params);

			updateProxyInstance.invoke(sJavaBridge, ppcont.newInstance(host, port, null));
		} catch (Exception ex) {
			Log.e(LOG_TAG,"Setting proxy with >= 4.1 API failed with error: " + ex.getMessage());
			return false;
		}

		Log.d(LOG_TAG, "Setting proxy with 4.1 - 4.3 API successful!");
		return true;
	}

	// from https://stackoverflow.com/questions/19979578/android-webview-set-proxy-programatically-kitkat
	@SuppressLint("NewApi")
	@SuppressWarnings("all")
	private boolean setProxyKKPlus(WebView webView, String host, int port, String applicationClassName) {
		Log.d(LOG_TAG, "Setting proxy with >= 4.4 API.");

		Context appContext = webView.getContext().getApplicationContext();
		System.setProperty("http.proxyHost", host);
		System.setProperty("http.proxyPort", port + "");
		System.setProperty("https.proxyHost", host);
		System.setProperty("https.proxyPort", port + "");
		try {
			Class applictionCls = Class.forName(applicationClassName);
			Field loadedApkField = applictionCls.getDeclaredField("mLoadedApk");
			loadedApkField.setAccessible(true);
			Object loadedApk = loadedApkField.get(appContext);
			Class loadedApkCls = Class.forName("android.app.LoadedApk");
			Field receiversField = loadedApkCls.getDeclaredField("mReceivers");
			receiversField.setAccessible(true);
			ArrayMap receivers = (ArrayMap) receiversField.get(loadedApk);
			for (Object receiverMap : receivers.values()) {
				for (Object rec : ((ArrayMap) receiverMap).keySet()) {
					Class clazz = rec.getClass();
					if (clazz.getName().contains("ProxyChangeListener")) {
						Method onReceiveMethod = clazz.getDeclaredMethod("onReceive", Context.class, Intent.class);
						Intent intent = new Intent(android.net.Proxy.PROXY_CHANGE_ACTION);

                        String CLASS_NAME;
                        if (Build.VERSION.SDK_INT <= Build.VERSION_CODES.KITKAT) {
                          CLASS_NAME = "android.net.ProxyProperties";
                        } else {
                          CLASS_NAME = "android.net.ProxyInfo";
                        } 
                        Class cls = Class.forName(CLASS_NAME);
						Constructor constructor = cls.getConstructor(String.class, Integer.TYPE, String.class);
						constructor.setAccessible(true);
						Object proxyProperties = constructor.newInstance(host, port, null);
						intent.putExtra("proxy", (Parcelable) proxyProperties);

						onReceiveMethod.invoke(rec, appContext, intent);
					}
				}
			}

			Log.d(LOG_TAG, "Setting proxy with >= 4.4 API successful!");
			return true;
		} catch (java.lang.ClassNotFoundException e) {
			StringWriter sw = new StringWriter();
			e.printStackTrace(new PrintWriter(sw));
			String exceptionAsString = sw.toString();
			Log.v(LOG_TAG, e.getMessage());
			Log.v(LOG_TAG, exceptionAsString);
		} catch (java.lang.NoSuchFieldException e) {
			StringWriter sw = new StringWriter();
			e.printStackTrace(new PrintWriter(sw));
			String exceptionAsString = sw.toString();
			Log.v(LOG_TAG, e.getMessage());
			Log.v(LOG_TAG, exceptionAsString);
		} catch (java.lang.IllegalAccessException e) {
			StringWriter sw = new StringWriter();
			e.printStackTrace(new PrintWriter(sw));
			String exceptionAsString = sw.toString();
			Log.v(LOG_TAG, e.getMessage());
			Log.v(LOG_TAG, exceptionAsString);
		} catch (java.lang.IllegalArgumentException e) {
			StringWriter sw = new StringWriter();
			e.printStackTrace(new PrintWriter(sw));
			String exceptionAsString = sw.toString();
			Log.v(LOG_TAG, e.getMessage());
			Log.v(LOG_TAG, exceptionAsString);
		} catch (java.lang.NoSuchMethodException e) {
			StringWriter sw = new StringWriter();
			e.printStackTrace(new PrintWriter(sw));
			String exceptionAsString = sw.toString();
			Log.v(LOG_TAG, e.getMessage());
			Log.v(LOG_TAG, exceptionAsString);
		} catch (java.lang.reflect.InvocationTargetException e) {
			StringWriter sw = new StringWriter();
			e.printStackTrace(new PrintWriter(sw));
			String exceptionAsString = sw.toString();
			Log.v(LOG_TAG, e.getMessage());
			Log.v(LOG_TAG, exceptionAsString);
		} catch (java.lang.InstantiationException e) {
			StringWriter sw = new StringWriter();
			e.printStackTrace(new PrintWriter(sw));
			String exceptionAsString = sw.toString();
			Log.v(LOG_TAG, e.getMessage());
			Log.v(LOG_TAG, exceptionAsString);
		} 
		return false;
	}

	private Object getFieldValueSafely(Field field, Object classInstance) throws IllegalArgumentException, IllegalAccessException {
		boolean oldAccessibleValue = field.isAccessible();
		field.setAccessible(true);
		Object result = field.get(classInstance);
		field.setAccessible(oldAccessibleValue);
		return result;
	}
}
