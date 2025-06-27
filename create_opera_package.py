#!/usr/bin/env python3
import os
import zipfile
import shutil

def create_opera_package():
    """Create an Opera-compatible package with proper path separators."""
    
    # Source directory
    source_dir = "opera-version"
    
    # Output files
    zip_name = "PinSaver-Pro-Opera-v1.1.3.zip"
    nex_name = "PinSaver-Pro-Opera-v1.1.3.nex"
    
    # Remove existing packages
    for file in [zip_name, nex_name]:
        if os.path.exists(file):
            os.remove(file)
            print(f"Removed existing {file}")
    
    # Create ZIP with proper path separators
    with zipfile.ZipFile(zip_name, 'w', zipfile.ZIP_DEFLATED, compresslevel=6) as zipf:
        for root, dirs, files in os.walk(source_dir):
            for file in files:
                file_path = os.path.join(root, file)
                # Calculate relative path from source_dir
                rel_path = os.path.relpath(file_path, source_dir)
                # Convert to forward slashes for archive
                archive_path = rel_path.replace(os.sep, '/')
                
                zipf.write(file_path, archive_path)
                print(f"Added: {archive_path}")
    
    # Create NEX (Opera Extension format - same as ZIP but with .nex extension)
    shutil.copy2(zip_name, nex_name)
    
    print(f"\nCreated packages:")
    print(f"- {zip_name}")
    print(f"- {nex_name}")
    
    # Show file size
    zip_size = os.path.getsize(zip_name)
    print(f"\nPackage size: {zip_size:,} bytes ({zip_size/1024:.1f} KB)")
    
    print(f"\nExtension Details:")
    print(f"- Name: PinSaver Pro - Bulk Image Downloader")
    print(f"- Manifest: V3 (Chromium/Opera compatible)")
    print(f"- Platform: Opera Add-ons Store")
    print(f"- Minimum Opera Version: 77.0+")
    print(f"\n✅ Ready for Opera Add-ons submission!")
    
    print(f"\nInstallation Instructions:")
    print(f"1. Extract {zip_name}")
    print(f"2. Open opera://extensions/")
    print(f"3. Enable Developer mode")
    print(f"4. Click 'Load unpacked' and select the extracted folder")

if __name__ == "__main__":
    create_opera_package()
