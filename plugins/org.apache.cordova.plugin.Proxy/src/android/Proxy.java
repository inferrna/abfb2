package org.apache.cordova.plugin;

import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.CallbackContext;

import java.io.IOException;
import java.io.StringWriter;
import java.io.PrintWriter;

import java.net.Socket;
import java.net.UnknownHostException;
import java.net.SocketTimeoutException;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.littleshoot.proxy.impl.DefaultHttpProxyServer;
import org.littleshoot.proxy.HttpProxyServer;
/**
 * This class echoes a string called from JavaScript.
 */
public class Proxy extends CordovaPlugin {
    public Proxy(){
        System.out.println("Hello from proxy");
        HttpProxyServer server =
            DefaultHttpProxyServer.bootstrap()
                .withPort(8080)
                .start();
    }
}
