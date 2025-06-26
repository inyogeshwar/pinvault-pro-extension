#!/usr/bin/env python3
import os
import zipfile
import shutil

def create_firefox_package():
    """Create a Firefox-compatible package with proper path separators."""
    
    # Source directory
    source_dir = "firefox-version"
    
    # Output files
    zip_name = "PinSaver-Pro-Firefox-v1.1.3.zip"
    xpi_name = "PinSaver-Pro-Firefox-v1.1.3.xpi"
    
    # Remove existing packages
    for file in [zip_name, xpi_name]:
        if os.path.exists(file):
            os.remove(file)
            print(f"Removed existing {file}")
    
    # Create ZIP with proper path separators
    with zipfile.ZipFile(zip_name, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk(source_dir):
            for file in files:
                file_path = os.path.join(root, file)
                # Calculate relative path from source_dir
                rel_path = os.path.relpath(file_path, source_dir)
                # Convert to forward slashes for archive
                archive_path = rel_path.replace(os.sep, '/')
                
                zipf.write(file_path, archive_path)
                print(f"Added: {archive_path}")
    
    # Create XPI (same as ZIP but with .xpi extension)
    shutil.copy2(zip_name, xpi_name)
    
    print(f"\nCreated packages:")
    print(f"- {zip_name}")
    print(f"- {xpi_name}")
    
    # Show file size
    zip_size = os.path.getsize(zip_name)
    print(f"\nPackage size: {zip_size:,} bytes ({zip_size/1024:.1f} KB)")
    
    print(f"\nExtension Details:")
    print(f"- Name: PinSaver Pro - Bulk Image Downloader")
    print(f"- ID: pinsaver-pro@extension.com")
    print(f"- Firefox Desktop: 79.0+")
    print(f"- Firefox Android: 113.0+")
    print(f"\n✅ Ready for AMO submission!")

if __name__ == "__main__":
    create_firefox_package()
