#!/usr/bin/env python

from http.server import HTTPServer, BaseHTTPRequestHandler
from socketserver import ThreadingMixIn
import threading, urllib, json, socket
from base64 import standard_b64encode as b64encode
from http.cookiejar import CookieJar, DefaultCookiePolicy
try: from lxml import etree
except: import xml.etree.ElementTree as etree
from xml.sax.saxutils import escape

def get_def(word, dct, host, port):
    #HOST = 'localhost'    # The remote host
    #PORT = 2628         # The same port as used by the server
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.connect((host, port))
    s.recv(1024)
    s.sendall(('DEFINE '+dct+' '+word+'\n').encode())
    data = s.recv(1024)
    if data.decode()[:3]=="150":
        data = data + s.recv(512000)
    s.close()
    return data



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
        if data['swac']:
            f = open('swac.json', 'w')
            f.write(str(data['swac']))
            f.close()
        try: word = data['text'][0]
        except:
            self.wfile.write('{error: no word given}'.encode('utf-8'))
            return
        try: dct = data['dict'][0]
        except:
            self.wfile.write('{error: no dictionary given}'.encode('utf-8'))
            return
        try: host = data['host'][0]
        except:
            self.wfile.write('{error: no host given}'.encode('utf-8'))
            return
        try: port = int(data['port'][0])
        except:
            self.wfile.write('{error: no port given}'.encode('utf-8'))
            return
        print(dct, host, port, word)
        self.wfile.write(get_def(word, dct, host, port))
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
