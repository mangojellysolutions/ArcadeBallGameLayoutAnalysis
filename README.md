# Playfield Layout Analyser
Very simple layout analysis to allow output of normalised X,Y coordinates in JSON format for building mechanical arcade ball games such as 'Ice Cold Beer'. Project also contains layout, images and plans of original cabinet and game.

## Prerequisite 
To load the index htm it needs to be accessed from a web-server due to access to the layout image so you will need to run from a simple http server such as using the a one liner from a terminal such as:

$ python -m SimpleHTTPServer 8000

Obviously this will need python installed.

$ sudo apt install python

Other http servers that can be run from a terminal with a single line can be found at https://gist.github.com/willurd/5720255

## Installation
1. Clone the repo 
2. Open a terminal and cd to the ArcadeBallGameLayoutAnalysis 
3. Run the http server one-liner i.e. $ python -m SimpleHTTPServer 8000 
4. Open up a browser window and navigate to http://localhost:8000/index.html (Replace the port with the port you have supplied). 

## Usage
The index page will load the main application. On the right you will see the layout of the board which has been loaded from the Layouts directory and on the left a accordion with options.

The first option "Layout" contains a list of all the layouts available (currently only "ice cold beer").

The second option "Preview" contains a preview of the selected layout.

The third option "Dimensions" contains a drop-down to select "Normalised": Allowing a normalised result to be multiplied with any base width or height applicable to the end application. "Custom": Will enable the width and height input boxes to allow a value in millimetres to be entered for the base width and height of the end application to be entered and all hole locations will be calculated using these.

The fourth option "Output" contains a number of drop-downs to select the output format (at the moment only JSON is available), the colour holes that you want to calculate positions for. It also contains the button to create the output which will be written to the textarea within.
