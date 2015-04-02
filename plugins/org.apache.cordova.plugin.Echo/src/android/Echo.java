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

/**
 * This class echoes a string called from JavaScript.
 */
public class Echo extends CordovaPlugin {
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
            /*String outtext = "";
            String _outtxt = "empty";
            BufferedReader in = new BufferedReader( new InputStreamReader(_socket.getInputStream()) );
            _outtxt = in.readLine();
            outtext += _outtxt;
            callbackContext.success(outtext);*/
            byte[] buff = new byte[256]; //No less 32 bytes
            int k = -1;
            int sanitycount = 64; //No more 32*512 bytes
            _socket.setSoTimeout(16384);
            while((k = _socket.getInputStream().read(buff, 0, buff.length)) > -1 && sanitycount > 0) {
                byte[] tbuff = new byte[resultBuff.length + k]; // temp buffer size = bytes already read + bytes last read
                System.arraycopy(resultBuff, 0, tbuff, 0, resultBuff.length); // copy previous bytes
                System.arraycopy(buff, 0, tbuff, resultBuff.length, k);  // copy current lot
                resultBuff = tbuff; // call the temp buffer as your result buff
                if(sanitycount==64){_socket.setSoTimeout(1024);} else {out.println("\nquit\n");}
                sanitycount--;
            }
            System.out.println(resultBuff.length + " bytes read.");
            String resStr = new String(resultBuff);
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
