# FreeScore

## Installation

### Pre-install instructions for Mac:
Create symbolic links for the following:

- Frontend systems:
  - /Library/WebServer/Documents -> /var/www/html
  - /Library/WebServer/CGI-Executables -> /var/www/cgi-bin
  - Create a 2 MB ramdisk
  
    ``diskutil erasevolume HFS+ \"ramdisk\" `hdiutil attach -nomount ram://2048` ``

### Installation instructions
Create symbolic links for the following:

- Frontend systems:
  - ~/freescoretkd/frontend/html -> /var/www/html/freescore
  - ~/freescoretkd/frontend/cgi-bin -> /var/www/cgi-bin/freescore
- Backend systems:
  - ~/freescoretkd/backend -> /usr/local/freescore
