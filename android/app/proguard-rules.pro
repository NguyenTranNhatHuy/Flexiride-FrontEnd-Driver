# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified
# in /usr/local/Cellar/android-sdk/24.3.3/tools/proguard/proguard-android.txt
# You can edit the include path and order by changing the proguardFiles
# directive in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# react-native-reanimated
-keep class com.swmansion.reanimated.** { *; }
-keep class com.facebook.react.turbomodule.** { *; }

# Add any project specific keep options here:


# Mapbox
-dontwarn com.mapbox.**
-keep class com.mapbox.** { *; }
-keep class com.google.gson.** { *; }
-dontwarn com.google.gson.**

# AutoValue
-keepnames class com.ryanharter.auto.value.gson.** { *; }
-keepnames class com.google.auto.value.AutoValue { *; }
-keep class com.google.auto.value.** { *; }

# Fix for missing AutoValue_MapboxDirections
-keep class com.mapbox.api.directions.v5.AutoValue_MapboxDirections$Builder { *; }
-keep class com.mapbox.api.directions.v5.AutoValue_MapboxDirections$1 { *; }
