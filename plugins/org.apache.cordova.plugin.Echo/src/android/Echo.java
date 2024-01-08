package org.apache.cordova.plugin;

import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.CallbackContext;

import java.io.IOException;
import java.io.StringWriter;
import java.io.PrintWriter;
import java.io.BufferedReader;
import java.io.InputStreamReader;

import java.net.Socket;
import java.net.UnknownHostException;
import java.net.SocketTimeoutException;

import java.util.ArrayList;
import java.util.regex.*;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import android.text.TextUtils;

/**
 * This class echoes a string called from JavaScript.
 */
public class Echo extends CordovaPlugin {
    final static int MAX_CNT = 2048;
    @Override
    public boolean execute(String action, final JSONArray args, final CallbackContext callbackContext) throws JSONException {
        //final JSONArray fargs = args;
        if (action.equals("echo")) {
            cordova.getThreadPool().execute(new Runnable() {
                public void run() {
                    try {
                        String hostName = args.getString(0);
                        int portNumber = Integer.parseInt(args.getString(1));
                        String text = args.getString(2);
                        tcpecho(hostName, portNumber, text, callbackContext);
                    } catch (JSONException e) {
                        callbackContext.error("Got error while read param " + e);
                    }
                }
            });
            return true;
        }
        return false;
    }

    private void tcpecho(String hostName, int portNumber, String text, CallbackContext callbackContext) {
        /*if (args.length != 3) {
            callbackContext.error("Args must be: [host, port, text]");
        }*/
        byte[] resultBuff = new byte[0];
        try { 
            Socket _socket = new Socket(hostName, portNumber);
            PrintWriter out = new PrintWriter(_socket.getOutputStream(), true);
            out.println(text);

            ArrayList<String> sb = new ArrayList();
            BufferedReader in = new BufferedReader( new InputStreamReader(_socket.getInputStream()) );
            int sanitycount = 0;
            boolean gotAPoint = false;

            String regexOkCode = "^2\\d{2} .{2,16}";
            String regexBadCode = "^5\\d{2} .{2,128}";

            while(sanitycount<MAX_CNT) {
                String currentLine = in.readLine();
                if(currentLine==null) break;
                if(currentLine.equals(".")) gotAPoint = true;
                sb.add(currentLine);
                boolean gotOkCode = currentLine.matches(regexOkCode);
                boolean gotBadCode = currentLine.matches(regexBadCode);
                System.out.println("Just read string \""+currentLine+"\", gotAPoint = "+gotAPoint+", gotOkCode = "+gotOkCode+", gotBadCode = "+gotBadCode);

                if(gotOkCode && gotAPoint) break;
                if(gotBadCode && sanitycount<4) break;

                sanitycount++;
            }
            System.out.println("Just read all "+sanitycount+" lines");
            out.println("quit");
            in.close();
            String resStr = TextUtils.join("\n", sb);
            callbackContext.success(resStr);
            _socket.close();
        } catch (UnknownHostException e) {
            callbackContext.error("Don't know about host " + hostName);
        } catch( SocketTimeoutException e) {
            if(resultBuff.length>0) callbackContext.success(resultBuff);
            else callbackContext.error("Connection timeout.");
            //_socket.close();
        } catch (IOException e) {
            if(resultBuff.length>15){ callbackContext.success(resultBuff); }
            else {
                StringWriter sw = new StringWriter();
                e.printStackTrace(new PrintWriter(sw));
                String exceptionAsString = sw.toString();
                callbackContext.error("Couldn't get I/O for the connection to " + hostName + "\nStack:\n" + exceptionAsString);
               // _socket.close();
            }
        }
    }
}
