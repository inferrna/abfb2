import base64
import socket
import json

def start_server(host, port):
    # Create a TCP socket
    server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)

    try:
        # Bind the socket to the specified host and port
        server_socket.bind((host, port))

        # Listen for incoming connections
        server_socket.listen()

        print(f"Server listening on {host}:{port}")
        MAX_BYTES = 65536
        while True:
            # Accept a connection from a client
            client_socket, client_address = server_socket.accept()
            print(f"Accepted connection from {client_address}")

            # Read data from the client and write it to stdout
            data = client_socket.recv(MAX_BYTES)
            while data:
                base_data = data.decode('utf-8')
                try:
                    struct = json.loads(base_data)
                    msg = base64.b64decode(struct["message"])
                    sev = struct["severity"]
                    caller = struct["caller"]
                    print(f"Received message: {msg}, severity: {sev}, caller: {caller}")
                except Exception:
                       print(f"Got wrong line: '{base_data}'")
                data = client_socket.recv(MAX_BYTES)

    except KeyboardInterrupt:
        print("Server shutting down.")
    finally:
        # Close the server socket
        server_socket.close()

if __name__ == "__main__":
    # Specify the host and port for the server
    host = "192.168.10.189"
    port = 1089

    # Start the server
    start_server(host, port)
