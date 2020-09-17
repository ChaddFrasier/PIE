# PIE
-------------
## Planetary Image Editor

This server was created to simplify the figure making process for planetary researchers in the USGS but could be used by anyone with an email. It was first thought up by Laszlo Kestay and with the help from the POW development team at the USGS it became the last connection in a web-based processing pipline that connects PILOT, POW, and PIE in a smooth workfow that removes the need for researchers to learn ISIS3 command line interface programs. With PIE we are also connecting an image editor to the pipline to create publication ready images with less effort.

## Dependencies
1. ISIS3
2. GDAL
3. NodeJS

## Installation

1. Anaconda / Miniconda
``` 
Download [Miniconda3](https://docs.conda.io/en/latest/miniconda.html) or Anaconda3 to help create the development environment.

# Give permission
chmod +x ./Miniconda3.sh

# run the installer
./Miniconda3.sh
```

2. GDAL Environment
``` 
# create the gdal environment
conda create -n gdal

# activate the env
conda activate gdal

# install gdal using conda
conda config --env --add channels conda-forge
conda install -c conda-forge gdal
```

3. ISIS 3
``` 
# create the gdal environment
conda create -n isis python=3.6

# activate the env
conda activate isis

# install isis
conda config --env --add channels conda-forge
conda config --env --add channels usgs-astrogeology
conda install -c usgs-astrogeology isis=3.10.2
```

4. NodeJS
```
Install [NodeJS](https://nodejs.org/en/)
```


### Node Modules
```
# Pull down the code from the repo
git clone https://github.com/ChaddFrasier/PIE.git

# change directory into /PIE
cd /path/to/PIE

# Install dependencies w/ development requirements
npm install

# or

# Install dependencies w/ production requirements
npm install --only=proc
```

## TODOs
2. Dragging functions
    a. north arrow
    b. sun arrow
    c. observer arrow
    d. scalebar icon ( to fix, )
    e. ~rectangle outline~
    f. ~lines~
3. Scale the icons with the scroll wheel
    a. North
    b. Sun
    c. Observer
    d. Scalebar ( Eventually, change size of scalebar and recalculate numbers being displayed )
    e. ~outlines~
    f. ~lines~
4. Fix the scalebar icon size when it is placed on the screen

-----------------------
@USGS