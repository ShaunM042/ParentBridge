#!/bin/bash

# Create a temporary directory
mkdir -p boost_tmp
cd boost_tmp

# Download boost from a different mirror
curl -L -o boost.tar.gz https://archives.boost.io/release/1.76.0/source/boost_1_76_0.tar.gz

# Extract boost
tar xzf boost.tar.gz

# Create the target directory
mkdir -p ../node_modules/react-native/third-party-podspecs/boost

# Copy the boost directory to the React Native third-party-podspecs directory
cp -R boost_1_76_0/boost/* ../node_modules/react-native/third-party-podspecs/boost/

# Clean up
cd ..
rm -rf boost_tmp 