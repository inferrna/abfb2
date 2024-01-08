package org.apache.cordova.plugin;
import java.lang.System;

import org.apache.cordova.CordovaArgs;
import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.CallbackContext;
import org.apache.cordova.PluginResult;
import java.io.BufferedReader;
import java.io.BufferedInputStream;
import java.io.InputStream;
import java.io.ByteArrayOutputStream;
import java.io.ByteArrayInputStream;

import java.util.Iterator;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;
import java.util.ArrayList;
import java.util.List;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import android.util.Base64;
import android.util.Log;


public class unzip extends CordovaPlugin {

    private static final int BUFFER_SIZE = 4096;
    private static final String LOG_TAG = "unzip";
    
    @Override
    public boolean execute(String action, CordovaArgs args, final CallbackContext callbackContext) throws JSONException {
        android.util.Log.i("CordovaLog execute", "Entry execute");
        if ("unzip".equals(action)) {
            android.util.Log.i("CordovaLog execute", "Action equals");
            unzip(args, callbackContext);
            return true;
        }
        return false;
    }

    private void unzip(final CordovaArgs args, final CallbackContext callbackContext) {
        this.cordova.getThreadPool().execute(new Runnable() {
            public void run() {
                android.util.Log.i("CordovaLog unzip", "Going to run");
                unzipSync(args, callbackContext);
            }
        });
    }

    private void unzipSync(final CordovaArgs args, CallbackContext callbackContext) {
        try {
            android.util.Log.i("CordovaLog unzipSync", "Buffers readed, passed: "+args.get(0).getClass().getName());
            //String datas = args.getString(0);
            //android.util.Log.i("CordovaLog unzipSync", "Data is:\n\""+datas+"\"");

            ByteArrayInputStream is = new ByteArrayInputStream(args.getArrayBuffer(0));
            JSONArray jfilelst = args.getJSONArray(1);
            List<String> filelist = new ArrayList<String>();
            for (int i=0; i<jfilelst.length(); i++) {
                    filelist.add( jfilelst.getString(i) );
            }
            // The inputstream is now pointing at the start of the actual zip file content.
            ZipInputStream zis = new ZipInputStream(is);//new BufferedInputStream(is));

            ZipEntry ze;
            int i = 0;
            byte[] buffer = new byte[BUFFER_SIZE];
            JSONObject json;
            ByteArrayOutputStream bo;// = new ByteArrayOutputStream();
            PluginResult pluginResult;
            byte[] outb;
            //BufferedReader br = new BufferedReader(zis);

            pluginResult = new PluginResult(PluginResult.Status.NO_RESULT);
            pluginResult.setKeepCallback(true);
            callbackContext.sendPluginResult(pluginResult);

            while ((ze = zis.getNextEntry()) != null) 
            {
                String compressedName = ze.getName();
                if(!filelist.contains(compressedName)){
                    zis.closeEntry();
                    continue;
                }
                bo = new ByteArrayOutputStream();
                i++;
                int sz = (int) ze.getSize();
                outb = new byte[sz];
                int count = 0;
                while ((count = zis.read(buffer)) != -1)
                {
                    bo.write(buffer, 0, count); 
                }
                System.arraycopy(bo.toByteArray(), 0, outb, 0, sz);
                Log.i("CordovaLog unzipSync", "Unzip entry "+i+") "+compressedName+" ("+sz+")");
                json = new JSONObject();
                json.put("name", compressedName);
                json.put("data", Base64.encodeToString(outb, 0, sz, Base64.NO_WRAP));
                pluginResult = new PluginResult(PluginResult.Status.OK, json);
                pluginResult.setKeepCallback(true);
                callbackContext.sendPluginResult(pluginResult);
                zis.closeEntry();
            }
            zis.close();
            pluginResult = new PluginResult(PluginResult.Status.OK, new JSONObject("{name:\"END\", data:\"END\"}"));
            pluginResult.setKeepCallback(false);
            is = null; zis = null; ze = null; buffer = null; json = null; bo = null; outb = null;
            callbackContext.sendPluginResult(pluginResult);
        } catch (Exception e) {
            String errorMessage = "An error occurred while unzipping.";
            callbackContext.error(errorMessage);
            Log.e(LOG_TAG, errorMessage, e);
            return;
        }
    }
}
