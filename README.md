# PIE
## Planetary Image Editor

This server was created to simplify the figure making process for planetary researchers at the USGS. It was first thought up by Laszlo Kestay and with the help from the POW development team at the USGS it became the last connection in a web-based processing pipline that connects PILOT, POW, and PIE in a smooth workflow that removes the need for researchers to learn ISIS3 command line interface programs.

## Dependencies
1. ISIS3
2. GDAL
3. NodeJS

## Installation

PIE requires a UNIX based development environment for the simple fact that ISIS cannot be installed on Windows without a virtual environment. If you want to install PIE onto a Windows machine it would be easier to install the Docker image found [here](https://hub.docker.com/repository/docker/chaddfrasier/pie-usgs). If you wish to contribute to the repo on a Windows machine, I suggest using a virtual linux environment and following the steps below for installation for Ubuntu.

### Ubuntu 16.04+
1. Anaconda / Miniconda

Download [Miniconda3](https://docs.conda.io/en/latest/miniconda.html) or Anaconda3.
- Installing Miniconda3.
```
cd /path/to/downloaded/script
chmod +x ./Miniconda3.sh
./Miniconda3.sh
```

2. GDAL Environment
 
- Create the gdal environment.
```
conda create -n gdal
conda activate gdal
```
- Install gdal using conda
```
conda config --env --add channels conda-forge
conda install -c conda-forge gdal
```

3. ISIS 3 ( Cannot be installed on Windows )
 
- Create the isis environment *Note: Python 3.6*.
```
conda create -n isis python=3.6
conda activate isis
```

- Install ISIS Version 3.10.2 or any version you want. *Note: Origionally Developed with ISIS v3.10.2*
```
conda config --env --add channels conda-forge
conda config --env --add channels usgs-astrogeology
conda install -c usgs-astrogeology isis=3.10.2
``` 
- You will need some data for ISIS before you can run any ISIS applications. At [this link](https://github.com/USGS-Astrogeology/ISIS3#partial-download-of-isis-base-data) you can find all the command you can run to install any data collection at the USGS's disposal.

4. NodeJS

Installing on Ubuntu is very simple. Just update your package set and then install the libraries with apt. *nodejs* contains all the executable and server side functionality while *npm* helps with dependencies.
```
sudo apt update
sudo apt install nodejs
sudo apt install npm
```

5. Source Code & Dependencies

This can either be done using git or by downloading the source zip. I am demonstrating how to use git.
- Pull the code down with *git*.
```
git clone https://github.com/ChaddFrasier/PIE.git
cd /path/to/PIE
```
- Install dependencies.
```
# install all development dependencies
npm install 

# or install with production dependencies only
npm install --only=proc
```

## Running
1. Activate ISIS and then activate GDAL on top of the ISIS environment.
```
conda activate isis && conda activate --stack gdal
lowpass -h && gdal_translate -h
```

2. Start the server code in production mode.
```
npm start
```

or you can start the code in debug mode `debug:win` for windows users and `debug:mac` for MacOS users.
```
npm run debug:win
```

## Contribute
Pull the repository down to your own branch, make your changes and then push the branch. Repository managers will merge or reject your changes within a week.

#### Running Tests
*In order to run tests you need to install development dependencies.*

Run the cypress command to start the testing UI.
```
npm run cy:dev
```
-----------------------
[USGS-Astrogeology](https://www.usgs.gov/centers/astrogeology-science-center) | [Docker Container](https://hub.docker.com/repository/docker/chaddfrasier/pie-usgs)