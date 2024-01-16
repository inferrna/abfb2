#!/usr/bin/env python

from http.server import HTTPServer, BaseHTTPRequestHandler
from socketserver import ThreadingMixIn
import threading, urllib, json, socket
from base64 import standard_b64encode as b64encode
from http.cookiejar import CookieJar, DefaultCookiePolicy
try: from lxml import etree
except: import xml.etree.ElementTree as etree
from xml.sax.saxutils import escape

def get_def(text, host, port):
    #HOST = 'localhost'    # The remote host
    #PORT = 2628         # The same port as used by the server
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.connect((host, port))
    s.sendall(f"{text}\n".encode())
    data = s.recv(65536)
    return data

def _get_def(request, host, port):
    # Create a socket object
    client_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)

    try:
        # Connect to the server
        client_socket.connect((host, port))

        # Send the request
        client_socket.sendall((f"{request}\n").encode('utf-8'))

        # Receive the response
        response = b''
        while True:
            data = client_socket.recv(1024)
            if not data:
                break
            response += data

            # Check if the response ends with a line starting with 2xx or 5xx
            if b'\n2' in response or b'\n5' in response:
                break

        return response.decode('utf-8')

    except Exception as e:
        print(f"Error: {e}")

    finally:
        # Close the socket
        client_socket.close()



class Handler(BaseHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        BaseHTTPRequestHandler.__init__(self, *args, **kwargs)
        
    def do_POST(self):
        self.send_response(200)
        self.send_header("Content-type", "text/plain; charset=utf-8")
        self.send_header("Access-Control-Allow-Origin", "*");
        self.send_header("Connection", "close")
        self.end_headers()
        length = int(self.headers['Content-Length'])
        output = json.dumps(("Unknown request",))
        inparam = urllib.parse.parse_qs(self.rfile.read(length).decode('utf-8'))
        print(inparam)
        post_data = inparam#json.loads(inparam)
        self.do_smth(post_data)

    def do_GET(self):
        self.send_response(200)
        self.send_header("Content-type", "text/html; charset=utf-8")
        self.send_header("Access-Control-Allow-Origin", "*");
        self.end_headers()
        get_data = urllib.parse.parse_qs(self.path.split('?')[1])
        self.do_smth(get_data)

    def do_smth(self, data):
        if 'swac' in data:
            f = open('swac.json', 'w')
            f.write(str(data['swac']))
            f.close()
        try: word = data['text'][0]
        except:
            self.wfile.write('{error: no word given}'.encode('utf-8'))
            return
        try: host = data['host'][0]
        except:
            self.wfile.write('{error: no host given}'.encode('utf-8'))
            return
        try: port = int(data['port'][0])
        except:
            self.wfile.write('{error: no port given}'.encode('utf-8'))
            return
        self.wfile.write(get_def(word, host, port))
        if not self.wfile.closed:
            self.wfile.flush()
            self.wfile.close()
        self.rfile.close()
        return

class ThreadedHTTPServer(ThreadingMixIn, HTTPServer):
    """Handle requests in a separate thread."""

 
if __name__ == '__main__':
    server = ThreadedHTTPServer(('0.0.0.0', 8082), Handler)
    print('Starting server, use <Ctrl-C> to stop')
    server.serve_forever()
