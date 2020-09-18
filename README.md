# PIE

## Planetary Image Editor

This server was created to simplify the figure making process for planetary researchers in the USGS but could be used by anyone with an email. It was first thought up by Laszlo Kestay and with the help from the POW development team at the USGS it became the last connection in a web-based processing pipline that connects PILOT, POW, and PIE in a smooth workfow that removes the need for researchers to learn ISIS3 command line interface programs. With PIE we are also connecting an image editor to the pipline to create publication ready images with less effort.

## Dependencies
1. ISIS3
2. GDAL
3. NodeJS

## Installation

The installation steps below are for an Ubuntu enironment. PIE requires a UNIX based development environment for the simple fact that ISIS cannot be installed on Windows. If you want to install PIE onto a Windows machine you will need to install the Docker image found [here](https://hub.docker.com/repository/docker/chaddfrasier/pie-usgs).

1. Anaconda / Miniconda
Download [Miniconda3](https://docs.conda.io/en/latest/miniconda.html) or Anaconda3 to help create the development environment.
```
# after downloaded navigate to the miniconda install script
cd /path/to/downloaded/script

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

3. ISIS 3 ( Cannot be installed on Windows )
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
Install [NodeJS](https://nodejs.org/en/)
```
follow install steps for your OS.
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

## Running
```
# turn on both environments
conda activate isis && conda activate --stack gdal

# test the environment
lowpass -h && gdal_translate -h
```
-----------------------
@USGS-Astrogeology