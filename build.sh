#!/bin/sh
printf "Remove old android files\n"
npx cordova platform rm android
printf "\nAdd new android\n"
npx cordova platform add android@4.0.2  --verbose
printf "\nSet minSdkVersion to 8\n"
sed -i -e 's:minSdkVersion="10":minSdkVersion="8":g' ./platforms/android/CordovaLib/AndroidManifest.xml
printf "\nBuild android\n"
ANDROID_HOME=~/.dev/Alien/AndroidOld JAVA_HOME=/home/inferno/.jdks/corretto-1.8.0_392 npx cordova build android --verbose
#ANDROID_HOME=~/.dev/Alien/AndroidOld JAVA_HOME=/home/inferno/.jdks/java-6-openjdk-amd64 npx cordova build android --verbose
printf "\nInstall apk\n"
adb install -r /home/inferno/.dev/Android/abfb2/platforms/android/build/outputs/apk/android-debug.apk
printf "\nClear logs\n"
adb logcat -c
printf "\nPush book\n"
adb push prolog.epub /data/data/com.example.abread/lib/prolog.epub
printf "\nPush book to /sdcard/\n"
adb push prolog.epub /sdcard/
