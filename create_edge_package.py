#!/usr/bin/env python3
import os
import zipfile
import shutil

def create_edge_package():
    """Create an Edge-compatible package with proper path separators."""
    
    # Source directory
    source_dir = "edge-version"
    
    # Output files
    zip_name = "PinVault-Pro-Edge-v1.2.0.zip"
    
    # Remove existing packages
    if os.path.exists(zip_name):
        os.remove(zip_name)
        print(f"Removed existing {zip_name}")
    
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
    
    print(f"\nCreated package:")
    print(f"- {zip_name}")
    
    # Show file size
    zip_size = os.path.getsize(zip_name)
    print(f"\nPackage size: {zip_size:,} bytes ({zip_size/1024:.1f} KB)")
    
    print(f"\nExtension Details:")
    print(f"- Name: PinVault Pro Downloader")
    print(f"- Manifest: V3 (Chrome/Edge compatible)")
    print(f"- Platform: Microsoft Edge Add-ons")
    print(f"\n✅ Ready for Edge Add-ons submission!")

if __name__ == "__main__":
    create_edge_package()
