# Obsidian Rename Images Plugin

This plugin for [Obsidian](https://obsidian.md/) renames all images of currently opened .md file.

## How to use
1. Install the Obsidian plugin and enable it.
2. Adjust options in setting page, click Preview button to preview rename format.
3. Open a .md file, click Ribbon Icon or use Command Palette: `Rename images: Rename all images of current file`.

## Known issue
### Name conflict when insert a new image after rename all images of current file
Description: 

Insert a new image at the top of a file whose images have already been batch named, and there will be a name conflict when batch renaming again.

Solution: 

Step 1: Choose a different delimiter, and rename all images. 

Step 2(Optional): Choose the previous delimiter, rename all images again.

## Todo
- [ ] Support Simplified Chinese.