#!/bin/bash

# Create boost directory
mkdir -p boost
cd boost

# Download boost
curl -L https://sourceforge.net/projects/boost/files/boost/1.76.0/boost_1_76_0.tar.gz -o boost.tar.gz

# Verify checksum
EXPECTED_CHECKSUM="f0397ba6e982c4450f27bf32a2a83292aba035b827a5623a14636ea583318c41"
ACTUAL_CHECKSUM=$(shasum -a 256 boost.tar.gz | cut -d ' ' -f 1)

if [ "$EXPECTED_CHECKSUM" != "$ACTUAL_CHECKSUM" ]; then
    echo "Checksum verification failed"
    exit 1
fi

# Extract boost
tar xzf boost.tar.gz
cd boost_1_76_0

# Create podspec
cat > boost.podspec << EOF
Pod::Spec.new do |s|
  s.name         = "boost"
  s.version      = "1.76.0"
  s.summary      = "Boost provides free peer-reviewed portable C++ source libraries."
  s.homepage     = "http://www.boost.org"
  s.license      = "Boost Software License"
  s.author       = "Boost"
  s.source       = { :http => "file://$(pwd)/boost.tar.gz" }
  s.platform     = :ios
  s.ios.deployment_target = '13.0'
  s.source_files = "boost/**/*.{hpp,cpp}"
  s.header_mappings_dir = "boost"
  s.preserve_paths = "boost"
  s.libraries = "stdc++"
end
EOF

# Install pod
pod install 